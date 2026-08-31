# Xác minh có đăng nhập — Daily Quiz, XP và Streak

Quy trình này được thực hiện sau khi TVV đã đăng nhập Supabase trong Preview/production. Nó không cần và không được sử dụng dữ liệu nhận diện khách hàng.

| Bước | Thao tác | Kỳ vọng xác minh |
|---|---|---|
| 1 | Đăng nhập một tài khoản TVV Supabase và mở Dashboard. | Dashboard gọi `fetchAdvisorProgress`; tổng XP và Chuỗi lấy từ `users_profile`, không lấy từ state phiên trước. |
| 2 | Mở **Nạp Não Mỗi Sáng**, chọn đáp án đúng. | RPC `claim_daily_quiz_xp()` tạo đúng một ledger `daily_quiz` trị giá `+10`; `users_profile.total_xp` và `current_streak` tăng atomically. |
| 3 | Tải lại trang trong cùng ngày UTC. | `fetchAdvisorProgress` thấy ledger `daily_quiz` trong ngày; Card ở trạng thái hoàn tất, XP/Chuỗi vẫn đúng. |
| 4 | Bấm lại Card/refresh thêm lần nữa trong ngày. | RPC trả `claimed=false`; không có ledger thứ hai và không cộng điểm thêm. |
| 5 | Đổi sang ngày UTC tiếp theo. | Card được mở lại; lần trả lời đúng tiếp theo mới có thể tạo một ledger `+10` mới. |

> Lưu ý: phần Preview chưa có màn hình đăng nhập Supabase chuyên dụng, vì vậy kiểm thử có tài khoản cần thực hiện sau khi TVV đã có session Supabase hợp lệ. Các unit test trong `server/sprint6.logic.test.ts` kiểm chứng việc dựng lại trạng thái từ dữ liệu Profile và ledger, đồng thời kiểm tra ranh giới ngày UTC của `daily_quiz`; RLS/Content Library được kiểm tra riêng trong `server/sprint6.rls.test.ts`.
