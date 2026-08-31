# Community Hub — Ghi chú kiểm tra bảo mật

Sau migration Community Hub ngày 24-08-2026, bộ kiểm tra Supabase báo `get_weekly_leaderboard_v1(uuid)` là hàm `SECURITY DEFINER` còn có thể gọi bởi `anon`. Bản vá tiếp theo thu hồi rõ ràng `EXECUTE` khỏi cả `PUBLIC` và `anon`, sau đó chỉ cấp lại cho `authenticated`.

> Hàm leaderboard vẫn kiểm tra `p_team_id = private.current_team_id()` để mỗi người dùng đã đăng nhập chỉ truy cập được bảng xếp hạng Team của chính mình.

Các cảnh báo khác trong kết quả kiểm tra thuộc những hàm XP/Auth tồn tại trước Community Hub và không được thay đổi trong hạng mục này.
