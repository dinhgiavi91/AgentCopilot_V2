-- V34: Input-focused Player-Coach goals. No customer or policy data is stored.

create table if not exists public.player_coach_goals (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  personal_income numeric not null default 0 check (personal_income >= 0 and personal_income <= 1000000000000),
  coaching_1on1_target integer not null default 0 check (coaching_1on1_target >= 0 and coaching_1on1_target <= 10000),
  xp_budget_target integer not null default 0 check (xp_budget_target >= 0 and xp_budget_target <= 50000000),
  team_streak_7d_members_target integer not null default 0 check (team_streak_7d_members_target >= 0 and team_streak_7d_members_target <= 100000),
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp
);

alter table public.player_coach_goals enable row level security;
revoke all on table public.player_coach_goals from public, anon, authenticated;

create or replace function public.get_my_player_coach_goal_v1()
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
    'coaching_1on1_target', coalesce(v_goal.coaching_1on1_target, 0),
    'xp_budget_target', coalesce(v_goal.xp_budget_target, 0),
    'team_streak_7d_members_target', coalesce(v_goal.team_streak_7d_members_target, 0)
  );
end;
$$;

create or replace function public.upsert_my_player_coach_goal_v1(
  p_personal_income numeric,
  p_coaching_1on1_target integer,
  p_xp_budget_target integer,
  p_team_streak_7d_members_target integer
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
    or coalesce(p_coaching_1on1_target, -1) < 0 or coalesce(p_coaching_1on1_target, 0) > 10000
    or coalesce(p_xp_budget_target, -1) < 0 or coalesce(p_xp_budget_target, 0) > 50000000
    or coalesce(p_team_streak_7d_members_target, -1) < 0 or coalesce(p_team_streak_7d_members_target, 0) > 100000 then
    raise exception 'Player-Coach goal values are outside safe ranges.' using errcode = '22023';
  end if;
  insert into public.player_coach_goals (
    user_id, team_id, personal_income, coaching_1on1_target, xp_budget_target, team_streak_7d_members_target, updated_at
  ) values (
    v_actor_id, v_team_id, p_personal_income, p_coaching_1on1_target, p_xp_budget_target, p_team_streak_7d_members_target, current_timestamp
  ) on conflict (user_id) do update set
    team_id = excluded.team_id,
    personal_income = excluded.personal_income,
    coaching_1on1_target = excluded.coaching_1on1_target,
    xp_budget_target = excluded.xp_budget_target,
    team_streak_7d_members_target = excluded.team_streak_7d_members_target,
    updated_at = current_timestamp
  returning * into v_goal;
  return jsonb_build_object(
    'personal_income', v_goal.personal_income,
    'coaching_1on1_target', v_goal.coaching_1on1_target,
    'xp_budget_target', v_goal.xp_budget_target,
    'team_streak_7d_members_target', v_goal.team_streak_7d_members_target
  );
end;
$$;

revoke all on function public.get_my_player_coach_goal_v1() from public, anon;
revoke all on function public.upsert_my_player_coach_goal_v1(numeric, integer, integer, integer) from public, anon;
grant execute on function public.get_my_player_coach_goal_v1() to authenticated;
grant execute on function public.upsert_my_player_coach_goal_v1(numeric, integer, integer, integer) to authenticated;
