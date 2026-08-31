-- V71: Persistent TVV checkpoints and dynamic, zero-PII CRM scenario content.

alter table public.profiles
  add column if not exists disc_result text;

alter table public.profiles
  drop constraint if exists profiles_disc_result_check;

alter table public.profiles
  add constraint profiles_disc_result_check
  check (disc_result is null or disc_result in ('D', 'I', 'S', 'C', 'DI', 'DC', 'IS', 'SC', 'CHAMELEON'));

-- Preserve existing completed DISC assessments when introducing the durable profile field.
with latest_disc as (
  select distinct on (da.user_id) da.user_id, da.disc_type::text as disc_result
  from public.disc_assessments da
  order by da.user_id, da.created_at desc, da.assessment_id desc
)
update public.profiles p
set disc_result = latest_disc.disc_result
from latest_disc
where p.id = latest_disc.user_id
  and p.disc_result is null;

create or replace function public.complete_my_disc_checkpoint_v1(p_disc_result text)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role text;
  v_result text := upper(trim(coalesce(p_disc_result, '')));
begin
  select role::text into v_role
  from public.profiles
  where id = v_actor_id;

  if v_actor_id is null or v_role <> 'advisor' then
    raise exception 'Advisor access is required to complete DISC checkpoint.' using errcode = '42501';
  end if;

  if v_result not in ('D', 'I', 'S', 'C', 'DI', 'DC', 'IS', 'SC', 'CHAMELEON') then
    raise exception 'Invalid DISC result.' using errcode = '22023';
  end if;

  update public.profiles
  set disc_result = coalesce(disc_result, v_result)
  where id = v_actor_id
  returning disc_result into v_result;

  return v_result;
end;
$$;

revoke all on function public.complete_my_disc_checkpoint_v1(text) from public, anon;
grant execute on function public.complete_my_disc_checkpoint_v1(text) to authenticated;

-- The Daily Push always selects one active CMS question, deterministically shuffled per day.
create or replace function public.get_today_daily_quiz_v1()
returns table (
  code text,
  question text,
  option_a text,
  option_b text,
  option_c text,
  correct_option text,
  explanation text,
  xp_reward integer
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  return query
  select q.code, q.question, q.option_a, q.option_b, q.option_c, q.correct_option, q.explanation, q.xp_reward
  from public.daily_quizzes q
  where q.is_active
  order by md5(q.code || current_date::text), q.code
  limit 1;
end;
$$;

revoke all on function public.get_today_daily_quiz_v1() from public, anon;
grant execute on function public.get_today_daily_quiz_v1() to authenticated;

create table if not exists public.crm_nurture_scenarios (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('pre_sale', 'post_sale')),
  context text not null check (context in ('expecting', 'new_parent', 'health_recovery', 'financial_goal', 'renewal', 'other')),
  title text not null check (char_length(trim(title)) between 3 and 160),
  emotional_touch text not null check (char_length(trim(emotional_touch)) between 8 and 600),
  action_persuasion text not null check (char_length(trim(action_persuasion)) between 8 and 600),
  long_term_note text not null check (char_length(trim(long_term_note)) between 8 and 600),
  quick_link_view text check (quick_link_view is null or quick_link_view in ('marketing', 'playbook', 'empathy', 'cover')),
  follow_up_days smallint not null default 7 check (follow_up_days between 1 and 60),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stage, context)
);

alter table public.crm_nurture_scenarios enable row level security;
drop policy if exists "crm_nurture_scenarios_authenticated_read" on public.crm_nurture_scenarios;
create policy "crm_nurture_scenarios_authenticated_read"
  on public.crm_nurture_scenarios for select to authenticated using (is_active);
grant select on public.crm_nurture_scenarios to authenticated;

