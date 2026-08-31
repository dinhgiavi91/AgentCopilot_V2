import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canAccessPlaybookLevel } from "../client/src/components/BaoBoiStudio";

const curriculum = JSON.parse(readFileSync("/home/ubuntu/upload/pasted_content_175.txt", "utf8"));
const seed = readFileSync(new URL("../supabase/seeds/20260827010000_v77_playbook_curriculum.sql", import.meta.url), "utf8");
const rlsMigration = readFileSync(new URL("../supabase/migrations/20260827013000_v77_playbook_leader_rbac.sql", import.meta.url), "utf8");

describe("V77 Playbook data injection and role-based filtering", () => {
  it("xác thực năm scenario và phân loại đúng hai thẻ Leader-only", () => {
    expect(curriculum).toHaveLength(5);
    expect(curriculum.filter((card: { level: string }) => card.level === "Leader")).toHaveLength(2);
    expect(curriculum.filter((card: { level: string }) => card.level !== "Leader")).toHaveLength(3);
    expect(seed).toContain("v77-playbook-01");
    expect(seed).toContain("v77-playbook-05");
    expect(seed).toContain("on conflict (code) do update set");
  });

  it("chỉ mở thẻ Leader cho role leader và super_admin, đồng thời giữ cấp phổ thông cho advisor", () => {
    expect(canAccessPlaybookLevel("Leader", "advisor")).toBe(false);
    expect(canAccessPlaybookLevel("Leader", "leader")).toBe(true);
    expect(canAccessPlaybookLevel("Leader", "super_admin")).toBe(true);
    expect(canAccessPlaybookLevel("Rookie", "advisor")).toBe(true);
    expect(canAccessPlaybookLevel("Pro", "advisor")).toBe(true);
    expect(canAccessPlaybookLevel("Master", "advisor")).toBe(true);
  });

  it("giữ RLS là lớp bảo vệ chính và client filter là defense-in-depth", () => {
    expect(rlsMigration).toContain("coalesce(lower(required_level), 'rookie') <> 'leader'");
    expect(rlsMigration).toContain("profiles.role in ('leader', 'super_admin')");
    expect(rlsMigration).toContain("create policy \"content_library_read_playbook\"");
  });
});
