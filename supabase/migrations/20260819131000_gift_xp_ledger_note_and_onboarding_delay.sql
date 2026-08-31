-- Preserve the human recognition note separately from the technical ledger reason.
-- Notes are already validated for length and Zero-PII by gift_team_xp_v2.

alter table public.xp_ledger
  add column if not exists description text;

update public.xp_ledger l
set description = g.note
from public.xp_gifts g
where l.source_gift_id = g.id
  and l.description is null;

create or replace function public.gift_team_xp_v2(
  p_recipient_id uuid,
  p_amount integer,
  p_note text,
  p_publish_to_community boolean default false,
  p_idempotency_key uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_giver_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_balance integer;
  v_recipient_xp integer;
  v_gift_id uuid;
  v_post_id uuid;
  v_existing jsonb;
  v_post_body text;
begin
  if v_giver_id is null or v_team_id is null then
    raise exception 'Hãy đăng nhập tài khoản Pilot hợp lệ.' using errcode = '42501';
  end if;
  if p_recipient_id is null or p_recipient_id = v_giver_id then
    raise exception 'Hãy chọn một đồng đội khác để tặng XP.' using errcode = '22023';
  end if;
  if p_amount is null or p_amount not between 1 and 5000 then
    raise exception 'XP tặng phải nằm trong khoảng 1 đến 5000.' using errcode = '22023';
  end if;
  if p_note is null or char_length(trim(p_note)) not between 4 and 240
     or p_note ~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})' then
    raise exception 'Lời vinh danh phải dài 4–240 ký tự và không chứa PII.' using errcode = '22023';
  end if;
  if not private.user_belongs_to_team(p_recipient_id, v_team_id) then
    raise exception 'Người nhận không thuộc Team hiện tại.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'gift_id', g.id,
    'giver_remaining_xp_budget', (select xp_balance from public.profiles where id = g.giver_id),
    'recipient_total_xp', (select total_xp from public.users_profile where user_id = g.recipient_id),
    'community_post_id', g.post_id,
    'idempotent', true
  ) into v_existing
  from public.xp_gifts g
  where g.giver_id = v_giver_id and g.idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;

  select xp_balance into v_balance from public.profiles where id = v_giver_id for update;
  if coalesce(v_balance, 0) < p_amount then
    raise exception 'Quỹ XP hiện không đủ cho lần tặng này.' using errcode = '22023';
  end if;

  insert into public.users_profile (user_id) values (p_recipient_id)
  on conflict (user_id) do nothing;
  select total_xp into v_recipient_xp from public.users_profile where user_id = p_recipient_id for update;

  if p_publish_to_community then
    select concat('Vinh danh đồng đội: ', trim(p_note), ' · +', p_amount, ' XP') into v_post_body;
    insert into public.community_posts (team_id, author_id, author_role, body)
    values (v_team_id, v_giver_id, (select role from public.profiles where id = v_giver_id), v_post_body)
    returning id into v_post_id;
  end if;

  insert into public.xp_gifts (team_id, giver_id, recipient_id, post_id, xp_amount, note, idempotency_key, community_posted)
  values (v_team_id, v_giver_id, p_recipient_id, v_post_id, p_amount, trim(p_note), p_idempotency_key, p_publish_to_community)
  returning id into v_gift_id;

  update public.profiles set xp_balance = xp_balance - p_amount where id = v_giver_id;
  update public.users_profile set total_xp = total_xp + p_amount where user_id = p_recipient_id;
  insert into public.xp_ledger (user_id, xp_amount, reason, description, source_gift_id)
  values (p_recipient_id, p_amount, 'manual_adjustment', trim(p_note), v_gift_id);

  return jsonb_build_object(
    'gift_id', v_gift_id,
    'giver_remaining_xp_budget', v_balance - p_amount,
    'recipient_total_xp', coalesce(v_recipient_xp, 0) + p_amount,
    'community_post_id', v_post_id,
    'idempotent', false
  );
end;
$$;

revoke all on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) from public;
revoke execute on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) from anon;
grant execute on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) to authenticated;
