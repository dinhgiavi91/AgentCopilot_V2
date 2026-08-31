# Sprint 9 — Ghi nhận kiểm tra trực quan

## Desktop preview

- Welcome Modal Navy–Gold hiển thị đúng logo chính thức, text tương phản rõ và CTA có thể đóng bằng chuột.
- Community Feed mở từ sidebar, có hero Navy–Gold, composer Nhật Ký Zero-PII, công tắc Công Khai, reaction Tim/Mặt cười và ô bình luận cho mỗi bài.
- Header có nút đổi tên Team, Tặng XP, XP Ledger và Toggle Chế Độ Quản Lý (PRO).
- Modal Tặng XP Biết Ơn mở đúng lớp backdrop; select đồng đội, textarea lời cảm ơn và CTA Navy–Gold hiển thị rõ. Validation chặn lời cảm ơn một ký tự, hiển thị toast yêu cầu nội dung ngắn; không có ghi dữ liệu thật.

## Ghi chú kiểm thử

- Regression: `pnpm test` đạt 39 tests, 1 test xác thực được skip có chủ đích.
- Type-check: `pnpm run check` đạt.
- Production build: `pnpm run build` đạt; chỉ có cảnh báo Rollup về kích thước bundle và directive bên thứ ba, không có build error.

## Radar Leader

Khi bật Chế Độ Quản Lý (PRO), sidebar mở đúng Radar Leader. Ba tín hiệu SOS demo vẫn hiện, tiếp theo là Radar thấu cảm với tín hiệu từ chối, mất chuỗi và dời lịch; mỗi tín hiệu có gợi ý coaching riêng. Modal Báo Cáo GĐ mở từ CTA chuyên biệt, hiển thị ba KPI tổng hợp và một phân tích tuần có chiến lược tuần tới. Các surface trắng dùng chữ Navy/xám đậm, CTA Gold và backdrop có độ tương phản phù hợp.

## Mục tiêu và white-label

Form Mục Tiêu Đa Nguồn có hai trường BHNT/PNT, dropdown Newbie–Chuyên viên–Quản lý và phần giải thích tỷ lệ chốt cùng số cuộc gặp dự kiến. Header có nút Agent Copilot mở trường Tên Team ngay bên dưới, sẵn sàng lưu tên team bằng Enter hoặc blur. Những trạng thái này xuất hiện đúng trong preview desktop.

## Responsive mobile

Ở viewport 375 px, Dashboard giữ được topbar cô đọng, Quiz, mục tiêu, phễu, Nhịp hiện tại, XP và cảnh báo Zero-PII theo một cột không tràn ngang. Radar FREE hiển thị gate riêng với CTA đủ lớn để thao tác cảm ứng; trạng thái PRO và toàn bộ Community/Radar Leader đã được xác minh qua kiểm thử keyboard/jsdom cùng preview desktop.
