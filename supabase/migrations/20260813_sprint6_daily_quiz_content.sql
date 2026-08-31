-- Master Data source: 12_Nạp Não Mỗi Sáng in Database_SaaS_BHNT (1).xlsx.
create table if not exists public.daily_quizzes (
  code text primary key,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C')),
  explanation text not null,
  xp_reward integer not null default 10 check (xp_reward > 0),
  source_sheet text not null default '12_Nạp Não Mỗi Sáng',
  sort_order integer not null unique
);

alter table public.daily_quizzes enable row level security;
drop policy if exists "sprint6_read_daily_quizzes" on public.daily_quizzes;
create policy "sprint6_read_daily_quizzes" on public.daily_quizzes for select to anon, authenticated using (true);
grant select on public.daily_quizzes to anon, authenticated;

insert into public.daily_quizzes (code, question, option_a, option_b, option_c, correct_option, explanation, xp_reward, sort_order) values
  ('QZ001', 'Khách hàng bị tai nạn giao thông, hoàn toàn không có nồng độ cồn nhưng lại KHÔNG có bằng lái xe. Công ty có đền không?', 'A. Có, vì tai nạn là rủi ro khách quan.', 'B. Không, vì vi phạm pháp luật giao thông.', 'C. Đền 50% vì có tình tiết giảm nhẹ.', 'B', 'Việc điều khiển phương tiện mà không có giấy phép hợp lệ là hành vi vi phạm pháp luật, thuộc nhóm Điều khoản loại trừ cơ bản của TẤT CẢ các hợp đồng BHNT.', 10, 1),
  ('QZ002', 'Khi khách hàng nói “Chị mới mua một cái nhà, đang nợ ngân hàng nhiều lắm, không có tiền mua BH đâu”, câu khai vấn nào là sắc bén nhất?', 'A. Dạ gói bên em mỗi ngày chỉ 30 ngàn thôi chị.', 'B. Dạ chị mua nhà trả góp đúng không, tháng chị trả ngân hàng bao nhiêu?', 'C. Dạ, nếu người trụ cột gia đình gặp rủi ro mất thu nhập, ai sẽ là người tiếp tục trả khoản nợ ngân hàng đó để giữ lại căn nhà cho các cháu ạ?', 'C', 'Đáp án C sử dụng kỹ thuật SPIN (Câu hỏi Hệ quả - Implication) để gắn rủi ro mất thu nhập với khoản nợ lớn nhất của khách hàng, tạo ra tính cấp bách.', 10, 2)
on conflict (code) do update set question = excluded.question, option_a = excluded.option_a, option_b = excluded.option_b, option_c = excluded.option_c, correct_option = excluded.correct_option, explanation = excluded.explanation, xp_reward = excluded.xp_reward, sort_order = excluded.sort_order;
