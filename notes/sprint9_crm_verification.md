# Sprint 9 mở rộng — Kiểm tra trực quan

Truy cập trực tiếp `#customer_journal` hiện mở đúng tab **CRM Nuôi Dưỡng · Zero-PII**. Màn hình chỉ dùng các hồ sơ nuôi dưỡng đánh số, phân loại Trước Bán/Sau Bán và bối cảnh chăm sóc; không xuất hiện trường tên, số điện thoại, email hay định danh khách hàng. Khu vực gợi ý thấu cảm hiển thị hành động theo ngữ cảnh và nhịp chạm tiếp theo, trong khi các thẻ hồ sơ hiển thị nurture streak cùng CTA hoàn thành chạm.

Modal **Tặng Điểm Biết Ơn** hiển thị rõ select người nhận, trường số XP tự nhập, lời cảm ơn và CTA cập nhật theo số điểm. Giao diện desktop giữ được độ tương phản Navy–Gold, màu chữ tối trên nền trắng và backdrop làm nổi bật tác vụ.

Từ CRM, Toggle **Chế Độ Quản Lý (PRO)** bật được trong Header và duy trì ngữ cảnh màn hình. Các thao tác quản lý sẽ được kiểm tra tiếp ở Radar, nơi bảng mục tiêu đội được gắn sau phần Radar thấu cảm.

Trong Radar PRO, các tín hiệu SOS, gợi ý thấu cảm và CTA Báo Cáo GĐ vẫn hiển thị. Phần **Thiết Lập Mục Tiêu Đội · Demo** xuất hiện bên dưới, trình bày BHNT, PNT, cấp bậc và số cuộc gặp quy đổi cho từng TVV demo, đồng thời ghi rõ ranh giới RLS cho dữ liệu vận hành thực tế.

Community Feed hiển thị composer Zero-PII, toggle Công Khai, reaction Tim/Mặt cười, bình luận và nút **Tặng XP** trên từng bài. Bố cục desktop giữ card thoáng, CTA rõ, chữ Navy/xám đậm trên surface trắng và luồng thưởng nóng mở lại modal điểm tùy chỉnh.

Ở viewport 375 px, CRM chuyển form, gợi ý nuôi dưỡng và danh sách hồ sơ thành một cột; CTA hoàn thành chạm giữ chiều rộng cảm ứng phù hợp. Community Feed cũng giữ hero, composer, phản hồi, bình luận và nút Tặng XP theo một cột, không thấy tràn ngang hoặc chữ nền trắng.

Deep-link preview `?demo=gratitude` xác minh modal Tặng XP tùy chỉnh ở viewport 375 px: select người nhận, input số XP, textarea lời cảm ơn và CTA đều nằm gọn trong overlay. Deep-link `?demo=leader#radar` xác minh Radar PRO và bảng mục tiêu đội chuyển thành một cột trên mobile, vẫn đọc rõ thông tin BHNT, PNT và số cuộc gặp.
