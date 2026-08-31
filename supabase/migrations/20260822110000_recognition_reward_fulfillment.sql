-- Recognition fulfillment is an atomic, receiver-only operation. It stores no customer PII.

alter table public.users_profile
  add column if not exists coin_balance integer not null default 0 check (coin_balance >= 0);

alter table public.xp_ledger
  add column if not exists source_recognition_id uuid references public.recognitions(id) on delete set null;

create unique index if not exists xp_ledger_recognition_fulfillment_idx
  on public.xp_ledger (user_id, source_recognition_id)
  where source_recognition_id is not null;

create table if not exists public.recognition_reward_fulfillments (
  id uuid primary key default gen_random_uuid(),
  recognition_id uuid not null unique references public.recognitions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  reward_type text not null check (reward_type in ('none', 'streak_freeze', 'xp', 'voucher', 'coins', 'item')),
  reward_name text,
  amount integer not null default 0 check (amount >= 0),
  xp_ledger_transaction_id uuid references public.xp_ledger(transaction_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists recognition_reward_fulfillments_user_created_idx
  on public.recognition_reward_fulfillments (user_id, created_at desc);

create table if not exists public.agent_reward_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  fulfillment_id uuid not null unique references public.recognition_reward_fulfillments(id) on delete cascade,
  item_type text not null check (item_type in ('streak_freeze', 'voucher', 'item')),
  item_name text not null check (char_length(trim(item_name)) between 1 and 120),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists agent_reward_inventory_user_created_idx
  on public.agent_reward_inventory (user_id, created_at desc);

alter table public.recognition_reward_fulfillments enable row level security;
alter table public.agent_reward_inventory enable row level security;

revoke all on public.recognition_reward_fulfillments from public, anon, authenticated;
revoke all on public.agent_reward_inventory from public, anon, authenticated;
grant select on public.recognition_reward_fulfillments, public.agent_reward_inventory to authenticated;

create policy recognition_reward_fulfillments_owner_select
  on public.recognition_reward_fulfillments
  for select to authenticated
  using (user_id = auth.uid());

create policy agent_reward_inventory_owner_select
  on public.agent_reward_inventory
  for select to authenticated
  using (user_id = auth.uid());

-- Claims must flow through the transaction below; do not leave a partial direct-update path.
revoke update on public.recognitions from authenticated;

create or replace function public.claim_recognition_reward_v1(p_recognition_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_recognition public.recognitions%rowtype;
  v_existing public.recognition_reward_fulfillments%rowtype;
  v_fulfillment_id uuid;
  v_reward_type text := 'none';
  v_reward_name text;
  v_amount integer := 0;
  v_digits text;
  v_total_xp integer := 0;
  v_coin_balance integer := 0;
  v_ledger_transaction_id uuid;
begin
  if v_user_id is null or v_team_id is null or private.current_profile_role() <> 'advisor'::public.pilot_role then
    raise exception 'Chỉ TVV Pilot đã đăng nhập mới có thể nhận Thẻ Vinh Danh.' using errcode = '42501';
  end if;

  select * into v_recognition
  from public.recognitions
  where id = p_recognition_id
  for update;
  if not found then
    raise exception 'Không tìm thấy Thẻ Vinh Danh.' using errcode = 'P0002';
  end if;
  if v_recognition.receiver_id <> v_user_id or v_recognition.team_id <> v_team_id then
    raise exception 'Bạn không có quyền nhận Thẻ Vinh Danh này.' using errcode = '42501';
  end if;

  select * into v_existing
  from public.recognition_reward_fulfillments
  where recognition_id = v_recognition.id;
  if found then
    select total_xp, coin_balance into v_total_xp, v_coin_balance
    from public.users_profile where user_id = v_user_id;
    return jsonb_build_object(
      'recognition_id', v_recognition.id,
      'reward_type', v_existing.reward_type,
      'reward_name', v_existing.reward_name,
      'amount', v_existing.amount,
      'total_xp', coalesce(v_total_xp, 0),
      'coin_balance', coalesce(v_coin_balance, 0),
      'idempotent', true
    );
  end if;

  v_reward_name := nullif(btrim(v_recognition.reward_name), '');
  v_digits := nullif(regexp_replace(coalesce(v_reward_name, ''), '[^0-9]', '', 'g'), '');
  if v_reward_name is null then
    v_reward_type := 'none';
  elsif v_reward_name ilike '%bùa cứu chuỗi%' then
    v_reward_type := 'streak_freeze';
    v_amount := 1;
  elsif v_reward_name ~* 'xp' then
    v_reward_type := 'xp';
    v_amount := least(greatest(coalesce(v_digits::integer, 100), 1), 5000);
  elsif v_reward_name ilike '%voucher%' then
    v_reward_type := 'voucher';
    v_amount := 1;
  elsif v_reward_name ilike '%xu%' then
    v_reward_type := 'coins';
    v_amount := least(greatest(coalesce(v_digits::integer, 50), 1), 50000);
  else
    v_reward_type := 'item';
    v_amount := 1;
  end if;

  insert into public.users_profile (user_id) values (v_user_id)
  on conflict (user_id) do nothing;
  select total_xp, coin_balance into v_total_xp, v_coin_balance
  from public.users_profile where user_id = v_user_id for update;

  insert into public.recognition_reward_fulfillments (recognition_id, user_id, team_id, reward_type, reward_name, amount)
  values (v_recognition.id, v_user_id, v_team_id, v_reward_type, v_reward_name, v_amount)
  returning id into v_fulfillment_id;

  if v_reward_type = 'xp' then
    update public.users_profile
    set total_xp = total_xp + v_amount, last_active_at = now()
    where user_id = v_user_id
    returning total_xp into v_total_xp;
    insert into public.xp_ledger (user_id, xp_amount, reason, description, source_recognition_id)
    values (v_user_id, v_amount, 'manual_adjustment', left(concat('Thẻ Vinh Danh từ Leader · ', coalesce(v_reward_name, 'XP')), 240), v_recognition.id)
    returning transaction_id into v_ledger_transaction_id;
    update public.recognition_reward_fulfillments
    set xp_ledger_transaction_id = v_ledger_transaction_id
    where id = v_fulfillment_id;
  elsif v_reward_type = 'coins' then
    update public.users_profile
    set coin_balance = coin_balance + v_amount, last_active_at = now()
    where user_id = v_user_id
    returning coin_balance into v_coin_balance;
  elsif v_reward_type in ('streak_freeze', 'voucher', 'item') then
    insert into public.agent_reward_inventory (user_id, team_id, fulfillment_id, item_type, item_name, quantity)
    values (v_user_id, v_team_id, v_fulfillment_id, v_reward_type, coalesce(v_reward_name, 'Phần thưởng Vinh Danh'), v_amount);
  end if;

  update public.recognitions
  set is_claimed = true, claimed_at = now()
  where id = v_recognition.id;

  return jsonb_build_object(
    'recognition_id', v_recognition.id,
    'reward_type', v_reward_type,
    'reward_name', v_reward_name,
    'amount', v_amount,
    'total_xp', coalesce(v_total_xp, 0),
    'coin_balance', coalesce(v_coin_balance, 0),
    'idempotent', false
  );
end;
$$;

revoke all on function public.claim_recognition_reward_v1(uuid) from public;
revoke execute on function public.claim_recognition_reward_v1(uuid) from anon;
grant execute on function public.claim_recognition_reward_v1(uuid) to authenticated;
