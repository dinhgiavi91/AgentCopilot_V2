
-- Sprint 6 — Operational modules sourced from Database_SaaS_BHNT (1).xlsx.
-- Zero-PII: content tables hold operational knowledge only. Feedback must not contain customer identifiers.
create extension if not exists "pgcrypto";

create table if not exists public.disc_questions (
  code text primary key,
  question text not null,
  option_d text not null,
  option_i text not null,
  option_s text not null,
  option_c text not null,
  source_sheet text not null default '10_Trạm Đăng Kiểm Năng Lực',
  sort_order integer not null check (sort_order > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.cover_letters (
  code text primary key,
  situation text not null,
  body_template text not null,
  source_sheet text not null default '5_Trợ Lý Thẩm Định',
  sort_order integer not null check (sort_order > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.news_case_studies (
  code text primary key,
  category text not null,
  title text not null,
  summary text not null,
  field_takeaway text not null,
  published_at timestamptz,
  source_sheet text not null default '11_Bản Tin 90s & Án Lệ',
  sort_order integer not null check (sort_order > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.disc_assessments (
  assessment_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  disc_type text not null check (disc_type in ('D', 'I', 'S', 'C')),
  score_d smallint not null default 0,
  score_i smallint not null default 0,
  score_s smallint not null default 0,
  score_c smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_entries (
  feedback_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  favorite_feature text not null check (char_length(favorite_feature) <= 120),
  suggestion text not null check (char_length(suggestion) between 3 and 1000),
  created_at timestamptz not null default now()
);

alter table public.feedback_entries drop constraint if exists feedback_entries_no_contact_pii;
alter table public.feedback_entries add constraint feedback_entries_no_contact_pii check (
  concat_ws(' ', favorite_feature, suggestion) !~* '([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}|(\+?84|0)[0-9 .\-]{8,})'
);

create index if not exists disc_assessments_user_created_idx on public.disc_assessments(user_id, created_at desc);
create index if not exists feedback_entries_created_idx on public.feedback_entries(created_at desc);

alter table public.disc_questions enable row level security;
alter table public.cover_letters enable row level security;
alter table public.news_case_studies enable row level security;
alter table public.disc_assessments enable row level security;
alter table public.feedback_entries enable row level security;

drop policy if exists "sprint6_read_disc_questions" on public.disc_questions;
create policy "sprint6_read_disc_questions" on public.disc_questions for select to anon, authenticated using (true);
drop policy if exists "sprint6_read_cover_letters" on public.cover_letters;
create policy "sprint6_read_cover_letters" on public.cover_letters for select to anon, authenticated using (true);
drop policy if exists "sprint6_read_news_case_studies" on public.news_case_studies;
create policy "sprint6_read_news_case_studies" on public.news_case_studies for select to anon, authenticated using (true);
drop policy if exists "sprint6_select_own_disc_assessments" on public.disc_assessments;
create policy "sprint6_select_own_disc_assessments" on public.disc_assessments for select to authenticated using (auth.uid() = user_id);
drop policy if exists "sprint6_insert_own_disc_assessments" on public.disc_assessments;
create policy "sprint6_insert_own_disc_assessments" on public.disc_assessments for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "sprint6_insert_feedback" on public.feedback_entries;
create policy "sprint6_insert_feedback" on public.feedback_entries for insert to anon, authenticated with check (user_id is null or auth.uid() = user_id);

grant select on public.disc_questions, public.cover_letters, public.news_case_studies to anon, authenticated;
grant select, insert on public.disc_assessments to authenticated;
grant insert on public.feedback_entries to anon, authenticated;


insert into public.disc_questions (code, question, option_d, option_i, option_s, option_c, sort_order) values ('Q1', '1. Khi gặp một khách hàng khó tính, phản xạ đầu tiên của bạn là gì?', 'Tìm cách thuyết phục bằng lập luận sắc bén và hướng tới chốt deal. (D)', 'Dùng sự hài hước và nhiệt tình để phá vỡ sự căng thẳng. (I)', 'Lắng nghe, kiên nhẫn để hiểu khách hàng đang lo lắng điều gì. (S)', 'Cung cấp thêm số liệu, biểu đồ và điều khoản pháp lý để chứng minh. (C)', 1) on conflict (code) do update set question = excluded.question, option_d = excluded.option_d, option_i = excluded.option_i, option_s = excluded.option_s, option_c = excluded.option_c, sort_order = excluded.sort_order;

insert into public.disc_questions (code, question, option_d, option_i, option_s, option_c, sort_order) values ('Q2', '2. Trong một buổi họp nhóm đánh giá hiệu suất, bạn thường thể hiện vai trò nào?', 'Người dẫn dắt, đưa ra quyết định nhanh và phân công công việc. (D)', 'Người khuấy động phong trào, truyền lửa cho anh em. (I)', 'Người hòa giải, đảm bảo mọi người đều thoải mái và đồng thuận. (S)', 'Người phân tích, soi kỹ các lỗ hổng trong báo cáo. (C)', 2) on conflict (code) do update set question = excluded.question, option_d = excluded.option_d, option_i = excluded.option_i, option_s = excluded.option_s, option_c = excluded.option_c, sort_order = excluded.sort_order;

insert into public.disc_questions (code, question, option_d, option_i, option_s, option_c, sort_order) values ('Q3', '3. Lời từ chối nào của khách hàng làm bạn cảm thấy ''kích thích'' muốn chinh phục nhất?', 'Anh có người quen làm bảo hiểm rồi'' -> Phải chứng minh mình giỏi hơn. (D)', 'Chị chưa rảnh nghe đâu'' -> Phải tìm cách kết bạn, làm thân bằng được. (I)', 'Để từ từ anh/chị suy nghĩ'' -> Thích cảm giác đồng hành, chờ đợi khách mở lòng. (S)', 'Lãi suất bảo hiểm thấp quá'' -> Lập tức lôi bảng dòng tiền ra so sánh chi tiết. (C)', 3) on conflict (code) do update set question = excluded.question, option_d = excluded.option_d, option_i = excluded.option_i, option_s = excluded.option_s, option_c = excluded.option_c, sort_order = excluded.sort_order;

insert into public.disc_questions (code, question, option_d, option_i, option_s, option_c, sort_order) values ('Q4', '4. Khi trình bày hợp đồng (Bàn giao HĐ), phong cách của bạn là:', 'Đi thẳng vào quyền lợi chính và các mốc thời gian quan trọng. (D)', 'Nói chuyện thân tình, chúc mừng khách hàng đã có sự bảo vệ. (I)', 'Hỏi han sức khỏe gia đình trước, từ từ mới mở hợp đồng ra. (S)', 'Đọc và gạch chân từng điều khoản loại trừ để khách nắm rõ 100%. (C)', 4) on conflict (code) do update set question = excluded.question, option_d = excluded.option_d, option_i = excluded.option_i, option_s = excluded.option_s, option_c = excluded.option_c, sort_order = excluded.sort_order;

insert into public.disc_questions (code, question, option_d, option_i, option_s, option_c, sort_order) values ('Q5', '5. Động lực lớn nhất khiến bạn gắn bó với nghề Bảo hiểm là gì?', 'Chinh phục các giải thưởng (MDRT, COT) và thu nhập đỉnh cao. (D)', 'Được gặp gỡ nhiều người, xây dựng thương hiệu cá nhân tỏa sáng. (I)', 'Sự ổn định, môi trường gắn bó và mang lại bình an cho các gia đình. (S)', 'Trở thành chuyên gia hoạch định tài chính uyên bác, rõ ràng minh bạch. (C)', 5) on conflict (code) do update set question = excluded.question, option_d = excluded.option_d, option_i = excluded.option_i, option_s = excluded.option_s, option_c = excluded.option_c, sort_order = excluded.sort_order;

insert into public.cover_letters (code, situation, body_template, sort_order) values ('F001', 'Khách có tì vết sức khỏe', 'Kính gửi UW. Khách hàng phát hiện [Tên bệnh] vào [Thời gian]. Hiện tại sức khỏe ổn định. Tôi đính kèm [Kết quả siêu âm/Xét nghiệm] gần nhất. Đề xuất UW xem xét bảo vệ quyền lợi tối đa hoặc loại trừ riêng bệnh lý này.', 1) on conflict (code) do update set situation = excluded.situation, body_template = excluded.body_template, sort_order = excluded.sort_order;

insert into public.cover_letters (code, situation, body_template, sort_order) values ('F002', 'Check VssID với khách', 'Anh/chị mở app VssID, cho em xem phần ''Lịch sử khám chữa bệnh''. Em sẽ ghi chú lại các Mã ICD để khai báo cực chuẩn xác, đảm bảo hồ sơ sạch, công ty không có cớ bắt bẻ sau này.', 2) on conflict (code) do update set situation = excluded.situation, body_template = excluded.body_template, sort_order = excluded.sort_order;

insert into public.cover_letters (code, situation, body_template, sort_order) values ('F003', 'Giải trình thông tin y tế qua VssID', 'Kính gửi Bộ phận Thẩm định (UW). Căn cứ theo ứng dụng VssID của khách hàng, lịch sử khám chữa bệnh ghi nhận [Mã ICD - Tên bệnh] vào ngày [Ngày]. Tôi đính kèm ảnh chụp màn hình VssID. Khách hàng cam kết khai báo trung thực. Kính mong UW xem xét tiến hành thẩm định.', 3) on conflict (code) do update set situation = excluded.situation, body_template = excluded.body_template, sort_order = excluded.sort_order;

insert into public.cover_letters (code, situation, body_template, sort_order) values ('F004', 'Xin xem xét lại quyết định Tăng phí / Loại trừ', 'Kính gửi UW. Nhận được quyết định [Tăng phí/Loại trừ] cho bệnh lý [Tên bệnh], tôi xin bổ sung Báo cáo bác sĩ điều trị (APS) mới nhất ngày [Ngày] cho thấy chỉ số [Tên chỉ số] đã về mức bình thường và ổn định. Mong UW tái thẩm định để mang lại quyền lợi tốt nhất cho Khách hàng.', 4) on conflict (code) do update set situation = excluded.situation, body_template = excluded.body_template, sort_order = excluded.sort_order;

insert into public.news_case_studies (code, category, title, summary, field_takeaway, published_at, sort_order) values ('N001', 'Tin Vĩ Mô', 'Lãi suất tiết kiệm tiếp tục giảm kỷ lục', '- Các ngân hàng lớn đồng loạt giảm lãi suất huy động.
- Dòng tiền nhàn rỗi đang tìm kênh trú ẩn mới.', '👉 ĐÂY LÀ CƠ HỘI: Gọi điện cho khách hàng có tiền gửi sắp đáo hạn. Đừng nói về bảo vệ, hãy nói về ''Kênh ủy thác đầu tư an toàn sinh lời dài hạn'' qua Quỹ liên kết chung.', '2026-08-15T00:00:00', 1) on conflict (code) do update set category = excluded.category, title = excluded.title, summary = excluded.summary, field_takeaway = excluded.field_takeaway, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_case_studies (code, category, title, summary, field_takeaway, published_at, sort_order) values ('C001', 'Ca Bồi Thường (Chi Trả)', 'Chi trả 500tr Ung thư giai đoạn đầu', '- Khách hàng 35 tuổi, phát hiện K tuyến giáp qua khám định kỳ.
- Khách đã từng phân vân không mua vì nghĩ mình khỏe.', '👉 BÀI HỌC: Trẻ và khỏe không phải là màng chắn ung thư. Hãy đưa Case Study này cho các khách hàng trẻ đang chủ quan xem.', '2026-08-15T00:00:00', 2) on conflict (code) do update set category = excluded.category, title = excluded.title, summary = excluded.summary, field_takeaway = excluded.field_takeaway, published_at = excluded.published_at, sort_order = excluded.sort_order;

insert into public.news_case_studies (code, category, title, summary, field_takeaway, published_at, sort_order) values ('C002', 'Ca Bồi Thường (Từ Chối)', 'Từ chối thanh toán viêm dạ dày do ngoại trú', '- Khách nằm viện 1 đêm nhưng hồ sơ bệnh án bác sĩ ghi ''Theo dõi ngoại trú''.
- Khách làm ầm lên chửi công ty lừa đảo.', '👉 BÀI HỌC: TVV phải dặn khách cực kỹ: ''Khi bác sĩ bảo nhập viện, anh chị phải hỏi rõ là NỘI TRÚ hay NGOẠI TRÚ, vì có thẻ mới bảo lãnh Nội trú''.', '2026-08-15T00:00:00', 3) on conflict (code) do update set category = excluded.category, title = excluded.title, summary = excluded.summary, field_takeaway = excluded.field_takeaway, published_at = excluded.published_at, sort_order = excluded.sort_order;
