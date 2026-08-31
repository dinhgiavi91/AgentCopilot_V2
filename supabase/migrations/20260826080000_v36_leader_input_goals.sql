-- V36: Leader input goals add recruitment outreach and Team Active Rate.
-- Stores operational targets only; no customer or policy data is collected.

alter table public.player_coach_goals
  add column if not exists recruitment_outreach_target integer not null default 0 check (recruitment_outreach_target between 0 and 100000),
  add column if not exists active_rate_target_percent smallint not null default 0 check (active_rate_target_percent between 0 and 100);

create or replace function public.get_my_player_coach_goal_v2()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_goal public.player_coach_goals%rowtype;
begin
  select role::text into v_role from public.profiles where id = v_actor_id;
  if v_actor_id is null or v_role not in ('leader', 'director') then
    raise exception 'Player-Coach goals require Leader or Director access.' using errcode = '42501';
  end if;
  select * into v_goal from public.player_coach_goals where user_id = v_actor_id;
  return jsonb_build_object(
    'personal_income', coalesce(v_goal.personal_income, 0),
    'recruitment_outreach_target', coalesce(v_goal.recruitment_outreach_target, 0),
    'active_rate_target_percent', coalesce(v_goal.active_rate_target_percent, 0),
    'coaching_1on1_target', coalesce(v_goal.coaching_1on1_target, 0),
    'xp_budget_target', coalesce(v_goal.xp_budget_target, 0),
    'team_streak_7d_members_target', coalesce(v_goal.team_streak_7d_members_target, 0)
  );
end;
$$;

create or replace function public.upsert_my_player_coach_goal_v2(
  p_personal_income numeric,
  p_recruitment_outreach_target integer,
  p_active_rate_target_percent smallint,
  p_coaching_1on1_target integer,
  p_xp_budget_target integer,
  p_team_streak_7d_members_target integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_team_id uuid;
  v_goal public.player_coach_goals%rowtype;
begin
  select role::text, primary_team_id into v_role, v_team_id from public.profiles where id = v_actor_id;
  if v_actor_id is null or v_role not in ('leader', 'director') or v_team_id is null then
    raise exception 'Player-Coach goals require Leader or Director access.' using errcode = '42501';
  end if;
  if coalesce(p_personal_income, -1) < 0 or coalesce(p_personal_income, 0) > 1000000000000
    or coalesce(p_recruitment_outreach_target, -1) < 0 or coalesce(p_recruitment_outreach_target, 0) > 100000
    or coalesce(p_active_rate_target_percent, -1) < 0 or coalesce(p_active_rate_target_percent, 0) > 100
    or coalesce(p_coaching_1on1_target, -1) < 0 or coalesce(p_coaching_1on1_target, 0) > 10000
    or coalesce(p_xp_budget_target, -1) < 0 or coalesce(p_xp_budget_target, 0) > 50000000
    or (p_team_streak_7d_members_target is not null and (p_team_streak_7d_members_target < 0 or p_team_streak_7d_members_target > 100000)) then
    raise exception 'Player-Coach goal values are outside safe ranges.' using errcode = '22023';
  end if;
  insert into public.player_coach_goals (
    user_id, team_id, personal_income, recruitment_outreach_target, active_rate_target_percent, coaching_1on1_target, xp_budget_target, team_streak_7d_members_target, updated_at
  ) values (
    v_actor_id, v_team_id, p_personal_income, p_recruitment_outreach_target, p_active_rate_target_percent, p_coaching_1on1_target, p_xp_budget_target, coalesce(p_team_streak_7d_members_target, 0), current_timestamp
  ) on conflict (user_id) do update set
    team_id = excluded.team_id,
    personal_income = excluded.personal_income,
    recruitment_outreach_target = excluded.recruitment_outreach_target,
    active_rate_target_percent = excluded.active_rate_target_percent,
    coaching_1on1_target = excluded.coaching_1on1_target,
    xp_budget_target = excluded.xp_budget_target,
    team_streak_7d_members_target = coalesce(p_team_streak_7d_members_target, public.player_coach_goals.team_streak_7d_members_target),
    updated_at = current_timestamp
  returning * into v_goal;
  return jsonb_build_object(
    'personal_income', v_goal.personal_income,
    'recruitment_outreach_target', v_goal.recruitment_outreach_target,
    'active_rate_target_percent', v_goal.active_rate_target_percent,
    'coaching_1on1_target', v_goal.coaching_1on1_target,
    'xp_budget_target', v_goal.xp_budget_target,
    'team_streak_7d_members_target', v_goal.team_streak_7d_members_target
  );
end;
$$;

revoke all on function public.get_my_player_coach_goal_v2() from public, anon;
revoke all on function public.upsert_my_player_coach_goal_v2(numeric, integer, smallint, integer, integer, integer) from public, anon;
grant execute on function public.get_my_player_coach_goal_v2() to authenticated;
grant execute on function public.upsert_my_player_coach_goal_v2(numeric, integer, smallint, integer, integer, integer) to authenticated;
