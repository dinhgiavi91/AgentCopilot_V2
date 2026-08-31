-- Pilot Step 4 — Social and Gamification are explicitly Team-scoped.
-- No customer PII is accepted in post, comment, contest or gratitude content.

create or replace function private.is_active_team_member(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select private.is_super_admin())
    or (select private.current_team_id()) = target_team_id,
    false
  );
$$;

create or replace function private.current_profile_display_name()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.display_name
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active = true
  limit 1;
$$;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_display_name text not null default '',
  author_role public.pilot_role not null default 'advisor',
  body text not null check (
    char_length(trim(body)) between 3 and 1000
    and body !~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_display_name text not null default '',
  body text not null check (
    char_length(trim(body)) between 1 and 240
    and body !~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('heart', 'smile')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction)
);

create table if not exists public.team_contests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (
    char_length(trim(title)) between 3 and 160
    and title !~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})'
  ),
  xp_reward integer not null check (xp_reward between 20 and 5000),
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_gifts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  giver_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  post_id uuid references public.community_posts(id) on delete set null,
  xp_amount integer not null check (xp_amount between 1 and 5000),
  note text not null check (
    char_length(trim(note)) between 4 and 240
    and note !~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})'
  ),
  created_at timestamptz not null default now(),
  check (giver_id <> recipient_id)
);

create index if not exists community_posts_team_created_idx on public.community_posts(team_id, created_at desc);
create index if not exists community_comments_post_created_idx on public.community_comments(post_id, created_at asc);
create index if not exists community_likes_post_idx on public.community_likes(post_id, reaction);
create index if not exists team_contests_team_status_created_idx on public.team_contests(team_id, status, created_at desc);
create index if not exists xp_gifts_team_created_idx on public.xp_gifts(team_id, created_at desc);

create or replace function public.pilot_set_community_actor()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  new.author_display_name := coalesce((select private.current_profile_display_name()), 'Đồng đội Pilot');
  return new;
end;
$$;

drop trigger if exists community_posts_set_actor on public.community_posts;
create trigger community_posts_set_actor before insert or update on public.community_posts
for each row execute procedure public.pilot_set_community_actor();

drop trigger if exists community_comments_set_actor on public.community_comments;
create trigger community_comments_set_actor before insert or update on public.community_comments
for each row execute procedure public.pilot_set_community_actor();

drop trigger if exists community_posts_touch_updated_at on public.community_posts;
create trigger community_posts_touch_updated_at before update on public.community_posts
for each row execute procedure public.touch_updated_at();

drop trigger if exists community_comments_touch_updated_at on public.community_comments;
create trigger community_comments_touch_updated_at before update on public.community_comments
for each row execute procedure public.touch_updated_at();

drop trigger if exists team_contests_touch_updated_at on public.team_contests;
create trigger team_contests_touch_updated_at before update on public.team_contests
for each row execute procedure public.touch_updated_at();

create or replace function private.community_post_matches_team(target_post_id uuid, target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.community_posts p
    where p.id = target_post_id and p.team_id = target_team_id
  );
$$;

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
alter table public.team_contests enable row level security;
alter table public.xp_gifts enable row level security;

grant select, insert, update, delete on public.community_posts, public.community_comments, public.community_likes, public.team_contests to authenticated;
grant select on public.xp_gifts to authenticated;
grant all privileges on public.community_posts, public.community_comments, public.community_likes, public.team_contests, public.xp_gifts to service_role;

create policy community_posts_team_select on public.community_posts for select to authenticated
using ((select private.is_active_team_member(team_id)));
create policy community_posts_team_insert on public.community_posts for insert to authenticated
with check (author_id = (select auth.uid()) and team_id = (select private.current_team_id()));
create policy community_posts_author_or_manager_update on public.community_posts for update to authenticated
using (author_id = (select auth.uid()) or (select private.can_manage_team(team_id)))
with check ((select private.is_active_team_member(team_id)));
create policy community_posts_author_or_manager_delete on public.community_posts for delete to authenticated
using (author_id = (select auth.uid()) or (select private.can_manage_team(team_id)));

create policy community_comments_team_select on public.community_comments for select to authenticated
using ((select private.is_active_team_member(team_id)));
create policy community_comments_team_insert on public.community_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and team_id = (select private.current_team_id())
  and (select private.community_post_matches_team(post_id, team_id))
);
create policy community_comments_author_or_manager_update on public.community_comments for update to authenticated
using (author_id = (select auth.uid()) or (select private.can_manage_team(team_id)))
with check ((select private.is_active_team_member(team_id)));
create policy community_comments_author_or_manager_delete on public.community_comments for delete to authenticated
using (author_id = (select auth.uid()) or (select private.can_manage_team(team_id)));

