-- V78: Dedicated, role-gated leadership checkpoint. The advisor DISC path remains unchanged.
create table if not exists public.leadership_tests (
  test_key text primary key,
  intro_disclaimer jsonb not null,
  questions jsonb not null,
  results jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leadership_tests_questions_array check (jsonb_typeof(questions) = 'array'),
  constraint leadership_tests_results_object check (jsonb_typeof(results) = 'object')
);

alter table public.profiles
  add column if not exists leadership_style text;

alter table public.profiles
  drop constraint if exists profiles_leadership_style_check;
alter table public.profiles
  add constraint profiles_leadership_style_check
  check (leadership_style is null or leadership_style in ('Visionary', 'Architect', 'Nurturer', 'Coach'));

alter table public.leadership_tests enable row level security;
drop policy if exists "leaders_can_read_active_leadership_tests" on public.leadership_tests;
create policy "leaders_can_read_active_leadership_tests"
on public.leadership_tests for select to authenticated
using (
  is_active = true
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('leader', 'super_admin')
  )
);
revoke all on public.leadership_tests from anon;
grant select on public.leadership_tests to authenticated;

drop trigger if exists leadership_tests_touch_updated_at on public.leadership_tests;
create trigger leadership_tests_touch_updated_at
before update on public.leadership_tests
for each row execute function public.touch_updated_at();

