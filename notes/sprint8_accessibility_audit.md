# Sprint 8 — Audit contrast và keyboard

## Phạm vi surface nền trắng

| Nhóm giao diện | Surface đã rà soát | Quy tắc foreground |
|---|---|---|
| Nội dung và onboarding | `content-state`, `target-modal`, `welcome-modal`, `pro-gate`, `radar-empty` | `#0F172A` cho nội dung chính |
| Modal vận hành | `disc-modal`, `ledger-modal`, `log-modal`, `energy-store-modal` | `#0F172A` cho text trên nền trắng |
| Card thư viện | `disc-launch`, `feedback-form`, `cover-card`, `news-card`, `reward-card` | `#0F172A` cho heading; `#475569` cho body |
| Form controls | `select`, `option`, `input`, `textarea` | foreground `#0F172A`, background `#FFFFFF` |

Các quy tắc được tập trung trong `client/src/sprint8.css` để tránh màu chữ kế thừa thiếu tương phản khi có component mới. Regression test `server/sprint8.contrast.test.ts` xác nhận đủ inventory này.

## Keyboard và focus

`server/sprint8.accessibility.test.tsx` sử dụng jsdom và `@testing-library/user-event` để kích hoạt bằng phím **Enter** theo các luồng: Toggle Chế Độ Quản Lý (PRO), điều hướng Radar, CTA Gửi lệnh Cứu Net, XP Ledger, Trạm Tiếp Năng Lượng, CTA Đổi quà và filter Case Study Thực Chiến. Các control quan trọng có `:focus-visible` rõ ràng trong `sprint8.css`; Toggle có `aria-label` và `aria-pressed` trực tiếp trong JSX.

Kịch bản riêng đặt `window.innerWidth = 375` trước render, sau đó xác minh bằng Enter luồng Toggle PRO, Radar ở `mobile-bottom` và XP Store. Vì jsdom không tính CSS media query như Chromium, kịch bản này chứng minh cấu trúc DOM và thứ tự focus của mobile shell; screenshot mobile ở bước xác minh trực quan bổ sung bằng chứng rằng các control không bị FAB hoặc bottom navigation che khuất.
