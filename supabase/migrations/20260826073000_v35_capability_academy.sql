-- V35 Capability Academy: accepted playbook challenges and proof of work.
-- This model deliberately stores only internal playbook metadata and activity IDs, never customer content.

create table if not exists public.learning_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  playbook_code text not null check (char_length(playbook_code) between 1 and 120),
  playbook_title text not null check (char_length(playbook_title) between 1 and 280),
  status text not null default 'accepted' check (status in ('accepted', 'completed')),
  source_activity_id uuid unique references public.activity_events(id) on delete set null,
  accepted_at timestamptz not null default current_timestamp,
  completed_at timestamptz
);

create unique index if not exists learning_challenges_active_playbook_idx
  on public.learning_challenges(user_id, playbook_code)
  where status = 'accepted';

alter table public.learning_challenges enable row level security;
revoke all on table public.learning_challenges from public, anon, authenticated;

create or replace function public.get_my_active_learning_challenge_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.learning_challenges%rowtype;
begin
  if v_user_id is null or private.current_profile_role() <> 'advisor'::public.pilot_role then
    raise exception 'Only authenticated advisors can access a learning challenge.' using errcode = '42501';
  end if;
  select * into v_challenge from public.learning_challenges
  where user_id = v_user_id and status = 'accepted'
  order by accepted_at desc limit 1;
  if v_challenge.id is null then return null; end if;
  return jsonb_build_object('id', v_challenge.id, 'playbook_code', v_challenge.playbook_code, 'playbook_title', v_challenge.playbook_title, 'accepted_at', v_challenge.accepted_at);
end;
$$;

create or replace function public.accept_learning_challenge_v1(p_playbook_code text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_playbook_title text;
  v_challenge public.learning_challenges%rowtype;
begin
  if v_user_id is null or v_team_id is null or private.current_profile_role() <> 'advisor'::public.pilot_role then
    raise exception 'Only authenticated advisors can accept a learning challenge.' using errcode = '42501';
  end if;
  if p_playbook_code is null or char_length(trim(p_playbook_code)) not between 1 and 120 then
    raise exception 'Invalid playbook challenge.' using errcode = '22023';
  end if;
  select situation into v_playbook_title from public.playbook_cards
  where code = trim(p_playbook_code) and (team_id is null or team_id = v_team_id)
  limit 1;
  if v_playbook_title is null then raise exception 'Playbook is unavailable in your workspace.' using errcode = '42501'; end if;
  select * into v_challenge from public.learning_challenges
  where user_id = v_user_id and playbook_code = trim(p_playbook_code) and status = 'accepted'
  order by accepted_at desc limit 1;
  if v_challenge.id is null then
    insert into public.learning_challenges(user_id, team_id, playbook_code, playbook_title)
    values (v_user_id, v_team_id, trim(p_playbook_code), v_playbook_title)
    returning * into v_challenge;
  end if;
  return jsonb_build_object('id', v_challenge.id, 'playbook_code', v_challenge.playbook_code, 'playbook_title', v_challenge.playbook_title, 'accepted_at', v_challenge.accepted_at, 'idempotent', v_challenge.accepted_at < current_timestamp - interval '1 second');
end;
$$;

create or replace function public.complete_learning_challenge_proof_v1(p_challenge_id uuid, p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_challenge public.learning_challenges%rowtype;
  v_transaction_id uuid;
  v_total_xp integer;
  v_streak integer;
  v_xp constant integer := 50;
begin
  if v_user_id is null or v_team_id is null or private.current_profile_role() <> 'advisor'::public.pilot_role then
    raise exception 'Only authenticated advisors can complete a learning challenge.' using errcode = '42501';
  end if;
  select * into v_challenge from public.learning_challenges
  where id = p_challenge_id and user_id = v_user_id and team_id = v_team_id and status = 'accepted'
  for update;
  if v_challenge.id is null then raise exception 'No active learning challenge was found.' using errcode = '42501'; end if;
  if not exists (select 1 from public.activity_events where id = p_activity_id and user_id = v_user_id and team_id = v_team_id) then
    raise exception 'No valid Heartbeat activity was found for this proof.' using errcode = '42501';
  end if;
  insert into public.users_profile(user_id) values (v_user_id) on conflict(user_id) do nothing;
  insert into public.xp_ledger(user_id, xp_amount, reason, description, auto_source, auto_source_key)
  values (v_user_id, v_xp, 'manual_adjustment', 'Capability Academy · Proof of Work hoàn tất', 'learning_challenge_proof', v_challenge.id::text)
  on conflict (user_id, auto_source, auto_source_key) where auto_source is not null and auto_source_key is not null do nothing
  returning transaction_id into v_transaction_id;
  if v_transaction_id is null then
    select total_xp, current_streak into v_total_xp, v_streak from public.users_profile where user_id = v_user_id;
    return jsonb_build_object('awarded', false, 'xp_amount', 0, 'total_xp', coalesce(v_total_xp, 0), 'current_streak', coalesce(v_streak, 0));
  end if;
  update public.learning_challenges set status = 'completed', source_activity_id = p_activity_id, completed_at = current_timestamp where id = v_challenge.id;
  update public.users_profile set total_xp = total_xp + v_xp, last_active_at = current_timestamp where user_id = v_user_id returning total_xp, current_streak into v_total_xp, v_streak;
  return jsonb_build_object('awarded', true, 'xp_amount', v_xp, 'total_xp', v_total_xp, 'current_streak', v_streak);
end;
$$;

revoke all on function public.get_my_active_learning_challenge_v1() from public, anon;
revoke all on function public.accept_learning_challenge_v1(text) from public, anon;
revoke all on function public.complete_learning_challenge_proof_v1(uuid, uuid) from public, anon;
grant execute on function public.get_my_active_learning_challenge_v1() to authenticated;
grant execute on function public.accept_learning_challenge_v1(text) to authenticated;
grant execute on function public.complete_learning_challenge_proof_v1(uuid, uuid) to authenticated;
