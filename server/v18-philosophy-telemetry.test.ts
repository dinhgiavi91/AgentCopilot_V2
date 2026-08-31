import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260825084500_v18_philosophy_telemetry.sql", "utf8");
const content = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const dashboard = readFileSync("client/src/components/AdminHomeDashboard.tsx", "utf8");

describe("V18 Hệ Điều Hành Chống Rụng Số", () => {
  it("tổng hợp bốn trụ cột bằng các nguồn sẵn có và không trả về dữ liệu định danh", () => {
    for (const token of ["intervention_outcomes", "checkpoint_day = 'd7'", "recovery_status = 'recovered'", "public.interventions", "public.signals", "public.xp_gifts", "public.daily_logs", "public.activity_events", "learning_touches_30d"]) expect(migration).toContain(token);
    for (const forbidden of ["display_name", "email", "phone", "policy_number", "giver_id'", "recipient_id'"]) expect(migration).not.toContain(forbidden);
  });

  it("khóa RPC bằng quyền authenticated và guard Super Admin trong SECURITY DEFINER", () => {
    for (const token of ["SECURITY DEFINER", "role = 'super_admin'", "auth.uid()", "REVOKE ALL ON FUNCTION public.get_app_philosophy_metrics_v1() FROM PUBLIC", "FROM anon", "GRANT EXECUTE ON FUNCTION public.get_app_philosophy_metrics_v1() TO authenticated"]) expect(migration).toContain(token);
    expect(content).toContain("Telemetry triết lý chỉ dành cho Super Admin.");
    expect(content).toContain('client.rpc("get_app_philosophy_metrics_v1")');
  });

  it("thay vanity telemetry bằng bốn nhịp đập và vẫn giữ các công cụ CMS", () => {
    for (const token of ["Hệ Điều Hành Chống Rụng Số", "Nhịp Đập Sinh Tồn", "Nhịp Đập Quản Trị", "Nhịp Đập Năng Lực", "Nhịp Đập Hạnh Phúc", "Ngân Hàng Nạp Não", "Hệ Sinh Thái Nội Dung", "Cấu Hình Cột Mốc Chuỗi"]) expect(dashboard).toContain(token);
    expect(dashboard).not.toContain("Daily Active Users");
  });
});
