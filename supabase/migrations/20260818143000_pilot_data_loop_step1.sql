-- Agent Copilot Pilot MVP — Step 1
-- Scope: flat multi-tenant data loop. No UI wiring in this migration.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

do $$ begin
  create type public.pilot_role as enum ('super_admin', 'leader', 'advisor');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_team_status as enum ('active', 'paused', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_activity_event_type as enum (
    'daily_checkin', 'service_touch', 'meeting_completed', 'proposal_sent',
    'policy_closed', 'follow_up_completed', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_service_stage as enum (
    'prospecting', 'discovery', 'proposal', 'underwriting', 'issued', 'after_sales', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_followup_status as enum ('open', 'done', 'overdue', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_signal_type as enum (
    'low_activity', 'followup_overdue', 'conversion_drop', 'streak_break',
    'high_rejection', 'intervention_due', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_signal_severity as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_signal_status as enum ('new', 'reviewed', 'dismissed', 'acted_on');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_review_outcome as enum ('relevant', 'not_relevant', 'need_more_context');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_intervention_type as enum (
    'checkin', 'coaching_1on1', 'roleplay', 'goal_reset', 'shadow_support', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_intervention_status as enum ('planned', 'done', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_checkpoint_day as enum ('d7', 'd14', 'd30');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pilot_recovery_status as enum ('recovered', 'not_recovered', 'insufficient_data');
exception when duplicate_object then null;
end $$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  status public.pilot_team_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (char_length(trim(email)) between 3 and 320),
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  role public.pilot_role not null default 'advisor',
  primary_team_id uuid not null references public.teams(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  event_type public.pilot_activity_event_type not null,
  event_date date not null default current_date,
  event_timestamp timestamptz not null default now(),
  quantity integer not null default 1 check (quantity >= 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  alias_label text not null check (
    char_length(trim(alias_label)) between 1 and 80
    and alias_label !~ '@'
    and alias_label !~ '[0-9]{8,}'
  ),
  service_stage public.pilot_service_stage not null,
  due_date date not null,
  completed_at timestamptz,
  status public.pilot_followup_status not null default 'open',
  created_at timestamptz not null default now(),
  check ((status = 'done' and completed_at is not null) or (status <> 'done'))
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  signal_type public.pilot_signal_type not null,
  window_days integer not null check (window_days between 1 and 365),
  threshold_version text not null check (char_length(trim(threshold_version)) between 1 and 80),
  severity public.pilot_signal_severity not null,
  summary text not null check (char_length(trim(summary)) between 1 and 500),
  detected_at timestamptz not null default now(),
  status public.pilot_signal_status not null default 'new',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.signal_reviews (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  review_outcome public.pilot_review_outcome not null,
  note text check (note is null or char_length(note) <= 2000),
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.signals(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  leader_id uuid not null references public.profiles(id) on delete restrict,
  intervention_type public.pilot_intervention_type not null,
  action_status public.pilot_intervention_status not null default 'planned',
  action_date date not null,
  rationale text not null check (char_length(trim(rationale)) between 1 and 2000),
  note text check (note is null or char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.intervention_outcomes (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions(id) on delete cascade,
  checkpoint_day public.pilot_checkpoint_day not null,
  recovery_status public.pilot_recovery_status not null,
  note text check (note is null or char_length(note) <= 2000),
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (intervention_id, checkpoint_day)
);

create index if not exists profiles_team_role_active_idx on public.profiles (primary_team_id, role, is_active);
create index if not exists activity_events_team_date_idx on public.activity_events (team_id, event_date desc);
create index if not exists activity_events_user_date_idx on public.activity_events (user_id, event_date desc);
create index if not exists followups_team_status_due_idx on public.followups (team_id, status, due_date);
create index if not exists followups_user_due_idx on public.followups (user_id, due_date);
create index if not exists signals_team_status_detected_idx on public.signals (team_id, status, detected_at desc);
create index if not exists signals_user_detected_idx on public.signals (user_id, detected_at desc);
create index if not exists signal_reviews_signal_idx on public.signal_reviews (signal_id, reviewed_at desc);
create index if not exists interventions_team_date_idx on public.interventions (team_id, action_date desc);
create index if not exists interventions_user_date_idx on public.interventions (user_id, action_date desc);
create index if not exists intervention_outcomes_intervention_idx on public.intervention_outcomes (intervention_id, measured_at desc);

-- Private SECURITY DEFINER helpers are intentionally outside exposed API schemas.
create or replace function private.current_profile_role()
returns public.pilot_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active = true
  limit 1;
$$;

create or replace function private.current_team_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.primary_team_id
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active = true
  limit 1;
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.current_profile_role()) = 'super_admin'::public.pilot_role, false);
$$;

create or replace function private.is_leader_for_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select private.current_profile_role()) = 'leader'::public.pilot_role
    and (select private.current_team_id()) = target_team_id,
    false
  );
$$;

create or replace function private.can_manage_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_super_admin()) or (select private.is_leader_for_team(target_team_id));
$$;

create or replace function private.user_belongs_to_team(target_user_id uuid, target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target_user_id
      and p.primary_team_id = target_team_id
      and p.is_active = true
  );
$$;

create or replace function private.can_access_signal(target_signal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.signals s
    where s.id = target_signal_id
      and (
        (s.user_id = (select auth.uid()) and (select private.user_belongs_to_team(s.user_id, s.team_id)))
        or (select private.can_manage_team(s.team_id))
      )
  );
$$;

create or replace function private.can_review_signal(target_signal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.signals s
    where s.id = target_signal_id and (select private.can_manage_team(s.team_id))
  );
$$;

create or replace function private.can_access_intervention(target_intervention_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.interventions i
    where i.id = target_intervention_id
      and (
        (i.user_id = (select auth.uid()) and (select private.user_belongs_to_team(i.user_id, i.team_id)))
        or (select private.can_manage_team(i.team_id))
      )
  );
$$;

create or replace function private.can_manage_intervention(target_intervention_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.interventions i
    where i.id = target_intervention_id and (select private.can_manage_team(i.team_id))
  );
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated;

grant select, insert, update, delete on public.teams, public.profiles, public.activity_events,
  public.followups, public.signals, public.signal_reviews, public.interventions,
  public.intervention_outcomes to authenticated;
grant all privileges on public.teams, public.profiles, public.activity_events,
  public.followups, public.signals, public.signal_reviews, public.interventions,
  public.intervention_outcomes to service_role;

alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.activity_events enable row level security;
alter table public.followups enable row level security;
alter table public.signals enable row level security;
alter table public.signal_reviews enable row level security;
alter table public.interventions enable row level security;
alter table public.intervention_outcomes enable row level security;

drop policy if exists pilot_teams_select_scoped on public.teams;
drop policy if exists pilot_teams_super_admin_manage on public.teams;
create policy pilot_teams_select_scoped on public.teams for select to authenticated
using (id = (select private.current_team_id()) or (select private.is_super_admin()));
create policy pilot_teams_super_admin_manage on public.teams for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

drop policy if exists pilot_profiles_select_scoped on public.profiles;
drop policy if exists pilot_profiles_super_admin_manage on public.profiles;
create policy pilot_profiles_select_scoped on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (primary_team_id = (select private.current_team_id()) and (select private.is_leader_for_team(primary_team_id)))
  or (select private.is_super_admin())
);
create policy pilot_profiles_super_admin_manage on public.profiles for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

drop policy if exists pilot_activity_events_select_scoped on public.activity_events;
drop policy if exists pilot_activity_events_insert_scoped on public.activity_events;
drop policy if exists pilot_activity_events_update_scoped on public.activity_events;
drop policy if exists pilot_activity_events_delete_scoped on public.activity_events;
create policy pilot_activity_events_select_scoped on public.activity_events for select to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
);
create policy pilot_activity_events_insert_scoped on public.activity_events for insert to authenticated
with check (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or ((select private.can_manage_team(team_id)) and (select private.user_belongs_to_team(user_id, team_id)))
);
create policy pilot_activity_events_update_scoped on public.activity_events for update to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
)
with check (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or ((select private.can_manage_team(team_id)) and (select private.user_belongs_to_team(user_id, team_id)))
);
create policy pilot_activity_events_delete_scoped on public.activity_events for delete to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
);

drop policy if exists pilot_followups_select_scoped on public.followups;
drop policy if exists pilot_followups_insert_scoped on public.followups;
drop policy if exists pilot_followups_update_scoped on public.followups;
drop policy if exists pilot_followups_delete_scoped on public.followups;
create policy pilot_followups_select_scoped on public.followups for select to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
);
create policy pilot_followups_insert_scoped on public.followups for insert to authenticated
with check (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or ((select private.can_manage_team(team_id)) and (select private.user_belongs_to_team(user_id, team_id)))
);
create policy pilot_followups_update_scoped on public.followups for update to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
)
with check (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or ((select private.can_manage_team(team_id)) and (select private.user_belongs_to_team(user_id, team_id)))
);
create policy pilot_followups_delete_scoped on public.followups for delete to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
);

