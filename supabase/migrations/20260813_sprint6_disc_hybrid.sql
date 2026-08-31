-- Sprint 6 DISC Hybrid — official result copy supplied by the product owner.
-- The original workbook's sheet 10 contains questions/options only; this migration records
-- the approved result profiles supplied separately by the product owner on 2026-08-13.

alter table public.disc_profiles drop constraint if exists disc_profiles_disc_type_check;
alter table public.disc_profiles add constraint disc_profiles_disc_type_check
  check (disc_type in ('D', 'I', 'S', 'C', 'DI', 'DC', 'IS', 'SC', 'CHAMELEON'));

alter table public.disc_assessments drop constraint if exists disc_assessments_disc_type_check;
alter table public.disc_assessments add constraint disc_assessments_disc_type_check
  check (disc_type in ('D', 'I', 'S', 'C', 'DI', 'DC', 'IS', 'SC', 'DS', 'IC', 'CHAMELEON'));

insert into public.disc_profiles (disc_type, headline, strengths, watch_out, selling_style, source_evidence, source_sheet) values
  ('D', 'Thủ lĩnh', 'Quyết đoán, hướng tới kết quả. Điểm mạnh: Chốt sale nhanh, chịu áp lực tốt.', 'Điểm yếu: Đôi khi áp đặt khách hàng, thiếu kiên nhẫn.', 'Đi thẳng vào vấn đề, nhấn mạnh vào quyền lợi bảo vệ cốt lõi và dòng tiền.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm D (Thủ lĩnh).', 'User-confirmed DISC Master Data'),
  ('I', 'Truyền cảm hứng', 'Nhiệt huyết, hòa đồng. Điểm mạnh: Xây dựng thiện cảm cực tốt, chốt sale bằng cảm xúc.', 'Điểm yếu: Dễ lan man, hay quên chi tiết điều khoản.', 'Kể chuyện (Storytelling), vẽ ra viễn cảnh tương lai bình an cho gia đình khách hàng.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm I (Truyền cảm hứng).', 'User-confirmed DISC Master Data'),
  ('S', 'Tận tâm', 'Kiên nhẫn, chân thành. Điểm mạnh: Chăm sóc khách hàng tuyệt vời, tạo sự tin tưởng dài lâu.', 'Điểm yếu: Ngại chốt sale, sợ bị từ chối, hay nhượng bộ.', 'Lắng nghe, chậm rãi, đồng hành và làm bạn với khách hàng như người nhà.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm S (Tận tâm).', 'User-confirmed DISC Master Data'),
  ('C', 'Phân tích', 'Logic, chi tiết. Điểm mạnh: Nắm rành mạch mọi điều khoản, phân tích sản phẩm chuẩn xác.', 'Điểm yếu: Quá nhiều thông tin làm khách hàng rối, hơi cứng nhắc.', 'Dùng bảng biểu, so sánh logic, chứng minh bằng giấy trắng mực đen.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm C (Phân tích).', 'User-confirmed DISC Master Data'),
  ('DI', 'Người Tiên Phong', 'Bạn sở hữu sự máu lửa của D và khả năng truyền cảm hứng của I. Điểm mạnh: Chốt sale bùng nổ, dễ dàng phá băng khách hàng khó tính bằng năng lượng tích cực.', 'Điểm cần cân bằng: giữ nhịp lắng nghe để năng lượng dẫn dắt không lấn át nhu cầu thật của khách.', 'Tấn công trực diện nhưng trong không khí vui vẻ, chốt hợp đồng vì cảm xúc và sự nể trọng.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm DI / ID (Người Tiên Phong).', 'User-confirmed DISC Master Data'),
  ('DC', 'Thủ Lĩnh Thực Thi', 'Bạn quyết đoán (D) và cực kỳ chặt chẽ (C). Điểm mạnh: Nói được làm được, không hứa suông. Rất được khách VIP tin tưởng.', 'Điểm cần cân bằng: kết hợp số liệu với ngôn ngữ đời thường để khách không bị áp lực thông tin.', 'Đánh nhanh thắng nhanh, dùng số liệu và tính pháp lý để đập tan sự trì hoãn.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm DC / CD (Thủ Lĩnh Thực Thi).', 'User-confirmed DISC Master Data'),
  ('IS', 'Chuyên Gia Kết Nối', 'Bạn hòa đồng (I) và tận tâm (S). Điểm mạnh: Bán hàng như không bán, biến khách hàng thành người nhà.', 'Điểm cần cân bằng: đặt mốc hành động rõ ràng để sự đồng hành không kéo dài thành trì hoãn.', 'Dùng sự chân thành, lắng nghe thấu cảm và những câu chuyện để khách hàng tự nguyện tham gia.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm IS / SI (Chuyên Gia Kết Nối).', 'User-confirmed DISC Master Data'),
  ('SC', 'Chuyên Gia Hỗ Trợ', 'Bạn chăm sóc tỉ mỉ (S) và làm việc nguyên tắc (C). Điểm mạnh: Tỷ lệ duy trì hợp đồng cao nhất, dịch vụ hậu mãi xuất sắc.', 'Điểm cần cân bằng: chủ động đề xuất bước tiếp theo thay vì chờ khách ra quyết định.', 'Chinh phục khách hàng bằng sự bền bỉ, an toàn, cung cấp giải pháp bảo vệ toàn diện.', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm SC / CS (Chuyên Gia Hỗ Trợ).', 'User-confirmed DISC Master Data'),
  ('CHAMELEON', 'Tắc Kè Hoa', 'Bạn là một bậc thầy linh hoạt! Điểm mạnh: Khả năng thích nghi tuyệt vời. Gặp khách D bạn quyết đoán, gặp khách S bạn từ tốn.', 'Điểm cần cân bằng: chọn một thông điệp chính trong mỗi cuộc gặp để sự linh hoạt không trở thành phân tán.', 'Biến hóa khôn lường, tùy biến theo từng tệp khách hàng. Hãy phát huy tối đa lợi thế này!', 'Nội dung chuẩn do Product Owner cung cấp: Nhóm Tắc Kè Hoa (Điểm đều nhau).', 'User-confirmed DISC Master Data')
on conflict (disc_type) do update set
  headline = excluded.headline,
  strengths = excluded.strengths,
  watch_out = excluded.watch_out,
  selling_style = excluded.selling_style,
  source_evidence = excluded.source_evidence,
  source_sheet = excluded.source_sheet;
