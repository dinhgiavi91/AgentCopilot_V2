-- Pilot Step 5 — Business & Measurement Layer.
-- Customer PII is never accepted. Account data is restricted to authenticated Pilot roles.

alter table public.profiles
  add column if not exists xp_balance integer not null default 0 check (xp_balance >= 0),
  add column if not exists onboarding_completed_at timestamptz;

-- Leaders receive the requested monthly pilot allocation; Advisor allocations remain Admin-configurable.
update public.profiles
set xp_balance = 5000
where role = 'leader' and xp_balance = 0;

alter table public.xp_gifts
  add column if not exists idempotency_key uuid not null default gen_random_uuid(),
  add column if not exists community_posted boolean not null default false;

create unique index if not exists xp_gifts_giver_idempotency_idx
  on public.xp_gifts(giver_id, idempotency_key);

alter table public.xp_ledger
  add column if not exists source_gift_id uuid references public.xp_gifts(id) on delete set null;

create unique index if not exists xp_ledger_gift_amount_idx
  on public.xp_ledger(source_gift_id, user_id, xp_amount)
  where source_gift_id is not null;

create or replace function public.list_team_gift_recipients_v1()
returns table(id uuid, display_name text, role public.pilot_role)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.display_name, p.role
  from public.profiles p
  where p.primary_team_id = (select private.current_team_id())
    and p.is_active = true
    and p.id <> (select auth.uid())
  order by case p.role when 'leader' then 0 when 'advisor' then 1 else 2 end, p.display_name;
$$;

revoke all on function public.list_team_gift_recipients_v1() from public;
revoke execute on function public.list_team_gift_recipients_v1() from anon;
grant execute on function public.list_team_gift_recipients_v1() to authenticated;

create or replace function public.gift_team_xp_v2(
  p_recipient_id uuid,
  p_amount integer,
  p_note text,
  p_publish_to_community boolean default false,
  p_idempotency_key uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_giver_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_balance integer;
  v_recipient_xp integer;
  v_gift_id uuid;
  v_post_id uuid;
  v_existing jsonb;
  v_post_body text;
begin
  if v_giver_id is null or v_team_id is null then
    raise exception 'Hãy đăng nhập tài khoản Pilot hợp lệ.' using errcode = '42501';
  end if;
  if p_recipient_id is null or p_recipient_id = v_giver_id then
    raise exception 'Hãy chọn một đồng đội khác để tặng XP.' using errcode = '22023';
  end if;
  if p_amount is null or p_amount not between 1 and 5000 then
    raise exception 'XP tặng phải nằm trong khoảng 1 đến 5000.' using errcode = '22023';
  end if;
  if p_note is null or char_length(trim(p_note)) not between 4 and 240
     or p_note ~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})' then
    raise exception 'Lời vinh danh phải dài 4–240 ký tự và không chứa PII.' using errcode = '22023';
  end if;
  if not private.user_belongs_to_team(p_recipient_id, v_team_id) then
    raise exception 'Người nhận không thuộc Team hiện tại.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'gift_id', g.id,
    'giver_remaining_xp_budget', (select xp_balance from public.profiles where id = g.giver_id),
    'recipient_total_xp', (select total_xp from public.users_profile where user_id = g.recipient_id),
    'community_post_id', g.post_id,
    'idempotent', true
  ) into v_existing
  from public.xp_gifts g
  where g.giver_id = v_giver_id and g.idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;

  select xp_balance into v_balance from public.profiles where id = v_giver_id for update;
  if coalesce(v_balance, 0) < p_amount then
    raise exception 'Quỹ XP hiện không đủ cho lần tặng này.' using errcode = '22023';
  end if;

  insert into public.users_profile (user_id) values (p_recipient_id)
  on conflict (user_id) do nothing;
  select total_xp into v_recipient_xp from public.users_profile where user_id = p_recipient_id for update;

  if p_publish_to_community then
    select concat('Vinh danh đồng đội: ', trim(p_note), ' · +', p_amount, ' XP') into v_post_body;
    insert into public.community_posts (team_id, author_id, author_role, body)
    values (v_team_id, v_giver_id, (select role from public.profiles where id = v_giver_id), v_post_body)
    returning id into v_post_id;
  end if;

  insert into public.xp_gifts (team_id, giver_id, recipient_id, post_id, xp_amount, note, idempotency_key, community_posted)
  values (v_team_id, v_giver_id, p_recipient_id, v_post_id, p_amount, trim(p_note), p_idempotency_key, p_publish_to_community)
  returning id into v_gift_id;

  update public.profiles set xp_balance = xp_balance - p_amount where id = v_giver_id;
  update public.users_profile set total_xp = total_xp + p_amount where user_id = p_recipient_id;
  insert into public.xp_ledger (user_id, xp_amount, reason, source_gift_id)
  values (p_recipient_id, p_amount, 'manual_adjustment', v_gift_id);

  return jsonb_build_object(
    'gift_id', v_gift_id,
    'giver_remaining_xp_budget', v_balance - p_amount,
    'recipient_total_xp', coalesce(v_recipient_xp, 0) + p_amount,
    'community_post_id', v_post_id,
    'idempotent', false
  );
