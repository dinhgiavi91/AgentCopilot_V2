# Sprint 11 Phase 1–2 — Biên bản nghiệm thu kỹ thuật

## Kiểm thử tự động

Ngày 14/08/2026, bộ kiểm thử toàn diện đạt **62 kiểm thử pass** và **2 skip** có chủ đích. `pnpm run check` và `pnpm run build` hoàn tất thành công. Cảnh báo bundle từ Framer Motion và kích thước chunk không làm build thất bại.

## Kiểm tra trực quan

Đã kiểm tra trực tiếp Dashboard, CRM Nhật Ký Khách Hàng và hai biến thể modal Mục Tiêu. Dashboard hiển thị font Plus Jakarta Sans, vùng động lực thay cho minh họa tĩnh và thao tác Chế Độ Quản Lý. CRM giữ nguyên vùng nhập Zero-PII. Modal TVV tách BHNT/PNT với thu nhập, hoa hồng và size hợp đồng; modal Leader chỉ hiển thị KPI doanh số BHNT/PNT, TVV active và tuyển dụng mới. Preview mobile 375×812 xác nhận Dashboard và CRM xếp một cột, giữ được hierarchy và không có tràn ngang. Hai preset demo `?demo=target-advisor` và `?demo=target-leader` xác nhận trực tiếp hai modal giữ được padding, cột đơn, trường nhập dễ đọc và cuộn nội dung an toàn trong viewport mobile.

Regression interaction cũng xác minh ở mobile: textarea Nhật Ký KH không reset, DISC chuyển câu bằng phím Enter, modal Mục Tiêu có accessible name, `aria-modal="true"` và nút đóng phản hồi phím Enter.

## Phase 3 — CRM Follow-up

Đã kiểm tra CRM trên desktop và mobile. Người dùng có thể chọn bối cảnh **Khác**, nhập ngày follow-up tuỳ chọn và xem lịch chạm sắp tới chỉ bằng mã nhật ký, giai đoạn, bối cảnh và ngày hành động. Không có trường định danh khách hàng; validation tiếp tục chặn email và số điện thoại.

## Phase 4 — Radar và La Bàn Leader

Preview desktop/mobile xác nhận Radar PRO hiển thị drill-down theo tín hiệu với timeline hoạt động và đề xuất coaching không định danh. La Bàn Lãnh Đạo hiện có Tabs cho nguyên tắc và kịch bản coaching, kết hợp Accordion dễ mở trên mobile. Regression xác minh drill-down bằng phím Enter, tạo kế hoạch coaching và chuyển Tabs thành công.

## Phase 5 — Vũ khí demo

Roleplay 03:00 giữ trạng thái mô phỏng, không gọi camera hoặc microphone; sau khi dừng vòng tập, giao diện hiển thị coaching AI mô phỏng và nêu rõ không lưu video/giọng nói. Reels có trạng thái clip đang phân tích; Poster Generator chỉ preview text nội bộ và chặn email/số điện thoại. Đã kiểm tra Reels/Poster desktop-mobile và modal Roleplay trên mobile.

## Quality gate cuối Sprint 11

Toàn bộ regression trên mã cuối đạt **72 kiểm thử pass** và **2 skip** có chủ đích. TypeScript runtime và build production hoàn tất thành công. Các cảnh báo bundle của Framer Motion/chunk size chỉ là cảnh báo tối ưu hóa, không làm quá trình build thất bại.

## Lưu ý dữ liệu

Nhật Ký Khách Hàng tiếp tục không có trường tên, số điện thoại, email hoặc định danh khách hàng. Các điểm dữ liệu mục tiêu và demo đội ngũ vẫn nằm trong phạm vi Zero-PII của sản phẩm.

## Bản vá feedback Sprint 11

Welcome Modal được căn giữa ở desktop; mobile vẫn giữ cách trình bày phù hợp. Toàn bộ vùng ứng dụng dùng Plus Jakarta Sans đã được nạp sẵn, tránh trộn font fallback không hỗ trợ tiếng Việt. Daily Quiz được mở rộng và Dashboard có thêm minh họa động lực ở vùng mục tiêu.

