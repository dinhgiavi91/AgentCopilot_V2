-- V83: Leader Playbook entries from user-provided embedded JSON.
insert into public.leader_playbook (type, title, content, tags, legacy_source_code)
values
  ('principle', 'Tư Duy Tảng Băng Trôi (The Iceberg Model)', '**Đừng chỉ nhìn vào hành vi bề nổi.**
- **Bề nổi (10%):** TVV đi trễ, không gọi đủ cuộc gọi, than vãn.
- **Phần chìm (90%):** Nỗi sợ bị từ chối, áp lực tài chính, hoặc cảm thấy không được ghi nhận.

👉 *Hành động:* Khi TVV làm sai, đừng mắng hành vi. Hãy dùng câu hỏi Khai vấn để chạm vào ''phần chìm''.', array['Đại lý muốn nghỉ việc', 'Đang mất lửa']::text[], 'v83-leader-playbook-01'),
  ('coaching', 'Kịch bản Khai vấn (GROW) khi rớt số, mất động lực', '**1. Goal:** ''Lý do lớn nhất khiến em chọn nghề này là gì?''
**2. Reality:** ''Hai ca vừa rớt, theo em nút thắt nằm ở đâu?''
**3. Options:** ''Nếu làm lại, em sẽ thay đổi cách tiếp cận thế nào?''
**4. Will:** ''Chiều nay mình bắt đầu lại nhé, em muốn làm gì trước?''

👉 *Thực hành:* Mở trạm Bảo Bối để Roleplay kịch bản này với AI trước khi gặp TVV.', array['Đang mất lửa', 'Chạy số cuối tháng']::text[], 'v83-leader-playbook-02'),
  ('coaching', 'Khung phản hồi SBI - Chấn chỉnh thái độ sai lệch', '**Situation:** ''Sáng nay trong lúc họp team...''
**Behavior:** ''...chị thấy em ngắt lời bạn A hai lần.''
**Impact:** ''Việc này làm các bạn mới ngại chia sẻ và không khí chùng xuống.''
**Action:** ''Chị mong em hướng dẫn các bạn nhẹ nhàng hơn. Em thấy sao?''', array['Đang cãi nhau', 'Đại lý muốn nghỉ việc']::text[], 'v83-leader-playbook-03')
on conflict (legacy_source_code) do update set
  type = excluded.type,
  title = excluded.title,
  content = excluded.content,
  tags = excluded.tags;
