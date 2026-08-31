begin;

-- Chỉ thay thế các bản ghi seed/mẫu đã được audit; không động tới nội dung do Admin tạo.
delete from public.leader_playbook as playbook
where playbook.legacy_source_code = any (array['LDR01', 'LDR02', 'LDR03', 'LDR04', 'LDR05', 'LDR06', 'v83-leader-playbook-01', 'v83-leader-playbook-02', 'v83-leader-playbook-03']::text[])
  and not exists (
    select 1 from public.coaching_logs as log where log.leader_playbook_id = playbook.id
  );

insert into public.leader_playbook (type, title, content, note, share_text, roleplay_prompt, tags, legacy_source_code)
values
  ('principle', '5 Cấp Độ Lãnh Đạo', 'Mức 1: Quyền lực. Mức 2: Quan hệ. Mức 3: Kết quả. Mức 4: Phát triển người khác. Sự chuyển dịch từ Mức 1 lên Mức 4 là hành trình từ người quản lý thành một Người Khai Vấn (Coach).', '📌 Dùng khi tự soi chiếu lại phong cách tương tác với team.', 'Gửi team: Một người quản lý giỏi là người tạo ra kết quả. Nhưng một người Lãnh đạo giỏi là người tạo ra những người giỏi hơn mình. Tuần mới, hãy cùng nhau phát triển nhé!', null, array[]::text[], 'v86-leader-playbook-01'),
  ('principle', 'Tư Duy Tảng Băng Trôi (Iceberg Model)', 'Những biểu hiện như đi trễ, giảm tương tác thường chỉ là 10% bề nổi. 90% phần chìm bên dưới có thể là nỗi sợ hãi hoặc áp lực. Sự thấu cảm bắt đầu từ việc khám phá 90% phần chìm này.', '📌 Dùng trước khi bước vào cuộc trò chuyện chấn chỉnh kỷ luật.', 'Gửi team: Đôi khi những gì chúng ta thấy ở bề ngoài chưa chắc là toàn bộ câu chuyện. Hãy luôn giữ một khoảng lùi thấu cảm trước khi đánh giá bất kỳ sự việc nào nhé.', null, array[]::text[], 'v86-leader-playbook-02'),
  ('coaching', 'CHẠM 01: Xốc lại tinh thần sau khi rớt Hợp đồng', 'TVV đang rất hụt hẫng sau khi rớt deal phút chót. Hãy bắt đầu bằng sự đồng cảm, sau đó dùng câu hỏi mở: ''Trải nghiệm vừa rồi mang lại cho em góc nhìn mới nào?'' để giúp bạn tự phục hồi năng lượng.', '⏱️ 15 phút 1-1 - Đặt câu hỏi Khai vấn', null, 'Đóng vai một đại lý vừa rớt hợp đồng 50 triệu phút chót. Bạn rất suy sụp và muốn bỏ nghề. Leader (người dùng) đang nói chuyện với bạn. Hãy chỉ mở lòng nếu họ dùng sự thấu cảm và đặt câu hỏi mở.', array['Mất động lực']::text[], 'v86-leader-playbook-03'),
  ('coaching', 'CHẠM 02: Tháo gỡ áp lực chỉ tiêu thi đua', 'Khi team lo âu với chỉ tiêu mới, việc áp dụng khung phản hồi SBI trong một buổi trò chuyện riêng sẽ giúp gỡ rối tâm lý hiệu quả, tránh cảm giác bị áp đặt và bảo vệ sự tự tin của TVV.', '⏱️ 15 phút 1-1 - Bảo vệ cái tôi', null, 'Đóng vai một đại lý đang bực tức vì chỉ tiêu tháng này quá cao. Bạn than vãn trên group. Leader (người dùng) gọi riêng cho bạn. Hãy bảo vệ quan điểm của mình, trừ khi họ áp dụng chuẩn khung góp ý SBI.', array['Áp lực chỉ tiêu']::text[], 'v86-leader-playbook-04'),
  ('coaching', 'CHẠM 03: Chuyển hóa mâu thuẫn nội bộ', 'Khi có sự cọ xát giữa các thành viên, việc lắng nghe chủ động từ cả hai phía mà không vội vàng phán xét sẽ giúp hạ nhiệt căng thẳng. Leader là nhịp cầu thấu cảm.', '⏱️ 20 phút 1-1 - Lắng nghe chủ động', null, 'Đóng vai một đại lý lâu năm đang bức xúc vì bị một nhân viên mới giành khách hàng. Bạn rất nóng giận. Leader (người dùng) đang hòa giải. Bạn cần cảm thấy mình được lắng nghe hoàn toàn trước khi hạ hỏa.', array['Mâu thuẫn']::text[], 'v86-leader-playbook-05')
on conflict (legacy_source_code) do update set
  type = excluded.type,
  title = excluded.title,
  content = excluded.content,
  note = excluded.note,
  share_text = excluded.share_text,
  roleplay_prompt = excluded.roleplay_prompt,
  tags = excluded.tags;

commit;
