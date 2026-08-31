import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("V107 mega optimized fixes", () => {
  it("luôn giải phóng Nạp Não và có hai lối thoát người dùng", () => {
    expect(home).toContain("const [dailyPushOpen, setDailyPushOpen] = useState(false);");
    expect(home).toContain("window.setTimeout(() => setDailyPushOpen(true), 4000);");
    expect(home).toContain("finally {");
    expect(home).toContain("setDailyPushOpen(false);");
    expect(home).toContain('toast.success("Đã ghi nhận câu trả lời.")');
    expect(home).toContain('aria-label="Đóng Nạp Não Mỗi Sáng"');
    expect(home).toContain("Bỏ qua hôm nay");
  });

  it("giữ khóa La Bàn cho TVV và giới hạn quản trị Marketing cho Super Admin", () => {
    expect(home).toContain("const leaderPlaybookLocked = !canAccessLeaderPlaybook;");
    expect(home).toContain("onClick={openLeaderPlaybook}");
    expect(home).toContain('const isMarketingAdmin = pilotSession?.profile.role === "super_admin";');
    expect(home).toContain('{isMarketingAdmin && activeMarketingView === "manager" && (');
    expect(home).toContain("<MarketingManager templates={content.marketing}");
  });
});