drop policy if exists pilot_signals_select_scoped on public.signals;
drop policy if exists pilot_signals_super_admin_insert on public.signals;
drop policy if exists pilot_signals_leader_update on public.signals;
drop policy if exists pilot_signals_super_admin_delete on public.signals;
create policy pilot_signals_select_scoped on public.signals for select to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
);
create policy pilot_signals_super_admin_insert on public.signals for insert to authenticated
with check ((select private.is_super_admin()));
create policy pilot_signals_leader_update on public.signals for update to authenticated
using ((select private.can_manage_team(team_id))) with check ((select private.can_manage_team(team_id)));
create policy pilot_signals_super_admin_delete on public.signals for delete to authenticated
using ((select private.is_super_admin()));

drop policy if exists pilot_signal_reviews_select_scoped on public.signal_reviews;
drop policy if exists pilot_signal_reviews_insert_scoped on public.signal_reviews;
drop policy if exists pilot_signal_reviews_update_scoped on public.signal_reviews;
drop policy if exists pilot_signal_reviews_delete_scoped on public.signal_reviews;
create policy pilot_signal_reviews_select_scoped on public.signal_reviews for select to authenticated
using ((select private.can_access_signal(signal_id)));
create policy pilot_signal_reviews_insert_scoped on public.signal_reviews for insert to authenticated
with check (reviewer_id = (select auth.uid()) and (select private.can_review_signal(signal_id)));
create policy pilot_signal_reviews_update_scoped on public.signal_reviews for update to authenticated
using (reviewer_id = (select auth.uid()) and (select private.can_review_signal(signal_id)))
with check (reviewer_id = (select auth.uid()) and (select private.can_review_signal(signal_id)));
create policy pilot_signal_reviews_delete_scoped on public.signal_reviews for delete to authenticated
using (reviewer_id = (select auth.uid()) and (select private.can_review_signal(signal_id)));