create policy community_likes_team_select on public.community_likes for select to authenticated
using ((select private.is_active_team_member(team_id)));
create policy community_likes_team_insert on public.community_likes for insert to authenticated
with check (
  user_id = (select auth.uid())
  and team_id = (select private.current_team_id())
  and (select private.community_post_matches_team(post_id, team_id))
);
create policy community_likes_own_delete on public.community_likes for delete to authenticated
using (user_id = (select auth.uid()));

create policy team_contests_team_select on public.team_contests for select to authenticated
using ((select private.is_active_team_member(team_id)));
create policy team_contests_leader_insert on public.team_contests for insert to authenticated
with check (created_by = (select auth.uid()) and (select private.can_manage_team(team_id)));
create policy team_contests_leader_update on public.team_contests for update to authenticated
using ((select private.can_manage_team(team_id))) with check ((select private.can_manage_team(team_id)));
create policy team_contests_leader_delete on public.team_contests for delete to authenticated
using ((select private.can_manage_team(team_id)));

create policy xp_gifts_team_select on public.xp_gifts for select to authenticated
using ((select private.is_active_team_member(team_id)));

drop policy if exists xp_ledger_select_own on public.xp_ledger;
create policy xp_ledger_select_team_scoped on public.xp_ledger for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = xp_ledger.user_id
      and (select private.is_active_team_member(p.primary_team_id))
  )
);

create or replace function public.gift_team_xp_v1(
  p_recipient_id uuid,
  p_amount integer,
  p_note text,
  p_post_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_giver_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_giver_xp integer;
  v_recipient_xp integer;
  v_gift_id uuid;
begin
  if v_giver_id is null or v_team_id is null then
    raise exception 'Hãy đăng nhập tài khoản Pilot hợp lệ.' using errcode = '42501';
  end if;
  if p_recipient_id = v_giver_id then
    raise exception 'Không thể tặng XP cho chính mình.' using errcode = '22023';
  end if;
  if p_amount is null or p_amount not between 1 and 5000 then
    raise exception 'XP tặng phải nằm trong khoảng 1 đến 5000.' using errcode = '22023';
  end if;
  if p_note is null or char_length(trim(p_note)) not between 4 and 240
     or p_note ~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})' then
    raise exception 'Lời cảm ơn phải dài 4–240 ký tự và không chứa PII.' using errcode = '22023';
  end if;
  if not private.user_belongs_to_team(p_recipient_id, v_team_id) then
    raise exception 'Người nhận không thuộc Team hiện tại.' using errcode = '42501';
  end if;
  if p_post_id is not null and not private.community_post_matches_team(p_post_id, v_team_id) then
    raise exception 'Bài đăng không thuộc Team hiện tại.' using errcode = '42501';
  end if;

  insert into public.users_profile (user_id) values (v_giver_id), (p_recipient_id)
  on conflict (user_id) do nothing;

  select total_xp into v_giver_xp from public.users_profile where user_id = v_giver_id for update;
  if coalesce(v_giver_xp, 0) < p_amount then
    raise exception 'Chưa đủ XP để gửi lời cảm ơn này.' using errcode = '22023';
  end if;
  select total_xp into v_recipient_xp from public.users_profile where user_id = p_recipient_id for update;

  insert into public.xp_gifts (team_id, giver_id, recipient_id, post_id, xp_amount, note)
  values (v_team_id, v_giver_id, p_recipient_id, p_post_id, p_amount, trim(p_note))
  returning id into v_gift_id;

  insert into public.xp_ledger (user_id, xp_amount, reason) values
    (v_giver_id, -p_amount, 'manual_adjustment'),
    (p_recipient_id, p_amount, 'manual_adjustment');
  update public.users_profile set total_xp = total_xp - p_amount where user_id = v_giver_id;
  update public.users_profile set total_xp = total_xp + p_amount where user_id = p_recipient_id;

  return jsonb_build_object('gift_id', v_gift_id, 'giver_remaining_xp', v_giver_xp - p_amount, 'recipient_total_xp', coalesce(v_recipient_xp, 0) + p_amount);
end;
$$;

revoke all on function public.gift_team_xp_v1(uuid, integer, text, uuid) from public;
revoke execute on function public.gift_team_xp_v1(uuid, integer, text, uuid) from anon;
grant execute on function public.gift_team_xp_v1(uuid, integer, text, uuid) to authenticated;
