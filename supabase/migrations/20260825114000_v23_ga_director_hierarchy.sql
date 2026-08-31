-- V23: General Agency hierarchy and Director-scoped Leadership Radar.
-- Director can read only active child teams of the Director's primary GA team.

alter type public.pilot_role add value if not exists 'director';

alter table public.teams
  add column if not exists parent_team_id uuid references public.teams(id) on delete cascade;

create index if not exists teams_parent_team_id_idx
  on public.teams(parent_team_id);

create or replace function public.get_admin_leadership_radar_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_role text;
  v_agency_team_id uuid;
begin
  select p.role::text, p.primary_team_id
    into v_role, v_agency_team_id
  from public.profiles p
  where p.id = auth.uid();

  if v_role not in ('super_admin', 'director') then
    raise exception 'Leadership Radar chỉ dành cho Super Admin hoặc Director.' using errcode = '42501';
  end if;

  if v_role = 'director' and v_agency_team_id is null then
    raise exception 'Director cần thuộc một GA để xem Leadership Radar.' using errcode = '42501';
  end if;

  return (
    with active_teams as (
      select t.id, t.name, t.parent_team_id
      from public.teams t
      where t.status = 'active'
        and (v_role = 'super_admin' or t.parent_team_id = v_agency_team_id)
    ), team_leaders as (
      select distinct on (p.primary_team_id) p.primary_team_id as team_id, p.display_name
      from public.profiles p
      where p.role::text = 'leader' and p.is_active = true
      order by p.primary_team_id, p.created_at asc
    ), advisors as (
      select p.primary_team_id as team_id, count(*)::integer as active_advisors
      from public.profiles p
      where p.role::text = 'advisor' and p.is_active = true
      group by p.primary_team_id
    ), supported_advisors as (
      select x.team_id, count(distinct x.user_id)::integer as supported_count
      from (
        select i.team_id, i.user_id
        from public.interventions i
        where i.action_status = 'done' and i.created_at >= current_timestamp - interval '30 days'
        union
        select g.team_id, g.recipient_id
        from public.xp_gifts g
        join public.profiles recipient on recipient.id = g.recipient_id
        where recipient.role::text = 'advisor' and g.created_at >= current_timestamp - interval '30 days'
      ) x
      group by x.team_id
    ), closures as (
      select a.team_id, count(*)::integer as closed_policies
      from public.activity_events a
      where a.event_type = 'policy_closed' and a.event_timestamp >= current_timestamp - interval '30 days'
      group by a.team_id
    )
    select jsonb_build_object(
      'window_days', 30,
      'scope', case when v_role = 'super_admin' then 'global' else 'agency' end,
      'agency_team_id', case when v_role = 'director' then v_agency_team_id else null end,
      'teams', coalesce(jsonb_agg(jsonb_build_object(
        'team_id', t.id,
        'team_name', t.name,
        'leader_name', coalesce(l.display_name, 'Chưa phân công Leader'),
        'active_advisors', coalesce(a.active_advisors, 0),
        'supported_advisors', coalesce(s.supported_count, 0),
        'closed_policies', coalesce(c.closed_policies, 0),
        'empathy_score', case when coalesce(a.active_advisors, 0) > 0 then round((coalesce(s.supported_count, 0)::numeric / a.active_advisors::numeric) * 100) else 0 end,
        'performance_score', case when coalesce(a.active_advisors, 0) > 0 then least(100, round((coalesce(c.closed_policies, 0)::numeric / a.active_advisors::numeric) * 100)) else 0 end
      ) order by t.name), '[]'::jsonb)
    )
    from active_teams t
    left join team_leaders l on l.team_id = t.id
    left join advisors a on a.team_id = t.id
    left join supported_advisors s on s.team_id = t.id
    left join closures c on c.team_id = t.id
  );
end;
$$;

revoke all on function public.get_admin_leadership_radar_v1() from public, anon;
grant execute on function public.get_admin_leadership_radar_v1() to authenticated;
