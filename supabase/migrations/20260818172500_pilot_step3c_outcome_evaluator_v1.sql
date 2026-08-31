-- Pilot Step 3C — Outcome Checkpoint Engine V1.
-- The browser may only invoke this guarded RPC. Candidate selection, recovery evaluation
-- and idempotent outcome writes run inside Postgres with the caller's RLS identity.

create table if not exists public.outcome_evaluator_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_by uuid not null references public.profiles(id) on delete restrict,
  dry_run boolean not null default true,
  checkpoint_day public.pilot_checkpoint_day not null,
  checkpoint_hours integer not null check (checkpoint_hours between 1 and 8760),
  evaluated_at timestamptz not null default now(),
  run_parameters jsonb not null default '{}'::jsonb check (jsonb_typeof(run_parameters) = 'object'),
  candidate_count integer not null default 0 check (candidate_count >= 0),
  recovered_count integer not null default 0 check (recovered_count >= 0),
  not_recovered_count integer not null default 0 check (not_recovered_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists outcome_evaluator_runs_triggered_at_idx
  on public.outcome_evaluator_runs (triggered_by, evaluated_at desc);

alter table public.outcome_evaluator_runs enable row level security;

grant select, insert on public.outcome_evaluator_runs to authenticated;
grant all privileges on public.outcome_evaluator_runs to service_role;

drop policy if exists outcome_evaluator_runs_super_admin_select on public.outcome_evaluator_runs;
create policy outcome_evaluator_runs_super_admin_select on public.outcome_evaluator_runs for select to authenticated
  using ((select private.is_super_admin()));

drop policy if exists outcome_evaluator_runs_super_admin_insert on public.outcome_evaluator_runs;
create policy outcome_evaluator_runs_super_admin_insert on public.outcome_evaluator_runs for insert to authenticated
  with check ((select private.is_super_admin()) and triggered_by = (select auth.uid()));

create or replace function public.run_outcome_evaluator_v1(
  p_checkpoint_day public.pilot_checkpoint_day default 'd1'::public.pilot_checkpoint_day,
  p_checkpoint_hours integer default 24,
  p_dry_run boolean default true
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
declare
  v_now timestamptz := now();
  v_candidate record;
  v_action_at timestamptz;
  v_has_activity boolean;
  v_has_completed_followup boolean;
  v_recovery_status public.pilot_recovery_status;
  v_candidate_count integer := 0;
  v_recovered_count integer := 0;
  v_not_recovered_count integer := 0;
  v_created_count integer := 0;
  v_run_id uuid;
begin
  if not private.is_super_admin() then
    raise exception 'Outcome Evaluator chỉ dành cho Super Admin Pilot.' using errcode = '42501';
  end if;

  if p_checkpoint_hours is null or p_checkpoint_hours < 1 or p_checkpoint_hours > 8760 then
    raise exception 'Ngưỡng checkpoint phải nằm trong khoảng 1 đến 8760 giờ.' using errcode = '22023';
  end if;

  for v_candidate in
    select i.id, i.user_id, i.team_id, i.action_date
    from public.interventions i
    where i.action_status = 'done'::public.pilot_intervention_status
      and v_now > ((i.action_date::timestamp at time zone 'UTC') + make_interval(hours => p_checkpoint_hours))
      and not exists (
        select 1
        from public.intervention_outcomes o
        where o.intervention_id = i.id
          and o.checkpoint_day = p_checkpoint_day
      )
    order by i.action_date asc, i.created_at asc
  loop
    v_candidate_count := v_candidate_count + 1;
    v_action_at := v_candidate.action_date::timestamp at time zone 'UTC';

    select exists (
      select 1
      from public.activity_events e
      where e.user_id = v_candidate.user_id
        and e.team_id = v_candidate.team_id
        and e.event_timestamp > v_action_at
    ) into v_has_activity;

    select exists (
      select 1
      from public.followups f
      where f.user_id = v_candidate.user_id
        and f.team_id = v_candidate.team_id
        and f.status = 'done'::public.pilot_followup_status
        and f.completed_at > v_action_at
    ) into v_has_completed_followup;

    v_recovery_status := case
      when v_has_activity or v_has_completed_followup then 'recovered'::public.pilot_recovery_status
      else 'not_recovered'::public.pilot_recovery_status
    end;

    if v_recovery_status = 'recovered'::public.pilot_recovery_status then
      v_recovered_count := v_recovered_count + 1;
    else
      v_not_recovered_count := v_not_recovered_count + 1;
    end if;

    if not p_dry_run then
      insert into public.intervention_outcomes (
        intervention_id, checkpoint_day, recovery_status, note, measured_at
      ) values (
        v_candidate.id,
        p_checkpoint_day,
        v_recovery_status,
        format(
          'Outcome Evaluator V1: activity_after_action=%s; completed_followup_after_action=%s; checkpoint_hours=%s.',
          v_has_activity,
          v_has_completed_followup,
          p_checkpoint_hours
        ),
        v_now
      ) on conflict (intervention_id, checkpoint_day) do nothing;

      if found then
        v_created_count := v_created_count + 1;
      end if;
    end if;
  end loop;

  insert into public.outcome_evaluator_runs (
    triggered_by,
    dry_run,
    checkpoint_day,
    checkpoint_hours,
    evaluated_at,
    run_parameters,
    candidate_count,
    recovered_count,
    not_recovered_count,
    created_count
  ) values (
    auth.uid(),
    p_dry_run,
    p_checkpoint_day,
    p_checkpoint_hours,
    v_now,
    jsonb_build_object(
      'engine_version', 'v1.0.0',
      'recovery_rule', 'activity_event_or_completed_followup_strictly_after_action_date',
      'checkpoint_day', p_checkpoint_day,
      'checkpoint_hours', p_checkpoint_hours
    ),
    v_candidate_count,
    v_recovered_count,
    v_not_recovered_count,
    v_created_count
  ) returning id into v_run_id;

  return jsonb_build_object(
    'run_id', v_run_id,
    'dry_run', p_dry_run,
    'checkpoint_day', p_checkpoint_day,
    'checkpoint_hours', p_checkpoint_hours,
    'evaluated_at', v_now,
    'candidate_count', v_candidate_count,
    'recovered_count', v_recovered_count,
    'not_recovered_count', v_not_recovered_count,
    'created_count', v_created_count
  );
end;
$$;

revoke all on function public.run_outcome_evaluator_v1(public.pilot_checkpoint_day, integer, boolean) from public;
revoke execute on function public.run_outcome_evaluator_v1(public.pilot_checkpoint_day, integer, boolean) from anon;
grant execute on function public.run_outcome_evaluator_v1(public.pilot_checkpoint_day, integer, boolean) to authenticated;
