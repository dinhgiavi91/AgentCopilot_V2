-- Automated XP rewards are scoped to the authenticated Advisor and the originating action.
-- No customer PII is accepted, stored, or derived by this function.

alter table public.xp_ledger
  add column if not exists auto_source text,
  add column if not exists auto_source_key text;

create unique index if not exists xp_ledger_auto_reward_idempotency_idx
  on public.xp_ledger(user_id, auto_source, auto_source_key)
  where auto_source is not null and auto_source_key is not null;

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
    else raise exception 'Nguồn XP tự động không hợp lệ.' using errcode = '22023';
  end case;

  if v_ledger_source = 'daily_quiz' then
    if p_source_key <> current_date::text then
      raise exception 'Mã phiên Daily Quiz không hợp lệ.' using errcode = '22023';
    end if;
    if exists (
      select 1 from public.xp_ledger
      where user_id = v_user_id and reason = 'daily_quiz' and created_at::date = current_date
    ) then
      select total_xp, current_streak into v_total_xp, v_streak from public.users_profile where user_id = v_user_id;
      return jsonb_build_object('awarded', false, 'xp_amount', 0, 'total_xp', coalesce(v_total_xp, 0), 'current_streak', coalesce(v_streak, 0), 'source', p_source);
    end if;
  else
    if p_source_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Mã hành động XP không hợp lệ.' using errcode = '22023';
    end if;
    v_source_uuid := p_source_key::uuid;
    if p_source in ('customer_pulse_l1', 'customer_pulse_l2_plus') and not exists (
      select 1 from public.activity_events where id = v_source_uuid and user_id = v_user_id and team_id = v_team_id
    ) then
      raise exception 'Không tìm thấy Nhịp Đập hợp lệ để cấp XP.' using errcode = '42501';
    end if;
    if p_source in ('training_roleplay', 'training_video') and not exists (
      select 1 from public.activity_events where id = v_source_uuid and user_id = v_user_id and team_id = v_team_id and event_type = 'learning_session'
    ) then
      raise exception 'Không tìm thấy phiên học hợp lệ để cấp XP.' using errcode = '42501';
    end if;
    if p_source = 'community_post' and not exists (
      select 1 from public.community_posts where id = v_source_uuid and author_id = v_user_id and team_id = v_team_id
    ) then
      raise exception 'Không tìm thấy bài viết Team hợp lệ để cấp XP.' using errcode = '42501';
    end if;
    if p_source = 'community_comment' and not exists (
      select 1 from public.community_comments where id = v_source_uuid and author_id = v_user_id and team_id = v_team_id
    ) then
      raise exception 'Không tìm thấy bình luận Team hợp lệ để cấp XP.' using errcode = '42501';
    end if;
  end if;

  insert into public.users_profile (user_id) values (v_user_id)
  on conflict (user_id) do nothing;

  insert into public.xp_ledger (user_id, xp_amount, reason, description, auto_source, auto_source_key)
  values (v_user_id, v_amount, case when v_ledger_source = 'daily_quiz' then 'daily_quiz' else 'manual_adjustment' end, v_description, v_ledger_source, p_source_key)
  on conflict (user_id, auto_source, auto_source_key) where auto_source is not null and auto_source_key is not null
  do nothing
  returning transaction_id into v_transaction_id;

  if v_transaction_id is null then
    select total_xp, current_streak into v_total_xp, v_streak from public.users_profile where user_id = v_user_id;
    return jsonb_build_object('awarded', false, 'xp_amount', 0, 'total_xp', coalesce(v_total_xp, 0), 'current_streak', coalesce(v_streak, 0), 'source', p_source);
  end if;

  update public.users_profile
  set total_xp = total_xp + v_amount,
      current_streak = case when v_ledger_source = 'daily_quiz' then
        case when last_streak_date = current_date then current_streak
             when last_streak_date = current_date - 1 then current_streak + 1
             else 1 end
        else current_streak end,
      last_streak_date = case when v_ledger_source = 'daily_quiz' then current_date else last_streak_date end,
      last_active_at = now()
  where user_id = v_user_id
  returning total_xp, current_streak into v_total_xp, v_streak;

  return jsonb_build_object('awarded', true, 'xp_amount', v_amount, 'total_xp', v_total_xp, 'current_streak', v_streak, 'source', p_source);
end;
$$;

revoke all on function public.award_advisor_auto_xp_v1(text, text) from public;
revoke execute on function public.award_advisor_auto_xp_v1(text, text) from anon;
grant execute on function public.award_advisor_auto_xp_v1(text, text) to authenticated;
