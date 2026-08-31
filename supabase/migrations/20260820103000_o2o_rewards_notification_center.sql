-- O2O Reward Fulfillment + Notification Center.
-- The schema stays Zero-PII: notifications only reference product events and existing Pilot display names.

alter table public.reward_redemptions
  add column if not exists fulfilled_at timestamptz,
  add column if not exists fulfilled_by uuid references public.profiles(id) on delete set null;

create index if not exists reward_redemptions_pending_by_user_idx
  on public.reward_redemptions (user_id, status, created_at desc);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  event_type text not null check (event_type in ('xp_awarded', 'xp_spent', 'gift_received', 'reward_redeemed', 'reward_fulfilled', 'community_comment', 'community_reaction')),
  title text not null check (char_length(trim(title)) between 1 and 160),
  body text not null check (char_length(trim(body)) between 1 and 500),
  source_table text not null check (char_length(trim(source_table)) between 1 and 80),
  source_id uuid not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, event_type, source_id)
);

create index if not exists user_notifications_user_created_idx
  on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;
grant select, update on public.user_notifications to authenticated;
grant all privileges on public.user_notifications to service_role;

drop policy if exists user_notifications_owner_select on public.user_notifications;
create policy user_notifications_owner_select on public.user_notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists user_notifications_owner_mark_read on public.user_notifications;
create policy user_notifications_owner_mark_read on public.user_notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.notify_xp_ledger_insert_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_team_id uuid;
  v_event_type text;
  v_title text;
  v_body text;
begin
  select primary_team_id into v_team_id from public.profiles where id = new.user_id;
  if v_team_id is null then return new; end if;

  if new.source_gift_id is not null and new.xp_amount > 0 then
    v_event_type := 'gift_received';
    v_title := 'Bạn vừa được tặng XP';
  elsif new.xp_amount > 0 then
    v_event_type := 'xp_awarded';
    v_title := 'XP mới đã được cộng';
  else
    v_event_type := 'xp_spent';
    v_title := 'XP đã được sử dụng';
  end if;
  v_body := coalesce(nullif(btrim(new.description), ''), concat(case when new.xp_amount > 0 then '+' else '' end, new.xp_amount, ' XP · ', replace(new.reason, '_', ' ')));

  insert into public.user_notifications (user_id, team_id, event_type, title, body, source_table, source_id, created_at)
  values (new.user_id, v_team_id, v_event_type, v_title, left(v_body, 500), 'xp_ledger', new.transaction_id, new.created_at)
  on conflict (user_id, event_type, source_id) do nothing;
  return new;
end;
$$;

drop trigger if exists xp_ledger_notify_user on public.xp_ledger;
create trigger xp_ledger_notify_user
  after insert on public.xp_ledger
  for each row execute procedure public.notify_xp_ledger_insert_v1();

create or replace function public.notify_reward_redemption_insert_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_team_id uuid;
begin
  select primary_team_id into v_team_id from public.profiles where id = new.user_id;
  if v_team_id is null then return new; end if;
  insert into public.user_notifications (user_id, team_id, event_type, title, body, source_table, source_id, created_at)
  values (new.user_id, v_team_id, 'reward_redeemed', 'Yêu cầu đổi quà đã được ghi nhận', left(concat(new.reward_name, ' · ', new.xp_cost, ' XP · chờ Leader trao quà'), 500), 'reward_redemptions', new.id, new.created_at)
  on conflict (user_id, event_type, source_id) do nothing;
  return new;
end;
$$;

drop trigger if exists reward_redemptions_notify_user on public.reward_redemptions;
create trigger reward_redemptions_notify_user
  after insert on public.reward_redemptions
  for each row execute procedure public.notify_reward_redemption_insert_v1();

create or replace function public.notify_community_comment_insert_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_owner_id uuid;
begin
  select author_id into v_owner_id from public.community_posts where id = new.post_id;
  if v_owner_id is null or v_owner_id = new.author_id then return new; end if;
  insert into public.user_notifications (user_id, team_id, event_type, title, body, source_table, source_id, created_at)
  values (v_owner_id, new.team_id, 'community_comment', 'Có bình luận mới trong Cộng Đồng', left(concat(new.author_display_name, ': ', new.body), 500), 'community_comments', new.id, new.created_at)
  on conflict (user_id, event_type, source_id) do nothing;
  return new;
end;
$$;

drop trigger if exists community_comments_notify_owner on public.community_comments;
create trigger community_comments_notify_owner
  after insert on public.community_comments
  for each row execute procedure public.notify_community_comment_insert_v1();

create or replace function public.notify_community_reaction_insert_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_owner_id uuid; v_actor text;
begin
  select post.author_id, profile.display_name into v_owner_id, v_actor
  from public.community_posts post join public.profiles profile on profile.id = new.user_id
  where post.id = new.post_id;
  if v_owner_id is null or v_owner_id = new.user_id then return new; end if;
  insert into public.user_notifications (user_id, team_id, event_type, title, body, source_table, source_id, created_at)
  values (v_owner_id, new.team_id, 'community_reaction', 'Đồng đội vừa thả cảm xúc', left(concat(coalesce(v_actor, 'Đồng đội'), ' đã gửi ', case when new.reaction = 'heart' then 'một lời yêu thích' else 'một nụ cười' end), 500), 'community_likes', new.id, new.created_at)
  on conflict (user_id, event_type, source_id) do nothing;
  return new;
