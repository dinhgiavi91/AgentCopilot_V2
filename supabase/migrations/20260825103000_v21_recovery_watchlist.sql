-- V21: Read-only recovery watchlist for Leaders, built from existing intervention/outcome records.
-- This introduces no XP balance table and exposes only Team-scoped operational display names already used by Radar.

create or replace function public.get_team_recovery_watchlist_v1()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_team_id uuid;
  v_payload jsonb;
begin
  if v_actor_id is null then
    raise exception 'Authentication is required';
  end if;

  select lower(p.role::text), p.primary_team_id
    into v_role, v_team_id
  from public.profiles p
  where p.id = v_actor_id;

  if v_role not in ('leader', 'super_admin') then
    raise exception 'Recovery Watchlist is restricted to Leader or Super Admin';
  end if;

  with scoped_interventions as (
    select i.*
    from public.interventions i
    where i.action_status <> 'cancelled'
      and (v_role = 'super_admin' or i.team_id = v_team_id)
  ), latest_outcomes as (
    select distinct on (o.intervention_id)
      o.intervention_id,
      o.recovery_status::text as recovery_status,
      o.measured_at
    from public.intervention_outcomes o
    join scoped_interventions i on i.id = o.intervention_id
    order by o.intervention_id, o.checkpoint_day desc, o.measured_at desc
  ), watchlist as (
    select
      i.id,
      coalesce(nullif(p.display_name, ''), 'TVV trong Team') as member_name,
      coalesce(s.signal_type::text, 'support') as signal_type,
      coalesce(nullif(s.summary, ''), 'Ca hỗ trợ được ghi nhận') as signal_summary,
      i.intervention_type::text as intervention_type,
      i.action_status::text as action_status,
      i.action_date,
      lo.recovery_status,
      lo.measured_at,
      i.created_at
    from scoped_interventions i
    join public.profiles p on p.id = i.user_id
    left join public.signals s on s.id = i.signal_id
    left join latest_outcomes lo on lo.intervention_id = i.id
    order by coalesce(lo.measured_at, i.created_at) desc
    limit 30
  ), totals as (
    select
      count(*)::integer as total_interventions,
      count(*) filter (where recovery_status = 'recovered')::integer as recovered_count,
      count(*) filter (where recovery_status is not null and recovery_status <> 'insufficient_data')::integer as measurable_outcomes
    from watchlist
  )
  select jsonb_build_object(
    'total_interventions', totals.total_interventions,
    'recovered_count', totals.recovered_count,
    'measurable_outcomes', totals.measurable_outcomes,
    'recovery_rate', case when totals.measurable_outcomes > 0 then round((totals.recovered_count::numeric / totals.measurable_outcomes::numeric) * 100) else null end,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id,
      'member_name', member_name,
      'signal_type', signal_type,
      'signal_summary', signal_summary,
      'intervention_type', intervention_type,
      'action_status', action_status,
      'action_date', action_date,
      'recovery_status', coalesce(recovery_status, case when action_status = 'planned' then 'monitoring' else 'pending_measurement' end),
      'measured_at', measured_at
    ) order by coalesce(measured_at, created_at) desc) from watchlist), '[]'::jsonb)
  ) into v_payload
  from totals;

  return v_payload;
end;
$$;

revoke all on function public.get_team_recovery_watchlist_v1() from public, anon;
grant execute on function public.get_team_recovery_watchlist_v1() to authenticated;
