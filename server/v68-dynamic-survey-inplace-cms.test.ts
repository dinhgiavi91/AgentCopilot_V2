import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const survey = readFileSync(new URL("../client/src/components/PilotStep4FeedbackModule.tsx", import.meta.url), "utf8");
const inbox = readFileSync(new URL("../client/src/components/AdminFeedbackInbox.tsx", import.meta.url), "utf8");
const controls = readFileSync(new URL("../client/src/components/InPlaceContentAdmin.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260826213000_v68_feedback_config.sql", import.meta.url), "utf8");

describe("V68 Dynamic Survey & In-place CMS", () => {
  it("lưu một feedback_config có RLS, seed và quyền cập nhật Super Admin", () => {
    for (const marker of ["create table if not exists public.feedback_config", "id smallint primary key check (id = 1)", "dropdown_options jsonb", "insert into public.feedback_config", "enable row level security", "role = 'super_admin'"]) expect(migration).toContain(marker);
  });

  it("render form TVV/Leader từ config live, không hardcode lựa chọn dropdown", () => {
    for (const marker of ["fetchFeedbackConfig", "config.headline", "config.dropdown_options.map", "config.question_label", "data-feedback-survey=\"dynamic\""]) expect(survey).toContain(marker);
    expect(survey).not.toContain("<option>Bảo Bối Thực Chiến</option>");
    expect(content).toContain("updateFeedbackConfig");
  });

  it("cung cấp inbox Admin có bộ lọc và CMS theo ngữ cảnh tại station", () => {
    for (const marker of ["Lọc theo số sao", "Lọc theo tính năng", "Sắp xếp ngày tạo", "Cấu hình Câu hỏi Khảo sát", "updateFeedbackConfig", "deleteUserFeedback"]) expect(inbox).toContain(marker);
    for (const marker of ["triggerLabel", "initialValues", "compactMenu", "MoreVertical", "sm:group-hover:opacity-100"]) expect(controls).toContain(marker);
    expect(home).toContain('triggerLabel="+ Thêm Nội Dung"');
    expect(home).toContain('triggerLabel={newsSection === "case" ? "+ Thêm Case Study" : "+ Tạo Bản Tin"}');
    expect(home).not.toContain("<DynamicAdminStationsCMS />");
  });
});
