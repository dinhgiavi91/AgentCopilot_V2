import { describe, expect, it } from "vitest";
import { canViewTeamScopedContent, filterTeamScopedContent } from "../client/src/lib/contentScope";

const content = [
  { code: "GLOBAL", team_id: null },
  { code: "TEAM_A", team_id: "team-a" },
  { code: "TEAM_B", team_id: "team-b" },
];

describe("Shared Global/Local content access", () => {
  it("cho phép TVV, Leader và Super Admin mở hai vùng nội dung", () => {
    expect(canViewTeamScopedContent("advisor")).toBe(true);
    expect(canViewTeamScopedContent("leader")).toBe(true);
    expect(canViewTeamScopedContent("super_admin")).toBe(true);
    expect(canViewTeamScopedContent("guest")).toBe(false);
  });

  it("tách Global và Local theo primary team, không trả chéo workspace", () => {
    expect(filterTeamScopedContent(content, "GLOBAL", "team-a").map((item) => item.code)).toEqual(["GLOBAL"]);
    expect(filterTeamScopedContent(content, "LOCAL", "team-a").map((item) => item.code)).toEqual(["TEAM_A"]);
    expect(filterTeamScopedContent(content, "LOCAL", null)).toEqual([]);
  });
});