end;
$$;

drop trigger if exists community_likes_notify_owner on public.community_likes;
create trigger community_likes_notify_owner
  after insert on public.community_likes
  for each row execute procedure public.notify_community_reaction_insert_v1();

create or replace function public.list_my_notifications_v1()
returns table(id uuid, event_type text, title text, body text, is_read boolean, created_at timestamptz)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select n.id, n.event_type, n.title, n.body, n.is_read, n.created_at
  from public.user_notifications n
  where n.user_id = auth.uid()
  order by n.created_at desc
  limit 50
$$;

create or replace function public.mark_my_notification_read_v1(p_notification_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.user_notifications
  set is_read = true
  where id = p_notification_id and user_id = auth.uid();
  return found;
end;
$$;

create or replace function public.list_my_reward_redemptions_v1()
returns table(id uuid, reward_name text, xp_cost integer, status text, created_at timestamptz, fulfilled_at timestamptz)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select r.id, r.reward_name, r.xp_cost, r.status, r.created_at, r.fulfilled_at
  from public.reward_redemptions r
  where r.user_id = auth.uid()
  order by r.created_at desc
  limit 50
$$;

create or replace function public.list_team_pending_reward_redemptions_v1()
returns table(id uuid, requester text, reward_name text, xp_cost integer, status text, created_at timestamptz)
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  select r.id, p.display_name, r.reward_name, r.xp_cost, r.status, r.created_at
  from public.reward_redemptions r
  join public.profiles p on p.id = r.user_id
  where r.status = 'pending'
    and private.can_manage_team(p.primary_team_id)
  order by r.created_at asc
  limit 100
$$;

create or replace function public.fulfill_team_reward_redemption_v1(p_redemption_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_actor_id uuid := auth.uid();
  v_redemption public.reward_redemptions%rowtype;
  v_team_id uuid;
begin
  if v_actor_id is null then raise exception 'Hãy đăng nhập Leader trước khi xác nhận trao quà.' using errcode = '42501'; end if;
  select r.* into v_redemption from public.reward_redemptions r where r.id = p_redemption_id for update;
  if not found then raise exception 'Không tìm thấy yêu cầu đổi quà.' using errcode = 'P0002'; end if;
  if v_redemption.status <> 'pending' then raise exception 'Yêu cầu này đã được xử lý.' using errcode = '22023'; end if;
  select primary_team_id into v_team_id from public.profiles where id = v_redemption.user_id;
  if v_team_id is null or not private.can_manage_team(v_team_id) then raise exception 'Bạn chỉ có thể xác nhận quà của Team mình.' using errcode = '42501'; end if;

  update public.reward_redemptions
  set status = 'fulfilled', fulfilled_at = now(), fulfilled_by = v_actor_id
  where id = v_redemption.id;

  insert into public.user_notifications (user_id, team_id, event_type, title, body, source_table, source_id)
  values (v_redemption.user_id, v_team_id, 'reward_fulfilled', 'Leader đã xác nhận trao quà', left(concat(v_redemption.reward_name, ' · sẵn sàng nhận phần thưởng O2O của bạn'), 500), 'reward_redemptions', v_redemption.id)
  on conflict (user_id, event_type, source_id) do nothing;

  return jsonb_build_object('id', v_redemption.id, 'status', 'fulfilled', 'fulfilled_at', now());
end;
$$;

revoke all on function public.list_my_notifications_v1() from public;
revoke all on function public.mark_my_notification_read_v1(uuid) from public;
revoke all on function public.list_my_reward_redemptions_v1() from public;
revoke all on function public.list_team_pending_reward_redemptions_v1() from public;
revoke all on function public.fulfill_team_reward_redemption_v1(uuid) from public;
revoke execute on function public.list_my_notifications_v1() from anon;
revoke execute on function public.mark_my_notification_read_v1(uuid) from anon;
revoke execute on function public.list_my_reward_redemptions_v1() from anon;
revoke execute on function public.list_team_pending_reward_redemptions_v1() from anon;
revoke execute on function public.fulfill_team_reward_redemption_v1(uuid) from anon;
revoke execute on function public.notify_xp_ledger_insert_v1() from public, anon, authenticated;
revoke execute on function public.notify_reward_redemption_insert_v1() from public, anon, authenticated;
revoke execute on function public.notify_community_comment_insert_v1() from public, anon, authenticated;
revoke execute on function public.notify_community_reaction_insert_v1() from public, anon, authenticated;
grant execute on function public.list_my_notifications_v1() to authenticated;
grant execute on function public.mark_my_notification_read_v1(uuid) to authenticated;
grant execute on function public.list_my_reward_redemptions_v1() to authenticated;
grant execute on function public.list_team_pending_reward_redemptions_v1() to authenticated;
grant execute on function public.fulfill_team_reward_redemption_v1(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_notifications'
  ) then
    alter publication supabase_realtime add table public.user_notifications;
  end if;
end;
$$;
