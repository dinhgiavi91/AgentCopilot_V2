# Pilot Data Loop — Step 2

## Phạm vi đã hoàn tất

Step 2 chỉ kết nối **Auth, Activity TVV, Leader Radar, Intervention và Founder Overview** với dữ liệu Supabase từ Step 1. Các module Sprint cũ, visual language Navy/Gold, Free/Pro Playbook và các luồng không thuộc Pilot được giữ nguyên.

| Luồng | Mã nguồn chính | Quyền yêu cầu |
| --- | --- | --- |
| Đăng nhập / reset mật khẩu | `PilotAuthControl`, `signInPilot`, `requestPilotPasswordReset` | User Auth + Profile active |
| TVV ghi Nhịp Đập | `logPilotActivity` | `advisor` |
| Leader Radar / Review / Intervention | `PilotRadar`, `reviewPilotSignal`, `createPilotIntervention` | `leader`, `super_admin` |
| Founder Overview | `FounderPilotOverview`, `fetchPilotOverview` | `super_admin` |

## Quy tắc dữ liệu và phân quyền

Auth sử dụng email/password hiện có của Supabase Auth; ứng dụng không có đăng ký tự do và không tự tạo Profile. Khi đăng nhập, `profiles.is_active` và `profiles.role` được kiểm tra trước khi mở quyền. Reset mật khẩu sử dụng API chính thức của Supabase, hiển thị phản hồi không xác nhận Email có tồn tại hay không.

TVV chỉ ghi `activity_events` cá nhân. Chọn **Dời lịch** tạo thêm một `followups` mở trong cùng Team. Giao diện không yêu cầu hoặc lưu PII khách hàng. Leader/Super Admin đọc Signal qua RLS; Review ghi `signal_reviews` và đổi Signal thành `reviewed` hoặc `dismissed`. Lưu Intervention ghi `interventions` và đổi Signal thành `reviewed` hoặc `acted_on` theo trạng thái hành động.

Founder Overview chỉ render khi Session Profile có role `super_admin`; query tổng hợp Teams active, Advisor, Signal mới, Intervention, Review và tỷ lệ Signal đã được xử lý. Snapshot xác minh dữ liệu seed sau Step 2: 1 Team active, 3 Advisor active, 1 Signal mới, 1 Intervention và 1 Review.

## Kiểm thử thủ công

1. Mở ứng dụng, chọn **Đăng nhập Pilot** và dùng một tài khoản Auth đã được quản trị viên gắn `profiles` active. Thử **Quên mật khẩu? Gửi link reset** với Email Pilot.
2. Đăng nhập Advisor, chọn **Ghi hoạt động**, chọn **Dời lịch**, nhập ngày Follow-up và lưu. Kiểm tra `activity_events` và `followups` có bản ghi cùng `user_id`/`team_id`; không có PII khách hàng.
3. Đăng nhập Leader, mở **Radar**. Chọn một Signal, bấm Review hoặc **Log Intervention**, nhập rationale tối thiểu 4 ký tự và lưu. Kiểm tra Signal đổi trạng thái.
4. Đăng nhập Super Admin, mở `#founder`. Xác nhận chỉ số tổng hợp và danh sách Team có dữ liệu thật.
5. Đăng nhập Advisor rồi thử mở Radar/`#founder`; ứng dụng phải hiển thị guard quyền, không lộ danh sách Signal hay số liệu đa Team.

## Xác minh kỹ thuật

Regression bổ sung: `server/pilot-step2.ui.test.tsx` và `server/pilot-step2.home.test.tsx`. Quality gate cuối: **34 test files pass, 99 tests pass, 1 test file skip, 2 tests skip**; TypeScript và production build pass. Vite báo chunk client lớn và cảnh báo `use client` từ Framer Motion trong quá trình bundling, không chặn build.
