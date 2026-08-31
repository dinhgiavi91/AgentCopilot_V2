import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("V102 role-based access for Leader Playbook", () => {
  it("khóa La Bàn trong sidebar và chỉ mở cho Leader/Director/Super Admin", () => {
    expect(home).toContain('const canAccessLeaderPlaybook = pilotSession?.profile.role === "leader"');
    expect(home).toContain('|| pilotSession?.profile.role === "director"');
    expect(home).toContain('|| pilotSession?.profile.role === "super_admin";');
    expect(home).toContain("const leaderPlaybookLocked = !canAccessLeaderPlaybook;");
    expect(home).toContain("onClick={openLeaderPlaybook}");
    expect(home).toContain('aria-disabled={leaderPlaybookLocked}');
    expect(home).toContain('aria-label="Khóa La Bàn Lãnh Đạo"');
  });

  it("chặn truy cập trực tiếp của TVV bằng fallback và nút quay về trang chủ", () => {
    expect(home).toContain('{view === "leader" && (');
    expect(home).toContain("leaderPlaybookLocked ? (");
    expect(home).toContain("🔒 Tính năng này dành riêng cho cấp Quản lý (Leader).");
    expect(home).toContain("Tài khoản TVV không có quyền xem nội dung La Bàn Lãnh Đạo.");
    expect(home).toContain('onClick={() => openView("profile")}');
    expect(home).toContain("Quay lại Trang chủ");
  });
});
