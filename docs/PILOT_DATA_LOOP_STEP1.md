# Pilot Data Loop — Step 1

## Phạm vi khóa lại

Step 1 chỉ tạo lớp dữ liệu cho vòng lặp **Activity → Signal → Leader Review → Intervention → Outcome**. Không có thay đổi JSX, Tailwind, route hoặc kết nối UI trong thay đổi này.

## Multi-tenant phẳng

Một `teams` là một pod Pilot gồm một Leader trực tiếp và các Advisor. `profiles.primary_team_id` là phạm vi tenant duy nhất trong Pilot; cấu trúc này cố ý chưa có cây tổ chức hoặc multi-team membership.

`profiles.role` có ba giá trị: `super_admin`, `leader`, `advisor`. Helper SECURITY DEFINER nằm trong schema `private`, khóa `search_path`, chỉ cấp execute cho `authenticated`, và không dùng JWT user metadata làm nguồn phân quyền. Mọi policy gọi helper bằng `select` để cache theo statement.

## Quy tắc truy cập

| Vai trò | Dữ liệu cá nhân | Dữ liệu team | Toàn hệ thống |
| --- | --- | --- | --- |
| Advisor | Đọc/ghi hoạt động và follow-up của chính mình; đọc Signal/Intervention liên quan | Không truy cập dữ liệu đồng đội | Không có |
| Leader | Có toàn quyền trong team trực tiếp, gồm review Signal và Intervention | Chỉ `primary_team_id` của chính mình | Không có |
| Super Admin | Có | Có | Có |

Signal do lớp detection server tạo bằng service role; Advisor không thể tự tạo Signal. Leader có thể cập nhật trạng thái Signal thuộc team và tạo/duy trì Review, Intervention, Outcome trong team. Profile tự chỉnh role hoặc đổi team bị chặn ở RLS; provisioning chỉ dành cho Super Admin/service role.

## Zero-PII

`followups.alias_label` chỉ lưu nhãn giả danh. Schema chặn ký tự `@` và chuỗi từ tám chữ số liên tiếp để giảm nguy cơ nhập email/số điện thoại; UI validation và review nghiệp vụ vẫn là lớp bảo vệ bổ sung bắt buộc trước khi nối màn hình.

## Seed an toàn

`supabase/seed/seed-pilot-data.mjs` tạo hoặc tái sử dụng năm Auth user tổng hợp tại tên miền `.test`, sau đó upsert một Team Pilot, Profile tương ứng, Activity, Follow-up, Signal, Review, Intervention và Outcome. Script đòi hỏi `SUPABASE_URL` cùng `SUPABASE_SERVICE_ROLE_KEY` ở runtime, không commit secret và không gửi email thực.

Chạy sau migration:

```bash
node supabase/seed/seed-pilot-data.mjs
```

## Trạng thái triển khai và xác minh

Migration `pilot_data_loop_step1` đã được áp dụng thành công trên Supabase. Supabase đã sinh lại TypeScript schema và xác nhận các bảng, khoá ngoại cùng enum `pilot_*` tương ứng với các hợp đồng trong `client/src/lib/pilotTypes.ts`.

| Kiểm tra | Kết quả |
| --- | --- |
| Seed Team/Profile | 1 Team Pilot; 1 Super Admin, 1 Leader, 3 Advisor |
| Vòng lặp dữ liệu | 4 Activity, 3 Follow-up, 2 Signal, 1 Review, 1 Intervention, 1 Outcome |
| RLS Advisor | Thấy đúng 1 Profile, 1 Activity, 1 Follow-up, 1 Signal và 1 Intervention của mình |
| RLS Leader | Thấy đúng toàn bộ 5 Profile, 4 Activity, 3 Follow-up, 2 Signal và 1 Intervention trong Team Pilot |
| RLS Super Admin | Thấy toàn bộ dữ liệu Pilot đã seed |

Rà soát bảo mật sau migration không ghi nhận hàm `SECURITY DEFINER` thuộc schema `private` của Pilot bị lộ qua API. Advisory còn lại thuộc ba hàm public đã có từ Sprint trước (`award_xp_from_daily_log`, `claim_daily_quiz_xp`, `handle_new_user`) và được giữ nguyên trong Step 1 để tránh thay đổi luồng UI/XP hiện hữu; chúng cần một đợt hardening riêng trước khi mở rộng Pilot thật.

## Giả định chờ duyệt trước UI wiring

1. Một Advisor chỉ có một `primary_team_id` trong Pilot; mapping đa team sẽ được thêm bằng bảng membership sau.
2. Signal được tạo bởi server/job có service role; giao diện chỉ đọc, review và tác động theo policy đã định.
3. Các tài khoản `.test` chỉ là seed kỹ thuật. Trước Pilot thật, Super Admin provision người dùng qua luồng Auth quản trị và gán role/team server-side.
