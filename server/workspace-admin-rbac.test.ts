import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const baoBoiPage = readFileSync("client/src/components/BaoBoiPage.tsx", "utf8");
const underwriting = readFileSync("client/src/components/TroLyThamDinh.tsx", "utf8");
const dataLayer = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const playbookCms = readFileSync("client/src/components/PilotAdminCMS.tsx", "utf8");
const dictionaryCms = readFileSync("client/src/components/TroLyThamDinhCMS.tsx", "utf8");
const templateCms = readFileSync("client/src/components/UwTemplatesCMS.tsx", "utf8");
const workspaceField = readFileSync("client/src/components/WorkspaceAssignmentField.tsx", "utf8");

describe("Strict CMS RBAC and workspace assignment", () => {
  it("chỉ Super Admin mới render được các tab CMS Bảo Bối và UW", () => {
    for (const source of [baoBoiPage, underwriting]) {
      expect(source).toContain('const isSuperAdmin = session?.profile.role === "super_admin"');
      expect(source).toContain("{isSuperAdmin &&");
      expect(source).not.toContain('session?.profile.role === "super_admin" || session?.profile.role === "leader"');
    }
    expect(dataLayer).toContain('session.profile.role !== "super_admin"');
    expect(dataLayer).toContain("Chỉ Super Admin có thể quản trị Từ điển Thẩm định và Templates.");
  });

  it("dùng dropdown Team thật và persist team_id/null cho Global/Local", () => {
    expect(workspaceField).toContain("fetchPilotManagementTeams");
    expect(workspaceField).toContain("[Hệ Thống] - Áp dụng chung toàn App (Global)");
    expect(workspaceField).toContain("onTeamIdChange(event.target.value || null)");
    expect(workspaceField).not.toContain("team_daiichi");
    for (const source of [playbookCms, dictionaryCms, templateCms]) {
      expect(source).toContain("WorkspaceAssignmentField");
      expect(source).toContain("team_id");
    }
    expect(dataLayer).toContain("team_id: input.team_id || null");
  });
});