drop policy if exists pilot_interventions_select_scoped on public.interventions;
drop policy if exists pilot_interventions_insert_scoped on public.interventions;
drop policy if exists pilot_interventions_update_scoped on public.interventions;
drop policy if exists pilot_interventions_delete_scoped on public.interventions;
create policy pilot_interventions_select_scoped on public.interventions for select to authenticated
using (
  (user_id = (select auth.uid()) and team_id = (select private.current_team_id()))
  or (select private.can_manage_team(team_id))
);
create policy pilot_interventions_insert_scoped on public.interventions for insert to authenticated
with check (
  (select private.is_super_admin())
  or (
    (select private.is_leader_for_team(team_id))
    and leader_id = (select auth.uid())
    and (select private.user_belongs_to_team(user_id, team_id))
  )
);
create policy pilot_interventions_update_scoped on public.interventions for update to authenticated
using ((select private.can_manage_team(team_id)))
with check (
  (select private.is_super_admin())
  or (
    (select private.is_leader_for_team(team_id))
    and leader_id = (select auth.uid())
    and (select private.user_belongs_to_team(user_id, team_id))
  )
);
create policy pilot_interventions_delete_scoped on public.interventions for delete to authenticated
using ((select private.can_manage_team(team_id)));

drop policy if exists pilot_intervention_outcomes_select_scoped on public.intervention_outcomes;
drop policy if exists pilot_intervention_outcomes_insert_scoped on public.intervention_outcomes;
drop policy if exists pilot_intervention_outcomes_update_scoped on public.intervention_outcomes;
drop policy if exists pilot_intervention_outcomes_delete_scoped on public.intervention_outcomes;
create policy pilot_intervention_outcomes_select_scoped on public.intervention_outcomes for select to authenticated
using ((select private.can_access_intervention(intervention_id)));
create policy pilot_intervention_outcomes_insert_scoped on public.intervention_outcomes for insert to authenticated
with check ((select private.can_manage_intervention(intervention_id)));
create policy pilot_intervention_outcomes_update_scoped on public.intervention_outcomes for update to authenticated
using ((select private.can_manage_intervention(intervention_id)))
with check ((select private.can_manage_intervention(intervention_id)));
create policy pilot_intervention_outcomes_delete_scoped on public.intervention_outcomes for delete to authenticated
using ((select private.can_manage_intervention(intervention_id)));
