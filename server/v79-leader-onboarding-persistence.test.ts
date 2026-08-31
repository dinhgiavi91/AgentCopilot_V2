import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260827023000_v79_leader_onboarding_persistence.sql", import.meta.url), "utf8");

describe("V79 L.E.A.D onboarding and persistence", () => {
  it("lưu mô tả kết quả chính tắc cùng với leadership_style trong profile", () => {
    expect(migration).toContain("add column if not exists leadership_style_description text");
    expect(migration).toContain("set leadership_style = p_style,");
    expect(migration).toContain("leadership_style_description = v_description");
    expect(migration).toContain("results -> p_style ->> 'description'");
    expect(content).toContain("leadership_style, leadership_style_description, created_at");
  });

  it("mở onboarding bắt buộc khi Leader chưa có kết quả và không cho backdrop đóng modal", () => {
    expect(home).toContain('const requiresLeadershipOnboarding = pilotSession?.profile.role === "leader" && !pilotSession.profile.leadership_style');
    expect(home).toContain("setLeadershipIntroOpen(true);");
    expect(home).toContain("setDiscOpen(true);");
    expect(home).toContain("<Modal onClose={requiresLeadershipOnboarding ? () => undefined : () => setDiscOpen(false)}>");
    expect(home).toContain("!requiresLeadershipOnboarding && <button");
  });

  it("hiển thị tên và mô tả đã lưu, rồi chỉ cho làm lại bằng liên kết tinh gọn", () => {
    expect(home).toContain("Phong cách quản trị của bạn:");
    expect(home).toContain("savedLeadershipDescription");
    expect(home).toContain("Làm lại bài trắc nghiệm");
    expect(home).toContain("font-black text-amber-700 underline");
  });

  it("giữ session refresh nhận biết hai trường L.E.A.D và không đổi DISC TVV", () => {
    expect(home).toContain("currentProfile.leadership_style === nextProfile.leadership_style");
    expect(home).toContain("currentProfile.leadership_style_description === nextProfile.leadership_style_description");
    expect(home).toContain('pilotSession?.profile.role !== "advisor"');
    expect(home).toContain("completeDiscCheckpoint(result as DiscProfileType)");
  });
});
