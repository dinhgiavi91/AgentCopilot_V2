-- V83: Situation-tagged Leader Playbook and Zero-PII coaching application logs.
alter table public.leader_playbook
  add column if not exists tags text[] not null default '{}';

alter table public.leader_playbook
  drop constraint if exists leader_playbook_tags_limit;
alter table public.leader_playbook
  add constraint leader_playbook_tags_limit
  check (cardinality(tags) <= 12);

create index if not exists leader_playbook_tags_gin_idx on public.leader_playbook using gin(tags);

create table if not exists public.coaching_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  leader_id uuid not null references public.profiles(id) on delete restrict,
  advisor_id uuid not null references public.profiles(id) on delete restrict,
  leader_playbook_id uuid not null references public.leader_playbook(id) on delete restrict,
  note text not null check (char_length(btrim(note)) between 3 and 1200),
  created_at timestamptz not null default now(),
  constraint coaching_logs_note_no_contact_pii check (
    note !~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})'
  )
);

create index if not exists coaching_logs_leader_created_idx on public.coaching_logs(leader_id, created_at desc);
create index if not exists coaching_logs_advisor_created_idx on public.coaching_logs(advisor_id, created_at desc);

alter table public.coaching_logs enable row level security;
drop policy if exists "v83_leader_reads_own_coaching_logs" on public.coaching_logs;
create policy "v83_leader_reads_own_coaching_logs"
on public.coaching_logs for select to authenticated
using (leader_id = auth.uid());

revoke all on public.coaching_logs from anon;
grant select on public.coaching_logs to authenticated;

create or replace function public.list_my_coaching_advisors_v1()
returns table(id uuid, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_role public.pilot_role;
begin
  if auth.uid() is null then
    raise exception 'Vui lòng đăng nhập trước khi chọn TVV.' using errcode = '28000';
  end if;
  select primary_team_id, role into v_team_id, v_role from public.profiles where id = auth.uid();
  if v_role <> 'leader' or v_team_id is null then
    raise exception 'Chỉ Leader có thể ghi nhận coaching cho TVV của Team.' using errcode = '42501';
  end if;
  return query
  select profile.id, profile.display_name
  from public.profiles as profile
  where profile.primary_team_id = v_team_id
    and profile.role = 'advisor'
    and profile.is_active = true
  order by profile.display_name asc;
end;
$$;

create or replace function public.log_my_coaching_application_v1(
  p_advisor_id uuid,
  p_leader_playbook_id uuid,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_role public.pilot_role;
  v_log_id uuid;
  v_note text := btrim(coalesce(p_note, ''));
begin
  if auth.uid() is null then
    raise exception 'Vui lòng đăng nhập trước khi ghi nhận coaching.' using errcode = '28000';
  end if;
  select primary_team_id, role into v_team_id, v_role from public.profiles where id = auth.uid();
  if v_role <> 'leader' or v_team_id is null then
    raise exception 'Chỉ Leader có thể ghi nhận áp dụng coaching.' using errcode = '42501';
  end if;
  if char_length(v_note) not between 3 and 1200
     or v_note ~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})' then
    raise exception 'Ghi chú phải dài 3–1200 ký tự và không chứa email hoặc số điện thoại.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = p_advisor_id and primary_team_id = v_team_id and role = 'advisor' and is_active = true
  ) then
    raise exception 'TVV không thuộc Team hiện tại hoặc không còn hoạt động.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.leader_playbook where id = p_leader_playbook_id) then
    raise exception 'Nội dung La Bàn không tồn tại.' using errcode = '22023';
  end if;
  insert into public.coaching_logs (team_id, leader_id, advisor_id, leader_playbook_id, note)
  values (v_team_id, auth.uid(), p_advisor_id, p_leader_playbook_id, v_note)
  returning id into v_log_id;
  return v_log_id;
end;
$$;

revoke execute on function public.list_my_coaching_advisors_v1() from public, anon;
revoke execute on function public.log_my_coaching_application_v1(uuid, uuid, text) from public, anon;
grant execute on function public.list_my_coaching_advisors_v1() to authenticated;
grant execute on function public.log_my_coaching_application_v1(uuid, uuid, text) to authenticated;
