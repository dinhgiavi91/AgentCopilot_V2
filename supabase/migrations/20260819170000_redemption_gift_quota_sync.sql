-- Reward redemption is an auditable XP deduction; no customer PII is stored.
create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_code text not null references public.xp_rewards(code),
  reward_name text not null,
  xp_cost integer not null check (xp_cost > 0),
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'cancelled')),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
alter table public.reward_redemptions enable row level security;
drop policy if exists "reward_redemptions_owner_or_super_admin_read" on public.reward_redemptions;
create policy "reward_redemptions_owner_or_super_admin_read" on public.reward_redemptions for select to authenticated using (user_id = auth.uid() or private.current_profile_role() = 'super_admin'::public.pilot_role);

create or replace function public.redeem_xp_reward_v1(p_reward_code text, p_idempotency_key uuid default gen_random_uuid())
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost integer;
  v_name text;
  v_status text;
  v_remaining integer;
  v_redemption_id uuid;
begin
  if v_user_id is null or private.current_team_id() is null then raise exception 'Hãy đăng nhập tài khoản Pilot hợp lệ.' using errcode = '42501'; end if;
  if p_reward_code is null or btrim(p_reward_code) = '' then raise exception 'Chọn quà hợp lệ trước khi đổi.' using errcode = '22023'; end if;
  select xp_cost, name, status into v_cost, v_name, v_status from public.xp_rewards where code = p_reward_code;
  if v_cost is null or v_status <> 'Hoạt động' then raise exception 'Quà này hiện chưa thể đổi.' using errcode = '22023'; end if;
  select id into v_redemption_id from public.reward_redemptions where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if v_redemption_id is not null then
    select total_xp into v_remaining from public.users_profile where user_id = v_user_id;
    return jsonb_build_object('redemption_id', v_redemption_id, 'reward_name', v_name, 'xp_cost', v_cost, 'remaining_total_xp', coalesce(v_remaining, 0), 'idempotent', true);
  end if;
  insert into public.users_profile (user_id) values (v_user_id) on conflict (user_id) do nothing;
  select total_xp into v_remaining from public.users_profile where user_id = v_user_id for update;
  if coalesce(v_remaining, 0) < v_cost then raise exception 'Chưa đủ XP để đổi quà này.' using errcode = '22023'; end if;
  update public.users_profile set total_xp = total_xp - v_cost, last_active_at = now() where user_id = v_user_id and total_xp >= v_cost returning total_xp into v_remaining;
  if v_remaining is null then raise exception 'Không thể khấu trừ XP cho yêu cầu đổi quà.' using errcode = '40001'; end if;
  insert into public.reward_redemptions (user_id, reward_code, reward_name, xp_cost, idempotency_key) values (v_user_id, p_reward_code, v_name, v_cost, p_idempotency_key) returning id into v_redemption_id;
  insert into public.xp_ledger (user_id, xp_amount, reason, description) values (v_user_id, -v_cost, 'manual_adjustment', concat('Đổi quà: ', v_name));
  return jsonb_build_object('redemption_id', v_redemption_id, 'reward_name', v_name, 'xp_cost', v_cost, 'remaining_total_xp', v_remaining, 'idempotent', false);
end;
$$;

create or replace function public.gift_team_xp_v2(p_recipient_id uuid, p_amount integer, p_note text, p_publish_to_community boolean default false, p_idempotency_key uuid default gen_random_uuid())
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_giver_id uuid := auth.uid(); v_team_id uuid := private.current_team_id(); v_role public.pilot_role;
  v_balance integer; v_remaining integer; v_recipient_xp integer; v_gift_id uuid; v_post_id uuid; v_existing jsonb; v_post_body text;
