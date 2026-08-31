# Agent Copilot — Mã nguồn Sprint 11

Gói bàn giao này phản ánh source tại checkpoint **cc53f217**. Nó bao gồm toàn bộ các module đã phát hành từ Sprint 1 đến Sprint 11, bao gồm cả phần mở rộng Sprint 10–11 và các regression test liên quan.

## Các module Sprint 10–11 có trong gói

| Phạm vi | Tệp nguồn chính |
| --- | --- |
| Video Roleplay, Reels và luồng demo Sprint 10 | `client/src/components/Sprint10VideoModules.tsx`, `client/src/lib/sprint10Logic.ts`, `client/src/sprint10.css` |
| Mục tiêu đa vai trò Sprint 11 | `client/src/components/Sprint11TargetModal.tsx`, `client/src/lib/sprint11Logic.ts` |
| CRM Zero-PII và Follow-up | `client/src/components/Sprint11CrmModules.tsx` |
| Radar/La Bàn Leader | `client/src/components/Sprint11LeaderModules.tsx` |
| Báo Cáo Giám Đốc nâng cao | `client/src/components/AdvancedDirectorReport.tsx`, `client/src/lib/leaderSalesPicture.ts` |
| Style hệ thống Sprint 10–11 | `client/src/sprint10.css`, `client/src/sprint11.css` |
| Regression Sprint 10–11 | `server/sprint10*.test.ts*`, `server/sprint11*.test.ts*` |

## Chạy local

Sau khi giải nén, dùng Node.js 22 và pnpm:

```bash
pnpm install
pnpm run dev
```

Gói không chứa `node_modules`, `dist`, cache phát triển, log hay secrets. Nếu chạy ngoài môi trường Manus, cần cung cấp các biến Supabase hợp lệ theo tệp cấu hình môi trường riêng của môi trường đích; không đưa service-role key vào frontend hoặc vào source control.