insert into public.crm_nurture_scenarios (stage, context, title, emotional_touch, action_persuasion, long_term_note, quick_link_view, follow_up_days) values
  ('pre_sale', 'expecting', 'Chăm sóc trước khi tư vấn', 'Chạm cảm xúc: hỏi thăm sự chuẩn bị cho hành trình mới bằng một câu ngắn, tôn trọng nhịp sinh hoạt của gia đình.', 'Hành động/Thuyết phục: gửi thiệp chúc hoặc cẩm nang dễ đọc; chưa gửi minh họa và không tạo áp lực phản hồi.', 'Lưu ý dài hạn: hẹn một chạm nhẹ sau khi gia đình có thời gian ổn định hơn.', 'marketing', 7),
  ('pre_sale', 'new_parent', 'Ưu tiên sự thấu hiểu', 'Chạm cảm xúc: ghi nhận giai đoạn nhiều thay đổi và ưu tiên lắng nghe thay vì khai thác nhu cầu.', 'Hành động/Thuyết phục: chia sẻ một mẹo ngắn về kế hoạch dự phòng cho gia đình, không yêu cầu phản hồi ngay.', 'Lưu ý dài hạn: duy trì nhịp hỏi thăm thưa, đúng thời điểm khách thấy thuận tiện.', 'marketing', 10),
  ('pre_sale', 'health_recovery', 'Hỏi thăm trước, tư vấn sau', 'Chạm cảm xúc: bắt đầu bằng lời hỏi thăm chân thành về quá trình hồi phục, không suy đoán thông tin sức khỏe.', 'Hành động/Thuyết phục: chỉ gửi nội dung sức khỏe đáng tin cậy khi phù hợp; để khách chủ động mở câu chuyện bảo vệ.', 'Lưu ý dài hạn: ưu tiên sự an tâm và chỉ hẹn lại khi khách đồng ý.', 'empathy', 14),
  ('pre_sale', 'financial_goal', 'Gỡ rối bằng một bước nhỏ', 'Chạm cảm xúc: xác nhận việc cân bằng nhiều mục tiêu tài chính có thể tạo áp lực.', 'Hành động/Thuyết phục: gửi checklist tự đánh giá dòng tiền hoặc một câu hỏi mở, thay vì bảng minh họa.', 'Lưu ý dài hạn: cùng khách chia mục tiêu thành các bước nhỏ và hẹn xem lại một mốc rõ ràng.', 'playbook', 5),
  ('pre_sale', 'renewal', 'Rà soát trước khi đề xuất', 'Chạm cảm xúc: hỏi khách muốn làm rõ quyền lợi hay ưu tiên nào trong giai đoạn sắp tới.', 'Hành động/Thuyết phục: mời khách chuẩn bị câu hỏi để buổi rà soát ngắn gọn và có ích.', 'Lưu ý dài hạn: lưu ngày nhắc theo sự đồng thuận, không dồn dập liên hệ.', 'cover', 7),
  ('pre_sale', 'other', 'Lắng nghe để chọn bước kế tiếp', 'Chạm cảm xúc: dùng một câu hỏi mở để hiểu bối cảnh mà không ghi nhận thông tin định danh.', 'Hành động/Thuyết phục: đề xuất một tài liệu hoặc cuộc hẹn ngắn phù hợp với điều khách vừa đồng ý.', 'Lưu ý dài hạn: chỉ đặt follow-up sau khi chốt được thời điểm phù hợp.', 'empathy', 7),
  ('post_sale', 'expecting', 'Đồng hành cùng thay đổi lớn', 'Chạm cảm xúc: chúc mừng gia đình và hỏi họ muốn nhận nội dung hỗ trợ nào trong giai đoạn mới.', 'Hành động/Thuyết phục: gửi lời chúc hoặc thiệp chăm sóc, sau đó nhắc nhẹ về việc chuẩn bị câu hỏi quyền lợi.', 'Lưu ý dài hạn: một chạm sau 7 ngày giúp giữ liên hệ ấm áp mà không làm phiền.', 'marketing', 7),
  ('post_sale', 'new_parent', 'Giữ liên hệ ấm áp', 'Chạm cảm xúc: tôn trọng sự bận rộn của cha mẹ mới và ưu tiên thông điệp ngắn gọn.', 'Hành động/Thuyết phục: nhắc khách tự lưu câu hỏi về quyền lợi hoặc kế hoạch gia đình khi cần.', 'Lưu ý dài hạn: duy trì nhịp chăm sóc thưa và để khách chọn thời gian trao đổi.', 'marketing', 10),
  ('post_sale', 'health_recovery', 'Chăm sóc sau quyền lợi', 'Chạm cảm xúc: lắng nghe trải nghiệm của khách với thái độ không phán xét và không yêu cầu chi tiết y khoa.', 'Hành động/Thuyết phục: hướng dẫn khách tự ghi câu hỏi về quyền lợi hoặc quy trình nếu họ mong muốn.', 'Lưu ý dài hạn: ưu tiên sự hồi phục, tránh đưa đề xuất thương mại khi chưa phù hợp.', 'empathy', 14),
  ('post_sale', 'financial_goal', 'Củng cố thói quen bảo vệ', 'Chạm cảm xúc: công nhận nỗ lực khách đang làm để giữ cân bằng tài chính cho gia đình.', 'Hành động/Thuyết phục: chia sẻ một checklist rà soát mục tiêu thay vì khuyến khích thay đổi ngay.', 'Lưu ý dài hạn: hẹn một buổi review ngắn theo mốc khách lựa chọn.', 'playbook', 5),
  ('post_sale', 'renewal', 'Chủ động đồng hành quyền lợi', 'Chạm cảm xúc: hỏi khách có thay đổi nào họ muốn tự rà soát trước kỳ cập nhật không.', 'Hành động/Thuyết phục: mời khách chuẩn bị câu hỏi và giải thích quyền lợi bằng ngôn ngữ dễ hiểu.', 'Lưu ý dài hạn: đặt lịch rà soát trước kỳ gia hạn theo thời điểm khách đồng ý.', 'cover', 7),
  ('post_sale', 'other', 'Duy trì một nhịp chăm sóc tử tế', 'Chạm cảm xúc: lắng nghe điều khách thấy quan trọng ở thời điểm hiện tại mà không thu thập định danh.', 'Hành động/Thuyết phục: đề xuất một bước hỗ trợ ngắn, có thể thực hiện ngay và hoàn toàn tùy chọn.', 'Lưu ý dài hạn: chốt ngày follow-up rõ ràng hoặc để khách chủ động quay lại.', 'empathy', 7)
on conflict (stage, context) do update set
  title = excluded.title,
  emotional_touch = excluded.emotional_touch,
  action_persuasion = excluded.action_persuasion,
  long_term_note = excluded.long_term_note,
  quick_link_view = excluded.quick_link_view,
  follow_up_days = excluded.follow_up_days,
  is_active = true,
  updated_at = current_timestamp;
