-- Agent Copilot Sprint 1 — Supabase PostgreSQL + RLS
-- Zero-PII by schema: no customer name, phone, email or free-text customer fields exist in Sprint 1.

create extension if not exists "pgcrypto";

create table if not exists public.users_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'Gói Khởi Động'
    check (role in ('Gói Khởi Động', 'Gói Tăng Tốc')),
  is_team_leader boolean not null default false,
  target_income numeric(14, 0) not null default 0 check (target_income >= 0),
  required_meetings integer not null default 0 check (required_meetings >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  total_xp integer not null default 0 check (total_xp >= 0),
  last_streak_date date,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  log_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_level smallint not null check (service_level between 1 and 6),
  action_result text not null check (action_result in ('Chốt HĐ', 'Dời lịch', 'Từ chối')),
  follow_up_date date,
  revenue_amount numeric(14, 0) not null default 0 check (revenue_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_logs_follow_up_required
    check (action_result = 'Chốt HĐ' or follow_up_date is not null)
);

create index if not exists daily_logs_user_created_at_idx
  on public.daily_logs(user_id, created_at desc);
create index if not exists daily_logs_user_follow_up_idx
  on public.daily_logs(user_id, follow_up_date)
  where follow_up_date is not null;

create table if not exists public.xp_ledger (
  transaction_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  xp_amount integer not null check (xp_amount <> 0),
  reason text not null check (reason in ('daily_quiz', 'service_wow', 'closed_policy', 'manual_adjustment')),
  source_log_id uuid unique references public.daily_logs(log_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists xp_ledger_user_created_at_idx
  on public.xp_ledger(user_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_profile_touch_updated_at on public.users_profile;
create trigger users_profile_touch_updated_at
before update on public.users_profile
for each row execute procedure public.touch_updated_at();

drop trigger if exists daily_logs_touch_updated_at on public.daily_logs;
create trigger daily_logs_touch_updated_at
before update on public.daily_logs
for each row execute procedure public.touch_updated_at();

-- XP principle: field outcomes are deliberately worth much more than passive learning.
-- Closed policy = 250 XP; WOW service = 50 XP; daily quiz (created by a separate feature) = 10 XP.
create or replace function public.award_xp_from_daily_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  awarded_xp integer := 0;
  xp_reason text;
begin
  if new.action_result = 'Chốt HĐ' then
    awarded_xp := 250;
    xp_reason := 'closed_policy';
  elsif new.service_level = 6 then
    awarded_xp := 50;
    xp_reason := 'service_wow';
  end if;

  insert into public.users_profile (user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;

  update public.users_profile
  set
    current_streak = case
      when last_streak_date = current_date then current_streak
      when last_streak_date = current_date - 1 then current_streak + 1
      else 1
    end,
    last_streak_date = current_date,
    last_active_at = now()
  where user_id = new.user_id;

  if awarded_xp > 0 then
    insert into public.xp_ledger (user_id, xp_amount, reason, source_log_id)
    values (new.user_id, awarded_xp, xp_reason, new.log_id)
    on conflict (source_log_id) do nothing;

    update public.users_profile
    set total_xp = total_xp + awarded_xp
    where user_id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists daily_logs_award_xp on public.daily_logs;
create trigger daily_logs_award_xp
after insert on public.daily_logs
for each row execute procedure public.award_xp_from_daily_log();

-- One profile is created for every authenticated user; profile data does not contain customer PII.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.users_profile enable row level security;
alter table public.daily_logs enable row level security;
alter table public.xp_ledger enable row level security;

create policy "profiles_select_own" on public.users_profile
for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.users_profile
for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.users_profile
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "daily_logs_select_own" on public.daily_logs
for select using (auth.uid() = user_id);
create policy "daily_logs_insert_own" on public.daily_logs
for insert with check (auth.uid() = user_id);
create policy "daily_logs_update_own" on public.daily_logs
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);
create policy "daily_logs_delete_own" on public.daily_logs
for delete using (auth.uid() = user_id);

create policy "xp_ledger_select_own" on public.xp_ledger
for select using (auth.uid() = user_id);

-- Do not grant client-side insert/update/delete access to xp_ledger.
-- Field-event triggers and server-side admin workflows are the controlled XP writers.
revoke insert, update, delete on public.xp_ledger from anon, authenticated;

-- Sprint 2: introduce a team_members table before creating leader access to other advisors' records.
-- This avoids unsafe leader-wide access without an explicit team relationship.
