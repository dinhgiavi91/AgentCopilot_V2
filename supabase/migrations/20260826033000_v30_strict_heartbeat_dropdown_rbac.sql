-- V30: Manager selectors only return subordinates; crafted RPC requests follow the same hierarchy.

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
  v_target_role text;
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
  if v_role = 'advisor' and p_user_id is null then p_user_id := v_actor_id; end if;
  if p_team_id is not null and not (p_team_id = any(v_allowed_team_ids)) then raise exception 'Selected Team is outside your Heartbeat scope.' using errcode = '42501'; end if;
  if p_user_id is not null then
    select p.primary_team_id, p.role::text into v_target_team_id, v_target_role from public.profiles p where p.id = p_user_id and p.is_active;
    if v_target_team_id is null or not (v_target_team_id = any(v_allowed_team_ids)) then raise exception 'Selected user is outside your Heartbeat scope.' using errcode = '42501'; end if;
    if v_role = 'advisor' and p_user_id <> v_actor_id then raise exception 'Advisor can only inspect own Heartbeat.' using errcode = '42501'; end if;
    if v_role = 'leader' and p_user_id <> v_actor_id and v_target_role <> 'advisor' then raise exception 'Leader can only inspect Advisor Heartbeat.' using errcode = '42501'; end if;
    if v_role = 'director' and p_user_id <> v_actor_id and v_target_role not in ('leader', 'advisor') then raise exception 'Director can only inspect Leader or Advisor Heartbeat.' using errcode = '42501'; end if;
    if p_team_id is not null and v_target_team_id <> p_team_id then raise exception 'Selected user does not belong to selected Team.' using errcode = '22023'; end if;
  end if;
  with scoped_teams as (
    select t.id, t.name from public.teams t where t.id = any(v_allowed_team_ids) and (p_team_id is null or t.id = p_team_id)
  ), scoped_users as (
    select p.id, p.display_name, p.primary_team_id, p.role::text as role from public.profiles p where p.is_active and p.primary_team_id in (select id from scoped_teams)
  ), visible_users as (
    select * from scoped_users u where u.id <> v_actor_id and (
      v_role = 'super_admin' or (v_role = 'director' and u.role in ('leader', 'advisor')) or (v_role = 'leader' and u.role = 'advisor')
    )
  ), log_rows as (
    select d.log_id, d.user_id, u.display_name, u.primary_team_id, t.name as team_name, d.service_level, d.action_result, d.follow_up_date, d.revenue_amount, d.created_at
    from public.daily_logs d join scoped_users u on u.id = d.user_id join scoped_teams t on t.id = u.primary_team_id
    where p_user_id is null or u.id = p_user_id order by d.created_at desc limit 100
  ), summary as (
    select count(*)::integer as total_logs, count(*) filter (where action_result not in ('Dời lịch', 'Hủy'))::integer as completed_interactions, count(*) filter (where action_result in ('Ký Hợp Đồng', 'Chốt HĐ'))::integer as closed_deals from log_rows
  ) select jsonb_build_object(
    'scope', case when v_role = 'advisor' then 'self' when v_role = 'leader' then 'team' when v_role = 'director' then 'agency' else 'global' end,
    'teams', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by name) from scoped_teams), '[]'::jsonb),
    'users', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'display_name', display_name, 'team_id', primary_team_id, 'role', role) order by display_name) from visible_users), '[]'::jsonb),
    'logs', coalesce((select jsonb_agg(jsonb_build_object('id', log_id, 'user_id', user_id, 'display_name', display_name, 'team_id', primary_team_id, 'team_name', team_name, 'service_level', service_level, 'action_result', action_result, 'follow_up_date', follow_up_date, 'revenue_amount', revenue_amount, 'created_at', created_at) order by created_at desc) from log_rows), '[]'::jsonb),
    'summary', jsonb_build_object('total_logs', summary.total_logs, 'completed_interactions', summary.completed_interactions, 'closed_deals', summary.closed_deals)
  ) into v_payload from summary;
  return v_payload;
end;
$$;

revoke all on function public.get_heartbeat_hierarchy_v1(uuid, uuid) from public, anon;
grant execute on function public.get_heartbeat_hierarchy_v1(uuid, uuid) to authenticated;
