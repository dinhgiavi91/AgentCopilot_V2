-- V66 — Dynamic CMS Matrix for five remaining Admin Stations.
-- Zero-PII: content stays operational; feedback rejects contact details.
create extension if not exists pgcrypto;

create table if not exists public.news_90s (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 180),
  content text not null check (char_length(trim(content)) between 3 and 10000),
  insight_action text not null default '' check (char_length(insight_action) <= 3000),
  category text not null default 'Nội dung thị trường' check (char_length(trim(category)) between 2 and 80),
  created_at timestamptz not null default now(),
  legacy_source_code text unique
);

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 180),
  context_problem text not null check (char_length(trim(context_problem)) between 3 and 10000),
  lesson_learned text not null default '' check (char_length(lesson_learned) <= 5000),
  video_url text,
  created_at timestamptz not null default now(),
  legacy_source_code text unique
);

create table if not exists public.empathy_dictionary_v66 (
  id uuid primary key default gen_random_uuid(),
  technical_term text not null check (char_length(trim(technical_term)) between 2 and 200),
  empathetic_translation text not null check (char_length(trim(empathetic_translation)) between 3 and 5000),
  category text not null default 'Chung' check (char_length(trim(category)) between 2 and 80),
  created_at timestamptz not null default now(),
  legacy_source_code text unique
);

create table if not exists public.leader_playbook (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('principle', 'coaching_script')),
  title text not null check (char_length(trim(title)) between 3 and 180),
  content text not null check (char_length(trim(content)) between 3 and 10000),
  created_at timestamptz not null default now(),
  legacy_source_code text unique
);

create table if not exists public.user_feedbacks (
  id uuid primary key default gen_random_uuid(),
  rating smallint not null check (rating between 1 and 5),
  favorite_feature text not null check (char_length(trim(favorite_feature)) between 2 and 120),
  suggestion text not null check (char_length(trim(suggestion)) between 3 and 1000),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  legacy_feedback_id uuid unique,
  constraint user_feedbacks_no_contact_pii check (
    concat_ws(' ', favorite_feature, suggestion) !~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})'
  )
);

create index if not exists news_90s_created_idx on public.news_90s(created_at desc);
create index if not exists case_studies_created_idx on public.case_studies(created_at desc);
create index if not exists empathy_dictionary_v66_category_idx on public.empathy_dictionary_v66(category, created_at desc);
create index if not exists leader_playbook_type_created_idx on public.leader_playbook(type, created_at desc);
create index if not exists user_feedbacks_created_idx on public.user_feedbacks(created_at desc);

-- Preserve the existing published library as the initial dynamic source of truth.
insert into public.news_90s (title, content, insight_action, category, created_at, legacy_source_code)
select title, summary, field_takeaway, category, coalesce(published_at, created_at), code
from public.news_case_studies
where code not like 'C%'
on conflict (legacy_source_code) do nothing;

insert into public.case_studies (title, context_problem, lesson_learned, video_url, created_at, legacy_source_code)
select title, summary, field_takeaway, null, coalesce(published_at, created_at), code
from public.news_case_studies
where code like 'C%'
on conflict (legacy_source_code) do nothing;

insert into public.empathy_dictionary_v66 (technical_term, empathetic_translation, category, created_at, legacy_source_code)
select legal_term, empathy_translation, 'Hệ thống', created_at, code
from public.empathy_dictionary
on conflict (legacy_source_code) do nothing;

insert into public.leader_playbook (type, title, content, created_at, legacy_source_code)
select 'principle', topic, core_thinking, created_at, code
from public.leadership_compass
on conflict (legacy_source_code) do nothing;

insert into public.user_feedbacks (rating, favorite_feature, suggestion, user_id, created_at, legacy_feedback_id)
select rating, favorite_feature, suggestion, user_id, created_at, feedback_id
from public.feedback_entries
on conflict (legacy_feedback_id) do nothing;

alter table public.news_90s enable row level security;
alter table public.case_studies enable row level security;
alter table public.empathy_dictionary_v66 enable row level security;
alter table public.leader_playbook enable row level security;
alter table public.user_feedbacks enable row level security;

drop policy if exists "v66_news_read" on public.news_90s;
drop policy if exists "v66_case_read" on public.case_studies;
drop policy if exists "v66_empathy_read" on public.empathy_dictionary_v66;
drop policy if exists "v66_leader_playbook_read" on public.leader_playbook;
create policy "v66_news_read" on public.news_90s for select to anon, authenticated using (true);
create policy "v66_case_read" on public.case_studies for select to anon, authenticated using (true);
create policy "v66_empathy_read" on public.empathy_dictionary_v66 for select to anon, authenticated using (true);
create policy "v66_leader_playbook_read" on public.leader_playbook for select to anon, authenticated using (true);

drop policy if exists "v66_news_super_admin_write" on public.news_90s;
drop policy if exists "v66_case_super_admin_write" on public.case_studies;
drop policy if exists "v66_empathy_super_admin_write" on public.empathy_dictionary_v66;
drop policy if exists "v66_leader_playbook_super_admin_write" on public.leader_playbook;
create policy "v66_news_super_admin_write" on public.news_90s for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);
create policy "v66_case_super_admin_write" on public.case_studies for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);
create policy "v66_empathy_super_admin_write" on public.empathy_dictionary_v66 for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);
create policy "v66_leader_playbook_super_admin_write" on public.leader_playbook for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);

drop policy if exists "v66_feedback_insert" on public.user_feedbacks;
drop policy if exists "v66_feedback_super_admin_read" on public.user_feedbacks;
drop policy if exists "v66_feedback_super_admin_delete" on public.user_feedbacks;
create policy "v66_feedback_insert" on public.user_feedbacks for insert to anon, authenticated with check (user_id is null or auth.uid() = user_id);
create policy "v66_feedback_super_admin_read" on public.user_feedbacks for select to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);
create policy "v66_feedback_super_admin_delete" on public.user_feedbacks for delete to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and is_active = true)
);

grant select on public.news_90s, public.case_studies, public.empathy_dictionary_v66, public.leader_playbook to anon, authenticated;
grant insert on public.user_feedbacks to anon, authenticated;
grant select, insert, update, delete on public.news_90s, public.case_studies, public.empathy_dictionary_v66, public.leader_playbook, public.user_feedbacks to authenticated;
