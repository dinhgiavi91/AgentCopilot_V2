-- Sprint 5: Content Library sourced from Database_SaaS_BHNT(1).xlsx
-- This migration is idempotent and safe to paste into Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.playbook_cards (
  code text primary key,
  skill_system text not null,
  required_level text not null default 'Rookie',
  situation text not null,
  mindset text not null,
  coaching_prompts text,
  is_pro boolean not null default false,
  source_sheet text not null default '3_Bảo Bối Thực Chiến',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.playbook_cards add column if not exists skill_system text;
alter table public.playbook_cards add column if not exists required_level text;
alter table public.playbook_cards add column if not exists situation text;
alter table public.playbook_cards add column if not exists mindset text;
alter table public.playbook_cards add column if not exists coaching_prompts text;
alter table public.playbook_cards add column if not exists is_pro boolean not null default false;
alter table public.playbook_cards add column if not exists source_sheet text;
alter table public.playbook_cards add column if not exists sort_order integer not null default 0;
alter table public.playbook_cards add column if not exists created_at timestamptz not null default now();
alter table public.playbook_cards add column if not exists updated_at timestamptz not null default now();

create table if not exists public.empathy_dictionary (
  code text primary key,
  legal_term text not null,
  empathy_translation text not null,
  source_sheet text not null default '4_Ngôn Ngữ Thấu Cảm',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.empathy_dictionary add column if not exists legal_term text;
alter table public.empathy_dictionary add column if not exists empathy_translation text;
alter table public.empathy_dictionary add column if not exists source_sheet text;
alter table public.empathy_dictionary add column if not exists sort_order integer not null default 0;
alter table public.empathy_dictionary add column if not exists created_at timestamptz not null default now();
alter table public.empathy_dictionary add column if not exists updated_at timestamptz not null default now();

create table if not exists public.leadership_compass (
  code text primary key,
  topic text not null,
  core_thinking text not null,
  source_sheet text not null default '6_La Bàn Lãnh Đạo',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leadership_compass add column if not exists topic text;
alter table public.leadership_compass add column if not exists core_thinking text;
alter table public.leadership_compass add column if not exists source_sheet text;
alter table public.leadership_compass add column if not exists sort_order integer not null default 0;
alter table public.leadership_compass add column if not exists created_at timestamptz not null default now();
alter table public.leadership_compass add column if not exists updated_at timestamptz not null default now();

create table if not exists public.marketing_templates (
  code text primary key,
  category text not null,
  occasion text not null,
  message_template text not null,
  image_url text,
  source_sheet text not null default '13_Marketing 1 Chạm',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.marketing_templates add column if not exists category text;
alter table public.marketing_templates add column if not exists occasion text;
alter table public.marketing_templates add column if not exists message_template text;
alter table public.marketing_templates add column if not exists image_url text;
alter table public.marketing_templates add column if not exists source_sheet text;
alter table public.marketing_templates add column if not exists sort_order integer not null default 0;
alter table public.marketing_templates add column if not exists created_at timestamptz not null default now();
alter table public.marketing_templates add column if not exists updated_at timestamptz not null default now();

alter table public.playbook_cards enable row level security;
alter table public.empathy_dictionary enable row level security;
alter table public.leadership_compass enable row level security;
alter table public.marketing_templates enable row level security;

drop policy if exists "content_library_read_playbook" on public.playbook_cards;
drop policy if exists "content_library_read_empathy" on public.empathy_dictionary;
drop policy if exists "content_library_read_leadership" on public.leadership_compass;
drop policy if exists "content_library_read_marketing" on public.marketing_templates;
create policy "content_library_read_playbook" on public.playbook_cards for select to anon, authenticated using (true);
create policy "content_library_read_empathy" on public.empathy_dictionary for select to anon, authenticated using (true);
create policy "content_library_read_leadership" on public.leadership_compass for select to anon, authenticated using (true);
create policy "content_library_read_marketing" on public.marketing_templates for select to anon, authenticated using (true);
grant select on public.playbook_cards, public.empathy_dictionary, public.leadership_compass, public.marketing_templates to anon, authenticated;



-- Seed: 3_Bảo Bối Thực Chiến
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W001', 'Pháp Lý & Tuân Thủ', 'Rookie', 'Kịch bản Ghi âm (QĐ Bộ TC)', 'Dạ em xin phép ghi âm đoạn này để bảo vệ quyền lợi hợp pháp của gia đình mình sau này, đảm bảo em đã giải thích đúng & đủ các điều khoản loại trừ theo quy định...', null, false, '3_Bảo Bối Thực Chiến', 1) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W002', 'Y Khoa - Thẩm định', 'Pro', 'Khách có Nang Tuyến Giáp', 'BƯỚC 1: Rào trước kỳ vọng (Có thể hệ thống sẽ tạm hoãn). 
BƯỚC 2: Xin đủ Sổ khám, Siêu âm Tirads. 
BƯỚC 3: Nộp kèm ''Bản Tường Trình Y Khoa'' xin loại trừ riêng tuyến giáp.', null, true, '3_Bảo Bối Thực Chiến', 2) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W003', 'Y Khoa - Bồi thường', 'Pro', 'Ngăn chặn Nằm viện an dưỡng', 'Bảo hiểm liên thông y tế. Nằm viện Khoa Đông Y/Lão khoa (K16/K17) quá ngày tiêu chuẩn, AI sẽ khóa hồ sơ thanh tra. Khuyên KH đi viện chữa bệnh thật, đừng vì vài đồng trợ cấp mà bị từ chối sai.', null, true, '3_Bảo Bối Thực Chiến', 3) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W004', 'Storytelling', 'Rookie', 'Kể chuyện: Chuyến xe buýt', 'Khi khách chần chừ: ''Anh chị tưởng tượng gia đình mình đang trên 1 chuyến xe. Anh là tài xế. Nếu lỡ tài xế gục ngã, ai sẽ cầm vô lăng chở bọn trẻ đi tiếp?'' (Ngắt giọng 3 giây, nhìn vào mắt khách).', null, false, '3_Bảo Bối Thực Chiến', 4) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W005', 'Thẩm Định Y Khoa', 'Pro', 'Khách hàng khai bệnh nền (Viêm gan, Huyết áp, Tuyến giáp...)', 'KHÔNG xúi khách giấu bệnh. Hệ thống VssID liên thông sẽ phát hiện. Khám sức khỏe của cty KHÔNG thay thế nghĩa vụ kê khai trung thực.', '👉 HƯỚNG DẪN KHÁCH: ''Anh/chị mở app VssID, em sẽ lấy đúng mã bệnh (ICD) để khai. Việc này giúp hồ sơ sạch, lỡ sau này claim bồi thường 1 phút 30 giây là tiền về. Nếu bị tăng phí, đó là sự công bằng của quỹ bảo hiểm bảo vệ anh chị.''', true, '3_Bảo Bối Thực Chiến', 5) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W006', 'Xử Lý Từ Chối', 'Master', 'Kinh tế khó khăn, muốn giữ tiền mặt phòng thân, sợ kẹt tiền đứt ngang hợp đồng.', 'Đồng cảm nhưng không ''chết chìm'' cùng khách. Đừng hạ gói ngay lập tức. Đổi khung tư duy của khách từ ''Khoản chi phí'' sang ''Két sắt bảo vệ tiền mặt''.', '👉 KHAI VẤN (Nhóm C/D): ''Nếu lỡ có rủi ro y tế cần 300 triệu, anh/chị muốn rút 300tr từ tiền mặt tiết kiệm của mình ra trả, hay chỉ muốn trích 20tr giao cho cty BH lo khoản 300tr đó?''
👉 KHAI VẤN (Nhóm I/S): ''HĐ bảo hiểm rất linh hoạt đóng phí và có 60 ngày ân hạn. Mình bảo vệ số tiền mặt còn lại ngay trong lúc bấp bênh nhất anh/chị nhé.''', true, '3_Bảo Bối Thực Chiến', 6) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W007', 'Khai Vấn SPIN', 'Pro', 'Khách hàng ngần ngại chốt deal, nói ''Để anh/chị cân nhắc thêm, hiện tại cũng chưa cần lắm''.', 'Khách hàng chưa thấy đủ ''đau''. Đừng thúc ép bằng giá hay khuyến mãi. Hãy dùng SPIN để phóng to vấn đề của họ.', '👉 KHAI VẤN (S-P): ''Hiện tại quỹ dự phòng y tế của nhà mình đang được chuẩn bị như thế nào ạ? Có điểm nào anh/chị thấy chưa thực sự an tâm?''
👉 KHAI VẤN (I-N): ''Nếu sự cố xảy ra vượt quá mức dự phòng đó, nó sẽ bào mòn tiền tiết kiệm ra sao? Nếu có một quỹ bảo lãnh ngay lập tức, nó giúp anh/chị nhẹ gánh đi phần nào?''', true, '3_Bảo Bối Thực Chiến', 7) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W008', 'Kỹ Thuật Funnel', 'Master', 'Gặp khách hàng đang bực bội hoặc than phiền chung chung: ''Bảo hiểm rắc rối, phục vụ chậm''.', 'Bắt đầu từ câu hỏi rộng, sau đó thu hẹp dần để tìm nguyên nhân gốc rễ (Root cause), tránh đoán mò lỗi do đâu.', '👉 FUNNEL:
1. (Mở rộng) ''Dạ, anh/chị có thể chia sẻ cảm nhận chung về trải nghiệm vừa rồi không?''
2. (Thu hẹp) ''Trong quá trình đó, khâu nào làm anh/chị thấy bất tiện nhất?''
3. (Chính xác) ''Nếu tụi em rút ngắn thời gian xử lý hồ sơ X xuống 24h, liệu có giải quyết được sự bực bội của mình không?''', true, '3_Bảo Bối Thực Chiến', 8) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W009', 'Tiêu Chuẩn CSKH 6 Cấp Độ', 'Rookie', 'Dùng để tự chấm điểm khi ghi Nhật ký CSKH hàng ngày.', 'Dịch chuyển từ ''Thợ săn'' sang ''Người nhà''. Biến sự cố thành lòng tin.', '👉 Cấp 1-2: Bỏ con giữa chợ / Thợ săn (chỉ xuất hiện lúc chốt deal hoặc thu phí).
👉 Cấp 3: Đúng mong đợi (Người đưa thư, làm đúng quy trình).
👉 Cấp 4: Hơn mong đợi (Chủ động nhắc nhở, gửi thông tin hữu ích).
👉 Cấp 5: Ngạc nhiên (Bảo vệ quyền lợi, xử lý êm đẹp khi có sự cố Claim).
👉 Cấp 6: WOW (Có mặt lúc hoạn nạn, tặng quà không nhân dịp gì cả).', false, '3_Bảo Bối Thực Chiến', 9) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W010', 'Khai Vấn: Làm Rõ & Đào Sâu', 'Rookie', 'Khách hàng nói mơ hồ: ''Kinh tế khó khăn'', ''Bảo hiểm đắt'', hoặc có trải nghiệm xấu.', 'Không đoán mò. Không trình bày ngay. Phải làm rõ định nghĩa và bóc tách cảm xúc của khách hàng trước.', '👉 LÀM RÕ: ''Khi anh/chị nói kinh tế khó khăn, ý anh/chị là dòng tiền đang thâm hụt, hay mình đang muốn giữ tiền mặt phòng rủi ro kinh doanh ạ?''
👉 ĐÀO SÂU: ''Anh/chị có thể kể cụ thể hơn một chút được không? Khoảnh khắc nào làm anh/chị thất vọng nhất về bạn tư vấn cũ?''', false, '3_Bảo Bối Thực Chiến', 10) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W011', 'Khai Vấn: Mô hình SPIN', 'Pro', 'Khách hàng chần chừ, chưa thấy tính cấp bách, muốn suy nghĩ thêm.', 'Đừng bán giải pháp vội. Dùng SPIN phóng to ''nỗi đau'' để khách tự thấy CẦN thay đổi. 80% Hỏi - 20% Trình bày.', '👉 (S) TÌNH HUỐNG: ''Quỹ dự phòng y tế của nhà mình đang thiết kế ra sao rồi ạ?''
👉 (P) VẤN ĐỀ: ''Có rủi ro nào làm anh/chị chưa an tâm 100% không?''
👉 (I) HỆ QUẢ: ''Giả sử sự cố ngốn mất 500tr, nó sẽ bào mòn tiền tiết kiệm ra sao?''
👉 (N) LỢI ÍCH: ''Nếu có quỹ bảo lãnh 500tr mà mỗi ngày chỉ cất vào 50k, anh chị sẽ nhẹ nhõm thế nào?''', true, '3_Bảo Bối Thực Chiến', 11) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W012', 'Khai Vấn: Phễu Câu Hỏi', 'Master', 'Khách hàng đang bực bội, khiếu nại hoặc từ chối gay gắt.', 'Đi từ Rộng -> Hẹp -> Chốt. Tuyệt đối không cãi lý hay phản bác lại định kiến.', '👉 1. MỞ RỘNG: ''Anh/chị có thể chia sẻ cảm nhận chung về trải nghiệm vừa rồi?''
👉 2. THU HẸP: ''Khâu nào làm anh/chị lo sợ/bức xúc nhất?''
👉 3. CHỐT CHÍNH XÁC: ''Nếu em chứng minh được Luật kinh doanh BH sẽ bảo vệ anh/chị 100% khỏi rủi ro đó, anh/chị có sẵn sàng nghe em 15 phút không?''', true, '3_Bảo Bối Thực Chiến', 12) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.playbook_cards (code, skill_system, required_level, situation, mindset, coaching_prompts, is_pro, source_sheet, sort_order) values ('W013', 'Khai Vấn: Socratic', 'Master', 'Khách hàng so sánh với Kênh khác (Gửi Ngân hàng, Mua Vàng).', 'Phá vỡ niềm tin sai lệch một cách êm ái bằng cách hỏi ngược lại về ''Bằng chứng'' hoặc ''Kịch bản đối lập''.', '👉 HỎI BẰNG CHỨNG: ''Đã có kênh nào cam kết đưa ngay 1 tỷ khi mình mới gửi vào 20 triệu chưa ạ?''
👉 HỎI ĐỐI LẬP: ''Khi nằm viện, cuốn sổ tiết kiệm hay chiếc thẻ bảo lãnh 1 tỷ sẽ thanh toán viện phí tốt hơn?''', true, '3_Bảo Bối Thực Chiến', 13) on conflict (code) do update set skill_system = excluded.skill_system, required_level = excluded.required_level, situation = excluded.situation, mindset = excluded.mindset, coaching_prompts = excluded.coaching_prompts, is_pro = excluded.is_pro, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();

-- Seed: 4_Ngôn Ngữ Thấu Cảm
insert into public.empathy_dictionary (code, legal_term, empathy_translation, source_sheet, sort_order) values ('DK01', 'Thời gian chờ 90 ngày', 'Công ty cần 90 ngày để đảm bảo quỹ chung không bị lạm dụng bởi người ủ bệnh từ trước. Anh/chị khỏe mạnh thì hoàn toàn yên tâm, đây là cách công ty bảo vệ tiền của chính anh chị.', '4_Ngôn Ngữ Thấu Cảm', 1) on conflict (code) do update set legal_term = excluded.legal_term, empathy_translation = excluded.empathy_translation, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.empathy_dictionary (code, legal_term, empathy_translation, source_sheet, sort_order) values ('DK02', 'Bệnh lý có sẵn', 'Bảo hiểm là mua bình cứu hỏa trước khi cháy nhà. Mình khai thật 100% bệnh cũ, em sẽ làm tường trình xin công ty bảo vệ anh chị những bệnh khác để sau này claim bồi thường 1 phút 30 giây là tiền về.', '4_Ngôn Ngữ Thấu Cảm', 2) on conflict (code) do update set legal_term = excluded.legal_term, empathy_translation = excluded.empathy_translation, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.empathy_dictionary (code, legal_term, empathy_translation, source_sheet, sort_order) values ('DK06', 'Quan hệ được bảo hiểm (Insurable Interest)', 'Chỉ được mua bảo hiểm cho bản thân, vợ/chồng, con cái, cha mẹ hoặc người có quyền lợi tài chính. KHÔNG thể mua cho người ngoài/bạn bè để trục lợi. Đây là nguyên tắc đạo đức cốt lõi của ngành.', '4_Ngôn Ngữ Thấu Cảm', 3) on conflict (code) do update set legal_term = excluded.legal_term, empathy_translation = excluded.empathy_translation, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.empathy_dictionary (code, legal_term, empathy_translation, source_sheet, sort_order) values ('DK07', 'Giá trị hoàn lại (Cash Value) & Phí chấm dứt', 'Dòng tiền bị trừ Phí ban đầu và Phí rủi ro. Nếu hủy HĐ trong 1-3 năm đầu sẽ gần như mất trắng. Bảo hiểm là kỷ luật dài hạn, KHÔNG khuyên khách tham gia nếu chỉ định gửi 1-2 năm.', '4_Ngôn Ngữ Thấu Cảm', 4) on conflict (code) do update set legal_term = excluded.legal_term, empathy_translation = excluded.empathy_translation, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();

-- Seed: 6_La Bàn Lãnh Đạo
insert into public.leadership_compass (code, topic, core_thinking, source_sheet, sort_order) values ('LDR01', '5 Cấp Độ Lãnh Đạo', 'Mức 1: Quyền lực (Nhân viên nghe vì sợ). Mức 2: Quan hệ (Nhân viên nghe vì nể). Mức 4: Phát triển người khác. Sếp đang ở mức nào?', '6_La Bàn Lãnh Đạo', 1) on conflict (code) do update set topic = excluded.topic, core_thinking = excluded.core_thinking, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.leadership_compass (code, topic, core_thinking, source_sheet, sort_order) values ('LDR02', 'Quản Lý vs Lãnh Đạo', 'Quản lý là làm đúng việc (Duy trì, kiểm soát). Lãnh đạo là làm những việc đúng (Đổi mới, phá vỡ khuôn khổ, truyền cảm hứng). Hãy bớt soi KPI, tăng cường lắng nghe!', '6_La Bàn Lãnh Đạo', 2) on conflict (code) do update set topic = excluded.topic, core_thinking = excluded.core_thinking, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.leadership_compass (code, topic, core_thinking, source_sheet, sort_order) values ('LDR03', 'Giải quyết xung đột', 'Giao tiếp hiệu quả giúp nhận diện và giải quyết xung đột nhanh chóng. Luôn cung cấp phản hồi xây dựng thay vì chỉ trích.', '6_La Bàn Lãnh Đạo', 3) on conflict (code) do update set topic = excluded.topic, core_thinking = excluded.core_thinking, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.leadership_compass (code, topic, core_thinking, source_sheet, sort_order) values ('LDR04', 'Tư Duy Tảng Băng Trôi (Iceberg Model)', 'Khi TVV nghỉ việc hoặc rớt số liên tục, đừng chỉ nhìn ''Sự kiện'' (Phần nổi). Hãy tìm ''Xu hướng'' (Điều này lặp lại bao lâu rồi?), ''Cấu trúc'' (Hệ thống/Quy trình nào gây ra?), và ''Mô hình tư duy'' (Niềm tin ngầm nào của tổ chức đang sai?). Sửa từ gốc rễ.', '6_La Bàn Lãnh Đạo', 4) on conflict (code) do update set topic = excluded.topic, core_thinking = excluded.core_thinking, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.leadership_compass (code, topic, core_thinking, source_sheet, sort_order) values ('LDR05', 'Kỹ Thuật 5 Whys (5 Lần Tại Sao)', 'Khi dự án fail hoặc khách hàng khiếu nại, cấm đổ lỗi cho cá nhân (Blameless learning). Hãy hỏi ''Tại sao'' 5 lần để tìm lỗi hệ thống. VD: Tại sao trễ báo cáo? -> Tại sao thiếu dữ liệu? -> Tại sao không có quy trình bàn giao? -> Lỗi do quy trình, không phải do người.', '6_La Bàn Lãnh Đạo', 5) on conflict (code) do update set topic = excluded.topic, core_thinking = excluded.core_thinking, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.leadership_compass (code, topic, core_thinking, source_sheet, sort_order) values ('LDR06', 'Đánh Giá Tránh Thiên Kiến (Halo & Recency Effect)', 'Khi review hiệu suất TVV, phải tách bạch từng tiêu chí dựa trên bằng chứng (Data). Không để một điểm xuất sắc che lấp điểm yếu (Halo effect), và không để một lỗi mới xảy ra làm mờ đi cả quá trình cống hiến 6 tháng trước (Recency bias).', '6_La Bàn Lãnh Đạo', 6) on conflict (code) do update set topic = excluded.topic, core_thinking = excluded.core_thinking, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();

-- Seed: 13_Marketing 1 Chạm
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('MKT01', 'Dành Cho Khách Hàng', 'Sinh nhật Khách hàng', 'Chúc mừng sinh nhật anh/chị! Chúc anh/chị một tuổi mới rực rỡ, sức khỏe dồi dào và gia đình luôn ngập tràn tiếng cười. Cảm ơn anh/chị đã luôn tin tưởng để em được làm ''vệ sĩ tài chính'' bảo vệ tổ ấm nhà mình nhé! 🎂🎉', 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80', '13_Marketing 1 Chạm', 1) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('MKT02', 'Dành Cho Khách Hàng', 'Trời trở lạnh / Mùa dịch bệnh', 'Dạ, đài báo đêm nay không khí lạnh về sâu đó chị. Chị nhớ giữ ấm cổ và gan bàn chân cho bé nhà mình nha. Mùa này lỡ bé có sụt sịt cần đi viện khám, chị cứ ới em lấy thẻ bảo lãnh qua thẳng viện quốc tế cho đỡ đông và lây chéo nha chị. Chúc gia đình mình buổi tối ấm áp! 🧣☕', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80', '13_Marketing 1 Chạm', 2) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('MKT03', 'Dành Cho Khách Hàng', 'Kỷ niệm 1 năm hợp đồng', 'Tròn 1 năm kể từ ngày anh/chị trao niềm tin cho em và công ty! Quỹ dự phòng của gia đình mình đã dày thêm một chút, và sự bình an cũng được củng cố vững vàng hơn. Cuối tuần vợ chồng rảnh cho em mời ly cafe dạo phố nha! 🤝✨', 'https://images.unsplash.com/photo-1561489396-888724a1543d?w=800&q=80', '13_Marketing 1 Chạm', 3) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('LDR01', 'Vinh Danh Nội Bộ', 'Chúc mừng Sinh nhật TVV', 'Gửi chiến binh tuyệt vời của Team! Chúc em tuổi mới bùng nổ doanh số, ký hợp đồng mỏi tay và luôn giữ được trái tim nóng với nghề. Team luôn tự hào về em! 🦅🔥', 'https://images.unsplash.com/photo-1530103862676-de8892795f5f?w=800&q=80', '13_Marketing 1 Chạm', 4) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('LDR02', 'Vinh Danh Nội Bộ', 'Vinh danh TVV có Ca CSKH xuất sắc (Mức WOW)', 'CHÚC MỪNG NGÔI SAO DỊCH VỤ! 🌟 Xin vinh danh sự tận tâm của bạn vì đã biến một sự cố thành khoảnh khắc WOW rực rỡ cho khách hàng. Sự tử tế của bạn chính là bộ mặt của cả văn phòng chúng ta. Tiếp tục phát huy nhé!', 'https://images.unsplash.com/photo-1533227260812-70ce6603a11e?w=800&q=80', '13_Marketing 1 Chạm', 5) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('LDR03', 'Vinh Danh Nội Bộ', 'Đạt mốc 30 ngày Chuỗi CSKH', 'KỶ LUẬT TẠO NÊN SỨC MẠNH! 🔥 Chúc mừng em đã duy trì chuỗi 30 ngày tương tác khách hàng liên tục không đứt đoạn. Đại bàng không sải cánh trong một ngày, thành công là kết quả của sự bền bỉ. Mời em ly Starbucks nạp năng lượng nhé! ☕', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', '13_Marketing 1 Chạm', 6) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('MKT04', 'Dành Cho Khách Hàng', 'Hâm nóng sau khi bị Từ chối', 'Dạ em chào anh/chị. Hôm trước nghe anh chị chia sẻ những góc nhìn rất thẳng thắn về bảo hiểm, em về suy nghĩ mãi và thấy mình học được rất nhiều. Nghề của tụi em đôi khi hơi ''nhiệt tình'' quá làm khách hàng bị áp lực, em xin lỗi nếu hôm trước làm anh/chị chưa thoải mái nhé. Chúc anh chị tuần mới công việc thuận lợi ạ! (Tuyệt đối không nhắc mua bán)', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80', '13_Marketing 1 Chạm', 7) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('MKT05', 'Dành Cho Khách Hàng', 'Xin lời giới thiệu (Sau khi có trải nghiệm WOW)', 'Anh/chị ơi, hôm nay nhận được sự hài lòng của gia đình mình là niềm hạnh phúc lớn nhất của người làm nghề như em. Xung quanh mình nếu có anh em bạn bè nào đang băn khoăn cần ''khám bệnh'' lại các hợp đồng cũ để tránh thiệt thòi quyền lợi, anh/chị cho em xin phép được hỗ trợ họ miễn phí như đã hỗ trợ nhà mình nhé! Cảm ơn anh/chị rất nhiều ạ!', 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&q=80', '13_Marketing 1 Chạm', 8) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();
insert into public.marketing_templates (code, category, occasion, message_template, image_url, source_sheet, sort_order) values ('LDR04', 'Vinh Danh Nội Bộ', 'Vinh danh Tinh thần Kiên cường', 'KHÔNG CÓ LỜI TỪ CHỐI, CHỈ CÓ SỰ PHẢN HỒI! 🔥 Sếp muốn dành lời khen đặc biệt cho [Tên TVV] tuần qua. Dù gặp những ca từ chối khó nhằn, em không hề bỏ cuộc mà chủ động dùng Phễu Câu Hỏi để tìm ra nguyên nhân và ngồi lại cùng Sếp tháo gỡ. Thái độ này sớm muộn cũng sẽ gặt hái kết quả lớn!', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', '13_Marketing 1 Chạm', 9) on conflict (code) do update set category = excluded.category, occasion = excluded.occasion, message_template = excluded.message_template, image_url = excluded.image_url, source_sheet = excluded.source_sheet, sort_order = excluded.sort_order, updated_at = now();


-- Expected seeded rows: playbook_cards=13, empathy_dictionary=4, leadership_compass=6, marketing_templates=9