Playbook nhận padding, chiều cao và quy tắc chống tràn mới. Radar Leader đã có Báo cáo Giám đốc hiển thị thường trực gồm TVV hoạt động, tỷ lệ chạm, điểm sáng và ưu tiên tuần. CRM dùng gợi ý theo nội dung ghi chú **không định danh**, đồng thời tiếp tục chặn email/số điện thoại. Marketing tách hai nhóm TVV/Leader và có Poster Giới thiệu sản phẩm/dịch vụ ở cả hai tab.

Regression feedback bao phủ next-step CRM, keyboard collapse/expand Báo cáo Giám đốc và các marker UI quan trọng. Đã kiểm tra bằng preview desktop và mobile trên các luồng Dashboard, Playbook, Radar, CRM, Ngôn ngữ Thấu Cảm, La Bàn và Marketing. Checkpoint phát hành: `5d121832`.

## Bản vá Contest và Mobile

Contest Panel dùng callback lưu bất đồng bộ và chỉ append Contest trả về sau khi lệnh lưu thành công; vì vậy danh sách hiển thị ngay không cần reload. Trên mobile, Sổ cái XP có lối vào nổi cố định với icon tia sét, còn nút Xuất Báo Cáo GĐ được đặt trước danh sách tín hiệu Radar, full-width và sticky. Regression xác minh append State Contest từ API callback, thao tác mở báo cáo và CSS mobile; type-check, full suite và build production đều hoàn tất.

## Phân nhóm Marketing 1-Chạm

Thư viện Marketing được phân loại bằng tag **KHÁCH HÀNG** hoặc **NỘI BỘ LEADER** từ category, occasion và nội dung thẻ. Tab TVV chỉ lấy nhóm KHÁCH HÀNG; tab Leader giữ toàn bộ thẻ gồm cả nhóm khách hàng, vinh danh nội bộ và chúc mừng thăng cấp. Regression kiểm tra rõ các mẫu sinh nhật, nhắc phí, tử vi, Top Sale và thăng cấp; preview hai tab đã được rà soát trên desktop.

## Bức tranh Doanh số — Goal vs. Actual

Đã kiểm tra trực tiếp Modal Báo Cáo Giám Đốc ở Radar Leader. Section mới hiển thị Mục tiêu Team **620 triệu**, Thực đạt **280 triệu**, **3** Nhịp Đập có trạng thái Ký Hợp Đồng/Thành công và tỷ lệ hoàn thành **45%**. Nội dung nêu rõ đây là số liệu tự khai báo phục vụ theo dõi nội bộ, không liên kết dữ liệu công ty BH và không chứa PII khách hàng.

## Báo Cáo GĐ nâng cao

Modal đã hiển thị đúng Section **01B Hiệu suất tháng trước** với doanh số tăng 18% và hợp đồng giảm 6%, biểu đồ doanh thu tự khai báo theo tuần, nút Thực đạt có thể mở drill-down và nút Tải Báo Cáo. Không có control sửa Mục tiêu trong phạm vi báo cáo.

Kiểm tra trực tiếp Desktop đã xác nhận Modal nâng cao hiện đủ 01A, 01B, Trend Chart SVG, nút Thực đạt và control Tải Báo Cáo trong cùng luồng Radar Leader.

Menu tải báo cáo hiển thị hai lựa chọn **PDF nhiều trang** và **Ảnh PNG**. Đã xuất thử thành công ảnh PNG ngay trên preview; ứng dụng hiển thị toast xác nhận tải file.

## State sync Contest và Mục tiêu

Contest được đưa về State cấp Home ngay sau callback persistence trả về bản ghi thành công; Contest Panel đồng thời tránh dùng mảng props mặc định không ổn định để không gây vòng lặp render. Modal Mục tiêu chờ persistence `users_profile` hoàn tất rồi gán `target_income` trả về vào State Dashboard, do đó Progress Bar và phễu tính lại trong cùng phiên. Regression chuyên biệt đạt 5/5; full suite, TypeScript và build production đều hoàn tất.
