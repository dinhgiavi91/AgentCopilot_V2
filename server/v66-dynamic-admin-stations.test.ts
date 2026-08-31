import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const inPlaceCms = readFileSync(new URL("../client/src/components/InPlaceContentAdmin.tsx", import.meta.url), "utf8");
const feedbackInbox = readFileSync(new URL("../client/src/components/AdminFeedbackInbox.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260826203000_v66_dynamic_admin_stations.sql", import.meta.url), "utf8");

describe("V66 Dynamic CMS Matrix", () => {
  it("tạo năm station với RLS, phân quyền Super Admin và Zero-PII feedback", () => {
    for (const table of ["news_90s", "case_studies", "empathy_dictionary", "leader_playbook", "user_feedbacks"]) {
      expect(migration).toContain(table);
    }
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("role = 'super_admin'");
    expect(migration).toContain("user_feedbacks_no_contact_pii");
    expect(migration).toContain("insert into public.news_90s");
    expect(migration).toContain("insert into public.case_studies");
  });

  it("dùng hooks Supabase phân quyền cho CRUD và feedback inbox", () => {
    for (const token of ["fetchDynamicAdminRecords", "saveDynamicAdminRecord", "deleteDynamicAdminRecord", "fetchUserFeedbacks", "deleteUserFeedback", "assertDynamicContentManager", "from(\"news_90s\")", "from(\"case_studies\")", "from(\"leader_playbook\")", "from(\"user_feedbacks\")"]) {
      expect(content).toContain(token);
    }
    expect(content).toContain('from("user_feedbacks").insert');
    expect(content).toContain('kind: "news" as const');
    expect(content).not.toContain('safeContentRead<NewsCaseStudy>("news", supabase.from("news_case_studies")');
  });

  it("render CRUD Super Admin tại station và chuyển end-user views sang dữ liệu live", () => {
    for (const token of ["Quản lý Bản Tin", "Thêm Case Study", "Thêm Từ Điển", "Thêm Kịch Bản", "saveDynamicAdminRecord", "deleteDynamicAdminRecord"]) {
      expect(inPlaceCms).toContain(token);
    }
    expect(feedbackInbox).toContain("fetchUserFeedbacks");
    expect(feedbackInbox).toContain("deleteUserFeedback");
    expect(home).toContain("<InPlaceContentAdmin");
    expect(home).toContain("<AdminFeedbackInbox />");
    expect(home).not.toContain("<DynamicAdminStationsCMS />");
    expect(home).toContain('item.kind === "news"');
    expect(home).toContain('item.kind === "case"');
    expect(home).not.toContain("SalesVideoReels onWatch");
  });
});
