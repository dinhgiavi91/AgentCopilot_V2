# Sprint 6 — Nhật ký xác minh

## Desktop modules

Ngày kiểm tra: 13/08/2026. Preview desktop tại các hash route `/#disc`, `/#cover`, `/#news` và `/#feedback` đã render thành công sau khi dev server khởi động lại.

| Màn hình | Kết quả trực quan | Dữ liệu hiển thị |
|---|---|---|
| Trạm Đăng Kiểm | Hero navy–gold, CTA bắt đầu trắc nghiệm hiển thị rõ ràng | 5 câu DISC từ `disc_questions` sẵn sàng trong modal |
| Trợ Lý Thẩm Định | Bốn card nội dung, nút copy rõ ràng, bố cục không tràn | 4 mẫu từ `cover_letters` |
| Bản Tin 90s & Án Lệ | Feed đọc tốt, badge category và takeaway phân cấp rõ | 3 case từ `news_case_studies` |
| Góc Lắng Nghe | Rating, select và textarea dễ thao tác; Zero-PII luôn được nhắc | Form `feedback_entries` với kiểm tra client và database |

Lưu ý: ảnh full-page không dùng để nhận định sidebar/FAB cố định vì cơ chế capture chủ động ẩn fixed chrome ngoài top bar. Hai thành phần này sẽ được xác minh ở ảnh viewport thường và mobile.

## Fixed chrome và responsive

Ảnh viewport desktop của `/#cover` xác nhận sidebar Navy, đủ menu công cụ mới và FAB vàng **Ghi Nhịp Đập** hiển thị đồng thời. Ảnh viewport `375×812` của cả bốn module xác nhận header mobile, layout một cột, CTA, card nội dung và FAB tròn đều hiển thị trong vùng thao tác; FAB được đặt cao hơn bottom navigation nên không bị che.

## Hoàn thiện navigation và accessibility

Sidebar desktop hiện hiển thị hai entry riêng **Bản Tin 90s** và **Án Lệ**. Cả hai cùng dẫn tới feed `news_case_studies` nhưng áp filter theo mã dữ liệu (`N*` cho Bản Tin; `C*` cho Án Lệ), và người dùng có thể chuyển giữa **Tất cả / Bản Tin 90s / Án Lệ** bằng pill filter. Ảnh mobile xác nhận ba pill vừa khung, nội dung không tràn và FAB tiếp tục đứng trên bottom navigation. CTA cũng có `:focus-visible` với outline/ring navy–gold để dùng được bằng bàn phím.