end;
$$;

revoke all on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) from public;
revoke execute on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) from anon;
grant execute on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) to authenticated;

create or replace function public.complete_advisor_onboarding_v1()
returns timestamptz
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare v_completed_at timestamptz;
begin
  if private.current_profile_role() <> 'advisor'::public.pilot_role then
    raise exception 'Onboarding này chỉ dành cho TVV Pilot.' using errcode = '42501';
  end if;
  update public.profiles
  set onboarding_completed_at = coalesce(onboarding_completed_at, now())
  where id = auth.uid()
  returning onboarding_completed_at into v_completed_at;
  return v_completed_at;
end;
$$;

revoke all on function public.complete_advisor_onboarding_v1() from public;
revoke execute on function public.complete_advisor_onboarding_v1() from anon;
grant execute on function public.complete_advisor_onboarding_v1() to authenticated;

create or replace function public.get_pilot_measurement_scorecard_v1()
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, private
as $$
declare
  v_week_start timestamptz := date_trunc('week', now());
  v_total_active integer;
  v_acted integer;
  v_tti numeric;
  v_d7_total integer;
  v_d7_recovered integer;
  v_journeys jsonb;
begin
  if not private.is_super_admin() then
    raise exception 'Measurement Scorecard chỉ dành cho Super Admin Pilot.' using errcode = '42501';
  end if;
  select count(*) into v_total_active from public.signals where status in ('new', 'reviewed', 'acted_on');
  select count(*) into v_acted from public.signals where status = 'acted_on';
  select round(avg(extract(epoch from (i.created_at - s.detected_at)) / 3600)::numeric, 1)
  into v_tti
  from public.interventions i join public.signals s on s.id = i.signal_id
  where i.action_status = 'done';
  select count(*), count(*) filter (where recovery_status = 'recovered')
  into v_d7_total, v_d7_recovered
  from public.intervention_outcomes where checkpoint_day = 'd7';
  select coalesce(jsonb_agg(item order by (item->>'detected_at') desc), '[]'::jsonb) into v_journeys
  from (
    select jsonb_build_object(
      'signal_id', s.id,
      'advisor', p.display_name,
      'team', t.name,
      'signal_type', s.signal_type,
      'severity', s.severity,
      'summary', s.summary,
      'detected_at', s.detected_at,
      'signal_status', s.status,
      'intervention_type', i.intervention_type,
      'action_status', i.action_status,
      'action_date', i.action_date,
      'leader', leader.display_name,
      'd7_outcome', o.recovery_status,
      'measured_at', o.measured_at
    ) as item
    from public.signals s
    join public.profiles p on p.id = s.user_id
    join public.teams t on t.id = s.team_id
    left join lateral (
      select * from public.interventions x where x.signal_id = s.id order by x.created_at desc limit 1
    ) i on true
    left join public.profiles leader on leader.id = i.leader_id
    left join lateral (
      select * from public.intervention_outcomes x where x.intervention_id = i.id and x.checkpoint_day = 'd7' order by x.measured_at desc limit 1
    ) o on true
    order by s.detected_at desc limit 50
  ) journeys;
  return jsonb_build_object(
    'week_start', v_week_start,
    'total_active_signals', v_total_active,
    'acted_signals', v_acted,
    'intervention_rate', case when v_total_active = 0 then 0 else round(v_acted::numeric / v_total_active * 100, 1) end,
    'time_to_intervention_hours', coalesce(v_tti, 0),
    'd7_outcome_count', v_d7_total,
    'd7_recovered_count', v_d7_recovered,
    'd7_recovery_rate', case when v_d7_total = 0 then 0 else round(v_d7_recovered::numeric / v_d7_total * 100, 1) end,
    'journeys', v_journeys
  );
end;
$$;

revoke all on function public.get_pilot_measurement_scorecard_v1() from public;
revoke execute on function public.get_pilot_measurement_scorecard_v1() from anon;
grant execute on function public.get_pilot_measurement_scorecard_v1() to authenticated;
