# Sprint 9 — Kiến trúc social gamification và quản trị

| Trụ cột | Nguồn trạng thái | Nguyên tắc dữ liệu |
|---|---|---|
| Nhịp Đập, XP, streak, DISC, Content Library | Supabase hiện hữu | Giữ nguyên schema/RLS hiện tại; không thay đổi dữ liệu lõi. |
| Cộng Đồng, reaction, comment, Tặng XP, Contest | State demo trong phiên | Dùng dữ liệu giả lập theo yêu cầu demo; hiển thị rõ là phiên demo, không ghi PII. |
| Mục tiêu BHNT/PNT và cấp bậc | State form cục bộ | Quy đổi cuộc gặp bằng tỷ lệ chốt demo có thể cấu hình; không ghi đè target_income cũ. |
| Radar thấu cảm và Báo cáo GĐ | Tín hiệu demo + logic thuần | Khi triển khai thật sẽ thay nguồn demo bằng users_profile/daily_logs theo RLS Leader. |
| White-label | State Header cục bộ | Đổi tên đội ngay trong phiên demo; không ảnh hưởng nhận diện logo. |

> Nhật ký cộng đồng chỉ nhận mô tả không định danh. Ứng dụng giữ cảnh báo Zero-PII và từ chối mẫu email/số điện thoại trước khi đưa nội dung vào Feed demo.

## Tỷ lệ chốt demo theo cấp bậc

| Cấp bậc | Tỷ lệ chốt demo | Dùng trong preview |
|---|---:|---|
| Newbie 1 tháng | 2.5% | Quy đổi mục tiêu thành lượng cuộc gặp cần tạo. |
| Chuyên viên 1 năm | 4.0% | Quy đổi mục tiêu thành lượng cuộc gặp cần tạo. |
| Quản lý | 6.0% | Quy đổi mục tiêu thành lượng cuộc gặp cần tạo. |

Các tỷ lệ này chỉ phục vụ mô phỏng front-end Sprint 9; bản vận hành sẽ lấy cấu hình do Leader thiết lập.
