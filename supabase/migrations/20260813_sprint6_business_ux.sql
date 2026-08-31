-- Sprint 6 UX nghiệp vụ — derived from Database_SaaS_BHNT (1).xlsx.
-- Sources: 2_Nhịp Đập Khách Hàng, 3_Bảo Bối Thực Chiến (W009),
-- 7_Trạm Tiếp Năng Lượng, 10_Trạm Đăng Kiểm Năng Lực.

create table if not exists public.service_levels (
  level smallint primary key check (level between 1 and 6),
  label text not null,
  description text not null,
  coaching_hint text not null,
  source_sheet text not null default '3_Bảo Bối Thực Chiến',
  sort_order integer not null unique
);

create table if not exists public.disc_profiles (
  disc_type text primary key check (disc_type in ('D', 'I', 'S', 'C')),
  headline text not null,
  strengths text not null,
  watch_out text not null,
  selling_style text not null,
  source_evidence text not null,
  source_sheet text not null default '10_Trạm Đăng Kiểm Năng Lực'
);

create table if not exists public.xp_rewards (
  code text primary key,
  name text not null,
  reward_type text not null,
  xp_cost integer not null check (xp_cost > 0),
  status text not null check (status in ('Hoạt động', 'Tạm dừng')),
  source_sheet text not null default '7_Trạm Tiếp Năng Lượng',
  sort_order integer not null
);

alter table public.service_levels enable row level security;
alter table public.disc_profiles enable row level security;
alter table public.xp_rewards enable row level security;

drop policy if exists "sprint6_read_service_levels" on public.service_levels;
create policy "sprint6_read_service_levels" on public.service_levels for select to anon, authenticated using (true);
drop policy if exists "sprint6_read_disc_profiles" on public.disc_profiles;
create policy "sprint6_read_disc_profiles" on public.disc_profiles for select to anon, authenticated using (true);
drop policy if exists "sprint6_read_xp_rewards" on public.xp_rewards;
create policy "sprint6_read_xp_rewards" on public.xp_rewards for select to anon, authenticated using (true);
grant select on public.service_levels, public.disc_profiles, public.xp_rewards to anon, authenticated;

-- Daily Log UX now exposes the business wording “Ký Hợp Đồng”; legacy Chốt HĐ remains valid for existing rows.
alter table public.daily_logs drop constraint if exists daily_logs_action_result_check;
alter table public.daily_logs add constraint daily_logs_action_result_check check (action_result in ('Ký Hợp Đồng', 'Chốt HĐ', 'Dời lịch', 'Từ chối'));
alter table public.daily_logs drop constraint if exists daily_logs_follow_up_required;
alter table public.daily_logs add constraint daily_logs_follow_up_required check (action_result <> 'Dời lịch' or follow_up_date is not null);

create or replace function public.award_xp_from_daily_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  awarded_xp integer := 0;
  xp_reason text;
begin
  if new.action_result in ('Ký Hợp Đồng', 'Chốt HĐ') then
    awarded_xp := 250;
    xp_reason := 'closed_policy';
  elsif new.service_level = 6 then
    awarded_xp := 50;
    xp_reason := 'service_wow';
  end if;

  insert into public.users_profile (user_id) values (new.user_id) on conflict (user_id) do nothing;
  update public.users_profile
  set current_streak = case when last_streak_date = current_date then current_streak when last_streak_date = current_date - 1 then current_streak + 1 else 1 end,
      last_streak_date = current_date,
      last_active_at = now()
  where user_id = new.user_id;

  if awarded_xp > 0 then
    insert into public.xp_ledger (user_id, xp_amount, reason, source_log_id)
    values (new.user_id, awarded_xp, xp_reason, new.log_id)
    on conflict (source_log_id) do nothing;
    update public.users_profile set total_xp = total_xp + awarded_xp where user_id = new.user_id;
  end if;
  return new;
end;
$$;

insert into public.service_levels (level, label, description, coaching_hint, sort_order) values
  (1, 'Tệ — Khách phàn nàn', 'Cấp 1: trải nghiệm đứt gãy hoặc khách phàn nàn; đây là tín hiệu cần xử lý ngay.', 'Đừng bỏ khách giữa chợ: xác nhận vấn đề, nhận trách nhiệm và hẹn thời điểm phản hồi rõ ràng.', 1),
  (2, 'Thợ săn', 'Cấp 2: chỉ xuất hiện lúc chốt deal hoặc thu phí; khách chưa cảm nhận được sự đồng hành.', 'Chủ động tạo một chạm sau bán trước khi khách phải nhắc.', 2),
  (3, 'Như mong đợi', 'Cấp 3: người đưa thư — làm đúng quy trình, khách nghe tư vấn bình thường.', 'Thêm một hành động chủ động để chuyển từ đúng sang hơn mong đợi.', 3),
  (4, 'Hơn mong đợi', 'Cấp 4: chủ động nhắc nhở, gửi thông tin hữu ích và đi trước nhu cầu khách hàng.', 'Ghi lại hành động nào giúp khách thấy được quan tâm.', 4),
  (5, 'Ngạc nhiên', 'Cấp 5: bảo vệ quyền lợi, xử lý êm đẹp khi có sự cố claim.', 'Duy trì sự nhất quán để khoảnh khắc tốt trở thành niềm tin dài hạn.', 5),
  (6, 'WOW — Khách giới thiệu khách', 'Cấp 6: có mặt lúc hoạn nạn hoặc tạo bất ngờ không nhân dịp; khách chủ động giới thiệu khách.', 'Ghi lại khoảnh khắc WOW để nhân rộng cách làm cho đội ngũ.', 6)