begin
  if v_giver_id is null or v_team_id is null then raise exception 'Hãy đăng nhập tài khoản Pilot hợp lệ.' using errcode = '42501'; end if;
  if p_recipient_id is null or p_recipient_id = v_giver_id then raise exception 'Hãy chọn một đồng đội khác để tặng XP.' using errcode = '22023'; end if;
  if p_amount is null or p_amount not between 1 and 5000 then raise exception 'XP tặng phải nằm trong khoảng 1 đến 5000.' using errcode = '22023'; end if;
  if p_note is null or char_length(trim(p_note)) not between 4 and 240 or p_note ~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})' then raise exception 'Lời vinh danh phải dài 4–240 ký tự và không chứa PII.' using errcode = '22023'; end if;
  if not private.user_belongs_to_team(p_recipient_id, v_team_id) then raise exception 'Người nhận không thuộc Team hiện tại.' using errcode = '42501'; end if;
  select role into v_role from public.profiles where id = v_giver_id and is_active = true for update;
  if v_role is null then raise exception 'Không tìm thấy hồ sơ người tặng.' using errcode = '42501'; end if;
  select jsonb_build_object('gift_id', g.id, 'giver_remaining_xp_budget', case when v_role = 'advisor'::public.pilot_role then coalesce((select total_xp from public.users_profile where user_id = g.giver_id), 0) else coalesce((select xp_balance from public.profiles where id = g.giver_id), 0) end, 'recipient_total_xp', (select total_xp from public.users_profile where user_id = g.recipient_id), 'community_post_id', g.post_id, 'idempotent', true) into v_existing from public.xp_gifts g where g.giver_id = v_giver_id and g.idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;
  insert into public.users_profile (user_id) values (v_giver_id), (p_recipient_id) on conflict (user_id) do nothing;
  if v_role = 'advisor'::public.pilot_role then
    select total_xp into v_balance from public.users_profile where user_id = v_giver_id for update;
    if coalesce(v_balance, 0) < p_amount then raise exception 'Điểm XP thành tích hiện không đủ cho lần tặng này.' using errcode = '22023'; end if;
  else
    select xp_balance into v_balance from public.profiles where id = v_giver_id for update;
    if coalesce(v_balance, 0) < p_amount then raise exception 'Quỹ XP hiện không đủ cho lần tặng này.' using errcode = '22023'; end if;
  end if;
  select total_xp into v_recipient_xp from public.users_profile where user_id = p_recipient_id for update;
  if p_publish_to_community then select concat('Vinh danh đồng đội: ', trim(p_note), ' · +', p_amount, ' XP') into v_post_body; insert into public.community_posts (team_id, author_id, author_role, body) values (v_team_id, v_giver_id, v_role, v_post_body) returning id into v_post_id; end if;
  insert into public.xp_gifts (team_id, giver_id, recipient_id, post_id, xp_amount, note, idempotency_key, community_posted) values (v_team_id, v_giver_id, p_recipient_id, v_post_id, p_amount, trim(p_note), p_idempotency_key, p_publish_to_community) returning id into v_gift_id;
  if v_role = 'advisor'::public.pilot_role then
    update public.users_profile set total_xp = total_xp - p_amount where user_id = v_giver_id and total_xp >= p_amount returning total_xp into v_remaining;
    if v_remaining is null then raise exception 'Không thể khấu trừ XP thành tích của TVV.' using errcode = '40001'; end if;
    insert into public.xp_ledger (user_id, xp_amount, reason, description, source_gift_id) values (v_giver_id, -p_amount, 'manual_adjustment', concat('Tặng XP cho đồng đội: ', trim(p_note)), v_gift_id);
  else
    update public.profiles set xp_balance = xp_balance - p_amount where id = v_giver_id and xp_balance >= p_amount returning xp_balance into v_remaining;
    if v_remaining is null then raise exception 'Không thể khấu trừ quỹ XP của người gửi.' using errcode = '40001'; end if;
    insert into public.xp_ledger (user_id, xp_amount, reason, description, source_gift_id) values (v_giver_id, -p_amount, 'manual_adjustment', concat('Đã dùng quỹ Leader để tặng XP: ', trim(p_note)), v_gift_id);
  end if;
  update public.users_profile set total_xp = total_xp + p_amount where user_id = p_recipient_id;
  insert into public.xp_ledger (user_id, xp_amount, reason, description, source_gift_id) values (p_recipient_id, p_amount, 'manual_adjustment', trim(p_note), v_gift_id);
  return jsonb_build_object('gift_id', v_gift_id, 'giver_remaining_xp_budget', v_remaining, 'recipient_total_xp', coalesce(v_recipient_xp, 0) + p_amount, 'community_post_id', v_post_id, 'idempotent', false);
end;
$$;

create or replace function public.list_reward_redemptions_v1()
returns table(id uuid, requester text, reward_name text, xp_cost integer, status text, created_at timestamptz)
language sql
security definer
set search_path = pg_catalog, public, private
as $$
  select r.id, p.display_name, r.reward_name, r.xp_cost, r.status, r.created_at
  from public.reward_redemptions r join public.profiles p on p.id = r.user_id
  where private.current_profile_role() = 'super_admin'::public.pilot_role
  order by r.created_at desc limit 100
$$;

revoke all on function public.redeem_xp_reward_v1(text, uuid) from public;
revoke all on function public.list_reward_redemptions_v1() from public;
grant execute on function public.redeem_xp_reward_v1(text, uuid) to authenticated;
grant execute on function public.list_reward_redemptions_v1() to authenticated;
