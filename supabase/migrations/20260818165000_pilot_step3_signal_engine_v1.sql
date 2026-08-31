-- Agent Copilot Pilot MVP — Step 3
-- Server-side Signal Engine V1. The browser can only invoke this RPC; all
-- candidate evaluation and Signal creation happens inside Postgres.

create table if not exists public.signal_engine_rule_configs (
  rule_key text primary key check (rule_key in ('activity_drop', 'followup_gap')),
  is_enabled boolean not null default true,
  evaluation_window_hours integer not null check (evaluation_window_hours between 1 and 8760),
  severity public.pilot_signal_severity not null,
  threshold_version text not null check (char_length(trim(threshold_version)) between 1 and 80),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.signal_engine_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_by uuid not null references public.profiles(id) on delete restrict,
  dry_run boolean not null default true,
  evaluated_at timestamptz not null default now(),
  run_parameters jsonb not null default '{}'::jsonb check (jsonb_typeof(run_parameters) = 'object'),
  candidate_count integer not null default 0 check (candidate_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists signal_engine_runs_triggered_at_idx on public.signal_engine_runs (triggered_by, evaluated_at desc);
create index if not exists signals_unresolved_idempotency_idx on public.signals (user_id, signal_type, window_days)
  where status in ('new', 'reviewed');

insert into public.signal_engine_rule_configs (rule_key, is_enabled, evaluation_window_hours, severity, threshold_version)
values
  ('activity_drop', true, 168, 'medium', 'v1.0.0'),
  ('followup_gap', true, 24, 'high', 'v1.0.0')
on conflict (rule_key) do nothing;

alter table public.signal_engine_rule_configs enable row level security;
alter table public.signal_engine_runs enable row level security;

grant select, insert, update on public.signal_engine_rule_configs to authenticated;
grant select on public.signal_engine_runs to authenticated;
grant all privileges on public.signal_engine_rule_configs, public.signal_engine_runs to service_role;

drop policy if exists signal_engine_rule_configs_super_admin on public.signal_engine_rule_configs;
create policy signal_engine_rule_configs_super_admin on public.signal_engine_rule_configs for all to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

drop policy if exists signal_engine_runs_super_admin_select on public.signal_engine_runs;
create policy signal_engine_runs_super_admin_select on public.signal_engine_runs for select to authenticated
  using ((select private.is_super_admin()));

drop policy if exists signal_engine_runs_super_admin_insert on public.signal_engine_runs;
create policy signal_engine_runs_super_admin_insert on public.signal_engine_runs for insert to authenticated
  with check ((select private.is_super_admin()) and triggered_by = (select auth.uid()));

create or replace function public.run_signal_engine_v1(p_dry_run boolean default true)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
declare
  v_now timestamptz := now();
  v_activity_config public.signal_engine_rule_configs%rowtype;
  v_followup_config public.signal_engine_rule_configs%rowtype;
  v_window_days integer;
  v_candidate record;
  v_activity_candidates integer := 0;
  v_followup_candidates integer := 0;
  v_activity_created integer := 0;
  v_followup_created integer := 0;
  v_run_id uuid;
begin
  if not private.is_super_admin() then
    raise exception 'Signal Engine chỉ dành cho Super Admin Pilot.' using errcode = '42501';
  end if;

  select * into v_activity_config
  from public.signal_engine_rule_configs
  where rule_key = 'activity_drop';

  select * into v_followup_config
  from public.signal_engine_rule_configs
  where rule_key = 'followup_gap';

  if v_activity_config.rule_key is null or v_followup_config.rule_key is null then
    raise exception 'Thiếu cấu hình Signal Engine V1.' using errcode = 'P0001';
  end if;

  if v_activity_config.is_enabled then
    v_window_days := greatest(1, ceil(v_activity_config.evaluation_window_hours / 24.0)::integer);
    for v_candidate in
      select p.id, p.primary_team_id
      from public.profiles p
      join public.teams t on t.id = p.primary_team_id and t.status = 'active'
      where p.role = 'advisor'
        and p.is_active = true
        and not exists (
          select 1
          from public.activity_events e
          where e.user_id = p.id
            and e.event_timestamp >= v_now - make_interval(hours => v_activity_config.evaluation_window_hours)
            and e.event_type <> 'other'::public.pilot_activity_event_type
        )
    loop
      v_activity_candidates := v_activity_candidates + 1;
      if not exists (
        select 1
        from public.signals s
        where s.user_id = v_candidate.id
          and s.signal_type = 'low_activity'::public.pilot_signal_type
          and s.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status)
          and coalesce(nullif(s.metadata ->> 'evaluation_window_hours', '')::integer, s.window_days * 24) = v_activity_config.evaluation_window_hours
      ) then
        if not p_dry_run then
          insert into public.signals (
            user_id, team_id, signal_type, window_days, threshold_version, severity, summary, metadata
          ) values (
            v_candidate.id,
            v_candidate.primary_team_id,
            'low_activity'::public.pilot_signal_type,
            v_window_days,
            v_activity_config.threshold_version,
            v_activity_config.severity,
            format('Không có Nhịp Đập đủ điều kiện trong %s giờ gần nhất.', v_activity_config.evaluation_window_hours),
            jsonb_build_object(
              'rule_key', 'activity_drop',
              'evaluation_window_hours', v_activity_config.evaluation_window_hours,
              'threshold_version', v_activity_config.threshold_version,
              'evaluated_at', v_now,
              'qualifying_activity_count', 0
            )
          );
          v_activity_created := v_activity_created + 1;
        end if;
      end if;
    end loop;
  end if;

  if v_followup_config.is_enabled then
    v_window_days := greatest(1, ceil(v_followup_config.evaluation_window_hours / 24.0)::integer);
    for v_candidate in
      select
        p.id,
        p.primary_team_id,
        count(f.id)::integer as overdue_followup_count,
        min(f.due_date) as oldest_due_date
      from public.profiles p
      join public.teams t on t.id = p.primary_team_id and t.status = 'active'
      join public.followups f on f.user_id = p.id and f.team_id = p.primary_team_id
      where p.role = 'advisor'
        and p.is_active = true
        and f.status in ('open'::public.pilot_followup_status, 'overdue'::public.pilot_followup_status)
        and (f.due_date::timestamp at time zone 'UTC') < v_now - make_interval(hours => v_followup_config.evaluation_window_hours)
      group by p.id, p.primary_team_id
    loop
      v_followup_candidates := v_followup_candidates + 1;
      if not exists (
        select 1
        from public.signals s
        where s.user_id = v_candidate.id
          and s.signal_type = 'followup_overdue'::public.pilot_signal_type
          and s.status in ('new'::public.pilot_signal_status, 'reviewed'::public.pilot_signal_status)
          and coalesce(nullif(s.metadata ->> 'evaluation_window_hours', '')::integer, s.window_days * 24) = v_followup_config.evaluation_window_hours
      ) then
        if not p_dry_run then
          insert into public.signals (
            user_id, team_id, signal_type, window_days, threshold_version, severity, summary, metadata
          ) values (
            v_candidate.id,
            v_candidate.primary_team_id,
            'followup_overdue'::public.pilot_signal_type,
            v_window_days,
            v_followup_config.threshold_version,
            v_followup_config.severity,
            format('%s Follow-up đã quá hạn vượt ngưỡng %s giờ.', v_candidate.overdue_followup_count, v_followup_config.evaluation_window_hours),
            jsonb_build_object(
              'rule_key', 'followup_gap',
              'evaluation_window_hours', v_followup_config.evaluation_window_hours,
              'threshold_version', v_followup_config.threshold_version,
              'evaluated_at', v_now,
              'followups_overdue', v_candidate.overdue_followup_count,
              'oldest_due_date', v_candidate.oldest_due_date
            )
          );
          v_followup_created := v_followup_created + 1;
        end if;
      end if;
    end loop;
  end if;

  insert into public.signal_engine_runs (
    triggered_by, dry_run, evaluated_at, run_parameters, candidate_count, created_count
  ) values (
    auth.uid(),
    p_dry_run,
    v_now,
    jsonb_build_object(
      'activity_drop', jsonb_build_object(
        'enabled', v_activity_config.is_enabled,
        'evaluation_window_hours', v_activity_config.evaluation_window_hours,
        'threshold_version', v_activity_config.threshold_version
      ),
      'followup_gap', jsonb_build_object(
        'enabled', v_followup_config.is_enabled,
        'evaluation_window_hours', v_followup_config.evaluation_window_hours,
        'threshold_version', v_followup_config.threshold_version
      )
    ),
    v_activity_candidates + v_followup_candidates,
    v_activity_created + v_followup_created
  ) returning id into v_run_id;

  return jsonb_build_object(
    'run_id', v_run_id,
    'dry_run', p_dry_run,
    'evaluated_at', v_now,
    'candidate_count', v_activity_candidates + v_followup_candidates,
    'created_count', v_activity_created + v_followup_created,
    'activity_drop_candidates', v_activity_candidates,
    'followup_gap_candidates', v_followup_candidates,
    'activity_drop_created', v_activity_created,
    'followup_gap_created', v_followup_created,
    'threshold_versions', jsonb_build_object(
      'activity_drop', v_activity_config.threshold_version,
      'followup_gap', v_followup_config.threshold_version
    )
  );
end;
$$;

revoke all on function public.run_signal_engine_v1(boolean) from public;
revoke execute on function public.run_signal_engine_v1(boolean) from anon;
grant execute on function public.run_signal_engine_v1(boolean) to authenticated;
