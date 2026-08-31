# Agent Copilot — Next.js/Supabase Sprint 1

Đây là cấu trúc tham chiếu **Next.js App Router** cho source production khi kết nối Supabase. Bản preview trong workspace hiện dùng cùng thiết kế Dashboard TVV để xác minh UI; thư mục này giữ đúng cấu trúc người dùng yêu cầu cho codebase Next.js.

```text
nextjs-supabase/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Dashboard TVV — Hồ Sơ Chiến Binh
│   └── globals.css
├── components/
│   └── brand-mark.tsx
├── lib/
│   └── supabase/
│       └── client.ts
├── types/
│   └── sprint1.ts
├── .env.example
└── package.json
```

## Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Áp dụng `../supabase/migrations/20260813_sprint1_agent_copilot.sql` trong Supabase SQL Editor trước khi chạy ứng dụng. Không sử dụng `service_role` ở browser.
