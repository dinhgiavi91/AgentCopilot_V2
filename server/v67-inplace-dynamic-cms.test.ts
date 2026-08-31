import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const controls = readFileSync(new URL("../client/src/components/InPlaceContentAdmin.tsx", import.meta.url), "utf8");
const inbox = readFileSync(new URL("../client/src/components/AdminFeedbackInbox.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260826210000_v67_inplace_cms_compat.sql", import.meta.url), "utf8");

describe("V67 In-place Dynamic CMS", () => {
  it("chỉ render controls quản trị theo role super_admin tại các station", () => {
    expect(home).toContain('const isSuperAdmin = pilotSession?.profile.role === "super_admin"');
    expect(home).toContain('{isSuperAdmin && <InPlaceContentAdmin station="leader_playbook"');
    expect(home).toContain('{isEmpathy && isSuperAdmin && <div className="mb-5 flex justify-end"><InPlaceContentAdmin station="empathy_dictionary"');
    expect(home).toContain('{isSuperAdmin && <div className="mb-5 flex justify-end"><InPlaceContentAdmin station={newsSection === "case" ? "case_studies" : "news_90s"}');
    expect(home).toContain('pilotSession?.profile.role === "super_admin" ? <AdminFeedbackInbox />');
    expect(home).not.toContain("<DynamicAdminStationsCMS />");
  });

  it("giữ data live, form fields và thao tác CRUD theo từng station", () => {
    for (const marker of ["Quản lý Bản Tin", "Short Video URL", "Thêm Case Study", "Video Placeholder URL", "Thêm Từ Điển", "Thêm Kịch Bản", "Kịch bản Coaching", "saveDynamicAdminRecord", "deleteDynamicAdminRecord"]) {
      expect(controls).toContain(marker);
    }
    expect(inbox).toContain("fetchUserFeedbacks");
    expect(inbox).toContain("deleteUserFeedback");
    expect(content).toContain('video_url: videoUrl || null');
    expect(content).toContain('const type = input.type === "coaching_script" ? "coaching_script" : "principle";');
    expect(content).toContain('feature: input.favorite_feature');
  });

  it("giữ schema tương thích với video, coaching và feedback feature", () => {
    for (const marker of ["add column if not exists video_url", "type in ('principle', 'coaching')", "add column if not exists feature", "feature = favorite_feature"]) {
      expect(migration).toContain(marker);
    }
  });
});