on conflict (level) do update set label = excluded.label, description = excluded.description, coaching_hint = excluded.coaching_hint, sort_order = excluded.sort_order;

-- The source sheet contains five D/I/S/C behavioral choices but no separate result rows.
-- Copy below synthesizes each outcome from those exact patterns and preserves source evidence for traceability.
insert into public.disc_profiles (disc_type, headline, strengths, watch_out, selling_style, source_evidence) values
  ('D', 'Người dẫn dắt — quyết nhanh, tiến thẳng mục tiêu.', 'Điểm mạnh: quyết đoán, thích chinh phục và có năng lượng đưa ra quyết định.', 'Điểm cần cân bằng: chậm lại một nhịp để khách có không gian nói hết nỗi lo trước khi chốt.', 'Phong cách tư vấn: nêu quyền lợi chính, mốc thời gian và bước hành động kế tiếp thật rõ.', 'Từ các lựa chọn: lập luận sắc bén, hướng tới chốt deal, quyết định nhanh và chinh phục giải thưởng.'),
  ('I', 'Người truyền lửa — kết nối bằng năng lượng và sự hiện diện.', 'Điểm mạnh: cởi mở, tạo bầu không khí tích cực và xây quan hệ nhanh.', 'Điểm cần cân bằng: gắn cảm xúc tích cực với một cam kết, mốc hẹn hoặc bước follow-up cụ thể.', 'Phong cách tư vấn: kể câu chuyện, ghi nhận niềm vui gia đình và tạo cuộc trò chuyện dễ mở lòng.', 'Từ các lựa chọn: hài hước, nhiệt tình, khuấy động phong trào và xây dựng thương hiệu cá nhân.'),
  ('S', 'Người đồng hành — kiên nhẫn tạo cảm giác an tâm.', 'Điểm mạnh: lắng nghe sâu, tạo tin cậy và bền bỉ theo sát khách hàng.', 'Điểm cần cân bằng: đưa ra lời mời hành động nhẹ nhàng để sự đồng hành không kéo dài thành trì hoãn.', 'Phong cách tư vấn: hỏi về điều khách đang lo, giải thích bình tĩnh và đồng hành theo nhịp gia đình.', 'Từ các lựa chọn: lắng nghe, kiên nhẫn, hòa giải, đồng thuận và mang lại bình an cho gia đình.'),
  ('C', 'Chuyên gia minh bạch — thuyết phục bằng sự chính xác.', 'Điểm mạnh: cẩn trọng, giàu bằng chứng và làm rõ điều khoản để khách an tâm.', 'Điểm cần cân bằng: chuyển số liệu thành ngôn ngữ đời thường để khách không bị quá tải thông tin.', 'Phong cách tư vấn: dùng bảng dòng tiền, điều khoản trọng yếu và checklist để khách hiểu trước khi quyết.', 'Từ các lựa chọn: số liệu, biểu đồ, điều khoản pháp lý, phân tích lỗ hổng và hoạch định tài chính minh bạch.')
on conflict (disc_type) do update set headline = excluded.headline, strengths = excluded.strengths, watch_out = excluded.watch_out, selling_style = excluded.selling_style, source_evidence = excluded.source_evidence;

insert into public.xp_rewards (code, name, reward_type, xp_cost, status, sort_order) values
  ('Q001', 'Bùa Cứu Chuỗi (Streak Freeze)', 'Đặc quyền App', 50, 'Hoạt động', 1),
  ('Q002', 'Cốc Cafe Starbucks từ Sếp', 'Hiện vật', 150, 'Hoạt động', 2),
  ('Q003', 'Yêu cầu Sếp đi chốt sale cùng 1 ca', 'Đặc quyền VIP', 500, 'Hoạt động', 3)
on conflict (code) do update set name = excluded.name, reward_type = excluded.reward_type, xp_cost = excluded.xp_cost, status = excluded.status, sort_order = excluded.sort_order;
