-- V29: read-only operational drill-down and Heartbeat hierarchy. No customer PII is returned.

create or replace function public.get_team_operational_radar_v1(p_team_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_primary_team_id uuid;
  v_payload jsonb;
begin
  select p.role::text, p.primary_team_id into v_role, v_primary_team_id from public.profiles p where p.id = v_actor_id;
  if v_actor_id is null or v_role not in ('super_admin', 'director', 'leader') then
    raise exception 'Operational Radar requires Leader, Director or Super Admin.' using errcode = '42501';
  end if;
  if p_team_id is null then raise exception 'A Team is required.' using errcode = '22023'; end if;
  if v_role = 'leader' and p_team_id <> v_primary_team_id then
    raise exception 'Leader can only inspect their direct Team.' using errcode = '42501';
  end if;
  if v_role = 'director' and p_team_id <> v_primary_team_id and not exists (select 1 from public.teams t where t.id = p_team_id and t.parent_team_id = v_primary_team_id) then
    raise exception 'Director can only inspect their GA Team or direct child Teams.' using errcode = '42501';
  end if;

  with team_info as (
    select t.id, t.name from public.teams t where t.id = p_team_id
  ), metrics as (
    select
      (select count(*)::integer from public.profiles p where p.primary_team_id = p_team_id and p.role = 'advisor' and p.is_active) as active_advisors,
      (select count(*)::integer from public.activity_events a where a.team_id = p_team_id and a.event_timestamp >= (current_timestamp - interval '7 days')) as touches_7d,
      (select count(*)::integer from public.followups f where f.team_id = p_team_id and f.status in ('open', 'overdue')) as open_followups,
      (select count(*)::integer from public.signals s where s.team_id = p_team_id and s.status = 'new') as new_signals,
      (select count(*)::integer from public.interventions i where i.team_id = p_team_id and i.created_at >= (current_timestamp - interval '7 days')) as interventions_7d
  ), signals as (
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'member_name', coalesce(nullif(p.display_name, ''), 'TVV trong Team'),
      'signal_type', s.signal_type, 'severity', s.severity, 'summary', s.summary,
      'status', s.status, 'detected_at', s.detected_at
    ) order by case s.severity when 'critical' then 0 when 'high' then 1 when 'medium' then 2 else 3 end, s.detected_at desc) as rows
    from (select * from public.signals where team_id = p_team_id order by detected_at desc limit 10) s
    left join public.profiles p on p.id = s.user_id
  ) select jsonb_build_object(
    'team_id', team_info.id, 'team_name', team_info.name,
    'active_advisors', metrics.active_advisors, 'touches_7d', metrics.touches_7d,
    'open_followups', metrics.open_followups, 'new_signals', metrics.new_signals,
    'interventions_7d', metrics.interventions_7d, 'signals', coalesce(signals.rows, '[]'::jsonb)
  ) into v_payload from team_info cross join metrics cross join signals;
  if v_payload is null then raise exception 'Team not found.' using errcode = 'P0002'; end if;
  return v_payload;
end;
$$;

create or replace function public.get_heartbeat_hierarchy_v1(p_team_id uuid default null, p_user_id uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_primary_team_id uuid;
  v_target_team_id uuid;
  v_allowed_team_ids uuid[];
  v_payload jsonb;
begin
  select p.role::text, p.primary_team_id into v_role, v_primary_team_id from public.profiles p where p.id = v_actor_id;
  if v_actor_id is null or v_role is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;

  if v_role = 'super_admin' then
    select coalesce(array_agg(t.id), array[]::uuid[]) into v_allowed_team_ids from public.teams t;
  elsif v_role = 'director' then
    select coalesce(array_agg(t.id), array[]::uuid[]) into v_allowed_team_ids from public.teams t where t.id = v_primary_team_id or t.parent_team_id = v_primary_team_id;
  else
    v_allowed_team_ids := array[v_primary_team_id];
  end if;
  if cardinality(v_allowed_team_ids) = 0 then raise exception 'No Team scope is available.' using errcode = '42501'; end if;
  if p_team_id is not null and not (p_team_id = any(v_allowed_team_ids)) then raise exception 'Selected Team is outside your Heartbeat scope.' using errcode = '42501'; end if;

  if p_user_id is not null then
    select p.primary_team_id into v_target_team_id from public.profiles p where p.id = p_user_id and p.is_active;
    if v_target_team_id is null or not (v_target_team_id = any(v_allowed_team_ids)) then raise exception 'Selected user is outside your Heartbeat scope.' using errcode = '42501'; end if;
    if v_role = 'advisor' and p_user_id <> v_actor_id then raise exception 'Advisor can only inspect own Heartbeat.' using errcode = '42501'; end if;
    if p_team_id is not null and v_target_team_id <> p_team_id then raise exception 'Selected user does not belong to selected Team.' using errcode = '22023'; end if;
  end if;

  with scoped_teams as (
    select t.id, t.name from public.teams t where t.id = any(v_allowed_team_ids) and (p_team_id is null or t.id = p_team_id)
  ), scoped_users as (
    select p.id, p.display_name, p.primary_team_id from public.profiles p
    where p.is_active and p.primary_team_id in (select id from scoped_teams) and (p_user_id is null or p.id = p_user_id)
  ), log_rows as (
    select d.log_id, d.user_id, u.display_name, u.primary_team_id, t.name as team_name,
      d.service_level, d.action_result, d.follow_up_date, d.revenue_amount, d.created_at
    from public.daily_logs d join scoped_users u on u.id = d.user_id join scoped_teams t on t.id = u.primary_team_id
    order by d.created_at desc limit 100
  ), summary as (
    select count(*)::integer as total_logs, count(*) filter (where action_result not in ('Dời lịch', 'Hủy'))::integer as completed_interactions,
      count(*) filter (where action_result in ('Ký Hợp Đồng', 'Chốt HĐ'))::integer as closed_deals
    from log_rows
  ) select jsonb_build_object(
    'scope', case when v_role = 'advisor' then 'self' when v_role = 'leader' then 'team' when v_role = 'director' then 'agency' else 'global' end,
    'teams', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by name) from scoped_teams), '[]'::jsonb),
    'users', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'display_name', display_name, 'team_id', primary_team_id) order by display_name) from scoped_users), '[]'::jsonb),
    'logs', coalesce((select jsonb_agg(jsonb_build_object('id', log_id, 'user_id', user_id, 'display_name', display_name, 'team_id', primary_team_id, 'team_name', team_name, 'service_level', service_level, 'action_result', action_result, 'follow_up_date', follow_up_date, 'revenue_amount', revenue_amount, 'created_at', created_at) order by created_at desc) from log_rows), '[]'::jsonb),
    'summary', jsonb_build_object('total_logs', summary.total_logs, 'completed_interactions', summary.completed_interactions, 'closed_deals', summary.closed_deals)
  ) into v_payload from summary;
  return v_payload;
end;
$$;

revoke all on function public.get_team_operational_radar_v1(uuid) from public, anon;
grant execute on function public.get_team_operational_radar_v1(uuid) to authenticated;
revoke all on function public.get_heartbeat_hierarchy_v1(uuid, uuid) from public, anon;
grant execute on function public.get_heartbeat_hierarchy_v1(uuid, uuid) to authenticated;
