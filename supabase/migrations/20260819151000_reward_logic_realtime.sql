-- Reward-store, advisor gifting, monthly-target reward and receiver realtime notification.
-- No customer PII is accepted, stored or emitted by these functions.

create or replace function public.award_advisor_auto_xp_v1(
  p_source text,
  p_source_key text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_team_id uuid := private.current_team_id();
  v_amount integer;
  v_ledger_source text;
  v_description text;
  v_total_xp integer;
  v_streak integer;
  v_transaction_id uuid;
  v_source_uuid uuid;
begin
  if v_user_id is null or v_team_id is null or private.current_profile_role() <> 'advisor'::public.pilot_role then
    raise exception 'Chỉ TVV Pilot đã đăng nhập mới có thể nhận XP tự động.' using errcode = '42501';
  end if;

  case p_source
    when 'daily_quiz_correct' then v_amount := 15; v_ledger_source := 'daily_quiz'; v_description := 'Nạp Não Mỗi Sáng · Đáp án đúng';
    when 'daily_quiz_incorrect' then v_amount := 10; v_ledger_source := 'daily_quiz'; v_description := 'Nạp Não Mỗi Sáng · Hoàn tất câu hỏi';
    when 'customer_pulse_l1' then v_amount := 5; v_ledger_source := p_source; v_description := 'Nhịp đập khách hàng · Cấp độ 1';
    when 'customer_pulse_l2_plus' then v_amount := 10; v_ledger_source := p_source; v_description := 'Nhịp đập khách hàng · Cấp độ 2+';
    when 'community_post' then v_amount := 5; v_ledger_source := p_source; v_description := 'Cộng đồng · Chia sẻ một bài viết';
    when 'community_comment' then v_amount := 1; v_ledger_source := p_source; v_description := 'Cộng đồng · Gửi một lời động viên';
    when 'training_roleplay' then v_amount := 10; v_ledger_source := p_source; v_description := 'Bảo bối · Hoàn tất Roleplay';
    when 'training_video' then v_amount := 5; v_ledger_source := p_source; v_description := 'Bảo bối · Xem Video Thực Chiến';
    when 'monthly_target_set' then v_amount := 5; v_ledger_source := p_source; v_description := 'Mục tiêu tháng · Đã thiết lập mục tiêu';
    else raise exception 'Nguồn XP tự động không hợp lệ.' using errcode = '22023';
  end case;

  if v_ledger_source = 'daily_quiz' then
    if p_source_key <> current_date::text then raise exception 'Mã phiên Daily Quiz không hợp lệ.' using errcode = '22023'; end if;
    if exists (select 1 from public.xp_ledger where user_id = v_user_id and reason = 'daily_quiz' and created_at::date = current_date) then
      select total_xp, current_streak into v_total_xp, v_streak from public.users_profile where user_id = v_user_id;
      return jsonb_build_object('awarded', false, 'xp_amount', 0, 'total_xp', coalesce(v_total_xp, 0), 'current_streak', coalesce(v_streak, 0), 'source', p_source);
    end if;
  elsif p_source = 'monthly_target_set' then
    if p_source_key <> to_char(current_date, 'YYYY-MM') then raise exception 'Mã tháng mục tiêu không hợp lệ.' using errcode = '22023'; end if;
    if not exists (select 1 from public.users_profile where user_id = v_user_id and target_income > 0) then raise exception 'Hãy lưu Mục tiêu tháng trước khi nhận XP.' using errcode = '42501'; end if;
  else
    if p_source_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'Mã hành động XP không hợp lệ.' using errcode = '22023'; end if;
    v_source_uuid := p_source_key::uuid;
    if p_source in ('customer_pulse_l1', 'customer_pulse_l2_plus') and not exists (select 1 from public.activity_events where id = v_source_uuid and user_id = v_user_id and team_id = v_team_id) then raise exception 'Không tìm thấy Nhịp Đập hợp lệ để cấp XP.' using errcode = '42501'; end if;
    if p_source in ('training_roleplay', 'training_video') and not exists (select 1 from public.activity_events where id = v_source_uuid and user_id = v_user_id and team_id = v_team_id and event_type = 'learning_session') then raise exception 'Không tìm thấy phiên học hợp lệ để cấp XP.' using errcode = '42501'; end if;
    if p_source = 'community_post' and not exists (select 1 from public.community_posts where id = v_source_uuid and author_id = v_user_id and team_id = v_team_id) then raise exception 'Không tìm thấy bài viết Team hợp lệ để cấp XP.' using errcode = '42501'; end if;
    if p_source = 'community_comment' and not exists (select 1 from public.community_comments where id = v_source_uuid and author_id = v_user_id and team_id = v_team_id) then raise exception 'Không tìm thấy bình luận Team hợp lệ để cấp XP.' using errcode = '42501'; end if;
  end if;

  insert into public.users_profile (user_id) values (v_user_id) on conflict (user_id) do nothing;
  insert into public.xp_ledger (user_id, xp_amount, reason, description, auto_source, auto_source_key)
  values (v_user_id, v_amount, case when v_ledger_source = 'daily_quiz' then 'daily_quiz' else 'manual_adjustment' end, v_description, v_ledger_source, p_source_key)
  on conflict (user_id, auto_source, auto_source_key) where auto_source is not null and auto_source_key is not null do nothing
  returning transaction_id into v_transaction_id;
  if v_transaction_id is null then
    select total_xp, current_streak into v_total_xp, v_streak from public.users_profile where user_id = v_user_id;
    return jsonb_build_object('awarded', false, 'xp_amount', 0, 'total_xp', coalesce(v_total_xp, 0), 'current_streak', coalesce(v_streak, 0), 'source', p_source);
  end if;
  update public.users_profile set total_xp = total_xp + v_amount, current_streak = case when v_ledger_source = 'daily_quiz' then case when last_streak_date = current_date then current_streak when last_streak_date = current_date - 1 then current_streak + 1 else 1 end else current_streak end, last_streak_date = case when v_ledger_source = 'daily_quiz' then current_date else last_streak_date end, last_active_at = now() where user_id = v_user_id returning total_xp, current_streak into v_total_xp, v_streak;
  return jsonb_build_object('awarded', true, 'xp_amount', v_amount, 'total_xp', v_total_xp, 'current_streak', v_streak, 'source', p_source);
end;
$$;

create or replace function public.gift_team_xp_v2(
  p_recipient_id uuid, p_amount integer, p_note text,
  p_publish_to_community boolean default false, p_idempotency_key uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_giver_id uuid := auth.uid(); v_team_id uuid := private.current_team_id();
  v_balance integer; v_remaining integer; v_recipient_xp integer; v_gift_id uuid; v_post_id uuid; v_existing jsonb; v_post_body text;
begin
  if v_giver_id is null or v_team_id is null then raise exception 'Hãy đăng nhập tài khoản Pilot hợp lệ.' using errcode = '42501'; end if;
  if p_recipient_id is null or p_recipient_id = v_giver_id then raise exception 'Hãy chọn một đồng đội khác để tặng XP.' using errcode = '22023'; end if;
  if p_amount is null or p_amount not between 1 and 5000 then raise exception 'XP tặng phải nằm trong khoảng 1 đến 5000.' using errcode = '22023'; end if;
  if p_note is null or char_length(trim(p_note)) not between 4 and 240 or p_note ~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})' then raise exception 'Lời vinh danh phải dài 4–240 ký tự và không chứa PII.' using errcode = '22023'; end if;
  if not private.user_belongs_to_team(p_recipient_id, v_team_id) then raise exception 'Người nhận không thuộc Team hiện tại.' using errcode = '42501'; end if;
  select jsonb_build_object('gift_id', g.id, 'giver_remaining_xp_budget', (select xp_balance from public.profiles where id = g.giver_id), 'recipient_total_xp', (select total_xp from public.users_profile where user_id = g.recipient_id), 'community_post_id', g.post_id, 'idempotent', true) into v_existing from public.xp_gifts g where g.giver_id = v_giver_id and g.idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;
  select xp_balance into v_balance from public.profiles where id = v_giver_id for update;
  if coalesce(v_balance, 0) < p_amount then raise exception 'Quỹ XP hiện không đủ cho lần tặng này.' using errcode = '22023'; end if;
  insert into public.users_profile (user_id) values (p_recipient_id) on conflict (user_id) do nothing;
  select total_xp into v_recipient_xp from public.users_profile where user_id = p_recipient_id for update;
  if p_publish_to_community then
    select concat('Vinh danh đồng đội: ', trim(p_note), ' · +', p_amount, ' XP') into v_post_body;
    insert into public.community_posts (team_id, author_id, author_role, body) values (v_team_id, v_giver_id, (select role from public.profiles where id = v_giver_id), v_post_body) returning id into v_post_id;
  end if;
  insert into public.xp_gifts (team_id, giver_id, recipient_id, post_id, xp_amount, note, idempotency_key, community_posted) values (v_team_id, v_giver_id, p_recipient_id, v_post_id, p_amount, trim(p_note), p_idempotency_key, p_publish_to_community) returning id into v_gift_id;
  update public.profiles set xp_balance = xp_balance - p_amount where id = v_giver_id and xp_balance >= p_amount returning xp_balance into v_remaining;
  if v_remaining is null then raise exception 'Không thể khấu trừ quỹ XP của người gửi.' using errcode = '40001'; end if;
  update public.users_profile set total_xp = total_xp + p_amount where user_id = p_recipient_id;
  insert into public.xp_ledger (user_id, xp_amount, reason, description, source_gift_id) values (p_recipient_id, p_amount, 'manual_adjustment', trim(p_note), v_gift_id);
  return jsonb_build_object('gift_id', v_gift_id, 'giver_remaining_xp_budget', v_remaining, 'recipient_total_xp', coalesce(v_recipient_xp, 0) + p_amount, 'community_post_id', v_post_id, 'idempotent', false);
end;
$$;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'xp_ledger') then
    alter publication supabase_realtime add table public.xp_ledger;
  end if;
end;
$$;

revoke all on function public.award_advisor_auto_xp_v1(text, text) from public;
revoke execute on function public.award_advisor_auto_xp_v1(text, text) from anon;
grant execute on function public.award_advisor_auto_xp_v1(text, text) to authenticated;
revoke all on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) from public;
revoke execute on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) from anon;
grant execute on function public.gift_team_xp_v2(uuid, integer, text, boolean, uuid) to authenticated;
