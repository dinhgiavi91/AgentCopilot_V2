-- Restore Sprint 3 Daily Quiz without client-side XP writes.
-- A user can claim exactly one daily_quiz entry per UTC calendar day.
create or replace function public.claim_daily_quiz_xp()
returns table(claimed boolean, xp_amount integer, current_streak integer, total_xp integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid := auth.uid();
  profile_streak integer;
  profile_xp integer;
begin
  if target_user is null then
    raise exception 'Authentication required to claim Daily Quiz XP';
  end if;

  insert into public.users_profile (user_id) values (target_user) on conflict (user_id) do nothing;

  if exists (
    select 1 from public.xp_ledger
    where user_id = target_user and reason = 'daily_quiz' and created_at::date = current_date
  ) then
    select current_streak, total_xp into profile_streak, profile_xp from public.users_profile where user_id = target_user;
    return query select false, 0, profile_streak, profile_xp;
    return;
  end if;

  insert into public.xp_ledger (user_id, xp_amount, reason)
  values (target_user, 10, 'daily_quiz');

  update public.users_profile
  set
    current_streak = case
      when last_streak_date = current_date then current_streak
      when last_streak_date = current_date - 1 then current_streak + 1
      else 1
    end,
    last_streak_date = current_date,
    last_active_at = now(),
    total_xp = total_xp + 10
  where user_id = target_user
  returning current_streak, total_xp into profile_streak, profile_xp;

  return query select true, 10, profile_streak, profile_xp;
end;
$$;

grant execute on function public.claim_daily_quiz_xp() to authenticated;