insert into public.leadership_tests (test_key, intro_disclaimer, questions, results, is_active)
values (
  'leadership_style_v1',
  $json${"title":"Khám Phá Phong Cách Lãnh Đạo Nội Tại","content":"Chào bạn, một Người Dẫn Dắt. Trong ngành Bảo hiểm Nhân thọ, không có một phong cách lãnh đạo nào là 'tốt nhất' hay 'đúng chuẩn' cho mọi tình huống. Mỗi chúng ta là một cá thể độc bản, và con người luôn là một biến số không ngừng phát triển. Bài trắc nghiệm này không sinh ra để 'đóng khung' hay phán xét bạn. Nó là một tấm gương phản chiếu, được chắt lọc từ khoa học quản trị, nghệ thuật khai vấn (Coaching), và kinh nghiệm thực chiến xương máu. Hãy chọn đáp án bạn thấy thoải mái nhất lúc này để nhận diện thế mạnh tự nhiên của mình nhé!"}$json$::jsonb,
  $json$[{"id":1,"scenario":"Một TVV kỳ cựu trong nhóm tháng này có kết quả kinh doanh sụt giảm đột ngột và có dấu hiệu né tránh các buổi họp team. Hướng tiếp cận ưu tiên của bạn thường là:","options":[{"text":"Hẹn gặp riêng ở một không gian thoải mái, lắng nghe xem bạn đang gặp vướng mắc gì trong cuộc sống hay công việc để cùng tháo gỡ.","trait":"Nurturer"},{"text":"Rà soát lại chỉ số hoạt động (số cuộc gọi, cuộc hẹn) của bạn ấy, sau đó cùng ngồi lại phân tích dữ liệu xem quy trình đang tắc ở khâu nào.","trait":"Architect"},{"text":"Chia sẻ một câu chuyện vấp ngã của chính mình trước đây, rủ bạn ấy cùng đi gặp một khách hàng khó vào ngày mai để lấy lại cảm giác chiến thắng.","trait":"Visionary"},{"text":"Đặt những câu hỏi mở (Mô hình GROW) để bạn ấy tự đánh giá lại mục tiêu ban đầu khi vào nghề, giúp bạn tự tìm ra lý do để bước tiếp.","trait":"Coach"}]},{"id":2,"scenario":"Công ty vừa ra Memo thi đua (Contest) tháng mới với chỉ tiêu FYP khá thách thức. Một đại lý nhắn tin chê bai, than phiền trong nhóm Zalo chung của Team. Bạn xử lý thế nào?","options":[{"text":"Dùng khung góp ý SBI nhắn tin riêng: 'Sáng nay chị thấy em nhắn tin gắt trong group (Hành vi) làm các bạn mới hoang mang (Tác động). Em đang vướng ở tệp khách nào, mình cùng gỡ nhé'.","trait":"Coach"},{"text":"Nhắn tin hỏi thăm riêng xem dạo này em ấy có đang gặp áp lực gì không mà tâm trạng lại dễ bức xúc như vậy.","trait":"Nurturer"},{"text":"Nhắc lại nhẹ nhàng nội quy của group team, sau đó gửi một bảng phân tích hướng dẫn cách chia nhỏ chỉ tiêu thi đua để mọi người thấy nó khả thi.","trait":"Architect"},{"text":"Khéo léo chuyển chủ đề trong group bằng một tin nhắn tích cực hoặc một case chốt hợp đồng thành công sáng nay để kéo lại năng lượng cho cả team.","trait":"Visionary"}]},{"id":3,"scenario":"Một đại lý mới (Rookie) than vãn: 'Em đăng bài bảo hiểm lên Facebook cả tháng nay chẳng ai hỏi thăm, em nản quá'. Bạn sẽ:","options":[{"text":"Đưa ngay cho bạn ấy một bộ kịch bản và template đăng bài mẫu đã được chứng minh là hiệu quả để bạn ấy copy làm theo.","trait":"Architect"},{"text":"Hỏi ngược lại: 'Mục tiêu bài đăng của em là chốt khách ngay hay để xây dựng nhân hiệu? Theo em, tâm lý khách hàng khi mua BHNT trên mạng là gì?'","trait":"Coach"},{"text":"Động viên bạn ấy kiên trì, bảo rằng nghề này thời gian đầu ai cũng vậy, quan trọng là mình giữ được năng lượng tích cực.","trait":"Visionary"},{"text":"Bảo bạn ấy tạm dừng đăng bài vài ngày, rủ đi uống nước để làm công tác tư tưởng và xoa dịu cảm giác hụt hẫng.","trait":"Nurturer"}]}]$json$::jsonb,
  $json${"Visionary":{"name":"Người Truyền Cảm Hứng","description":"Bạn dẫn dắt bằng năng lượng và tầm nhìn. Bạn là ngọn lửa kéo cả team đi lên trong những thời điểm khó khăn nhất."},"Architect":{"name":"Người Kiến Tạo","description":"Bạn dẫn dắt bằng quy trình và sự chuẩn xác. Bạn giúp đội ngũ làm việc có hệ thống, không bị trôi trượt mục tiêu."},"Nurturer":{"name":"Người Giữ Nhịp","description":"Bạn là chất keo gắn kết đội ngũ. Bạn thấu cảm, bảo vệ nhân sự và tạo ra một môi trường làm việc an toàn về mặt tâm lý."},"Coach":{"name":"Người Khai Vấn","description":"Bạn không làm thay, mà bạn giúp người khác tự lớn lên. Bằng những câu hỏi đúng, bạn khai phóng tiềm năng của tuyến dưới."}}$json$::jsonb,
  true
)
on conflict (test_key) do update set
  intro_disclaimer = excluded.intro_disclaimer,
  questions = excluded.questions,
  results = excluded.results,
  is_active = excluded.is_active,
  updated_at = now();

create or replace function public.complete_my_leadership_checkpoint_v1(p_style text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.pilot_role;
begin
  if auth.uid() is null then
    raise exception 'Vui lòng đăng nhập trước khi lưu kết quả Leadership Test.';
  end if;

  select role into v_role from public.profiles where id = auth.uid();
  if v_role not in ('leader', 'super_admin') then
    raise exception 'Leadership Test chỉ dành cho Leader hoặc Super Admin.';
  end if;
  if p_style not in ('Visionary', 'Architect', 'Nurturer', 'Coach') then
    raise exception 'Kết quả phong cách lãnh đạo không hợp lệ.';
  end if;

  update public.profiles
  set leadership_style = p_style
  where id = auth.uid();

  return p_style;
end;
$$;
grant execute on function public.complete_my_leadership_checkpoint_v1(text) to authenticated;
