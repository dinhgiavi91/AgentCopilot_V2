import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canAccessPlaybookLevel } from "../client/src/components/BaoBoiStudio";

const source = readFileSync("/home/ubuntu/upload/pasted_content_177.txt", "utf8").replace(/\r\n/g, "\n");
const curriculumMatch = source.match(/\n\[\n[\s\S]*?\n\]\n\n2\. DATABASE INJECTION:/);
if (!curriculumMatch) throw new Error("Không tìm thấy mảng curriculum V80.");
const curriculum = JSON.parse(curriculumMatch[0].replace(/\n\n2\. DATABASE INJECTION:[\s\S]*$/, "").trim());
const seed = readFileSync(new URL("../supabase/migrations/20260827025000_v80_playbook_embedded_curriculum.sql", import.meta.url), "utf8");
const rlsMigration = readFileSync(new URL("../supabase/migrations/20260827013000_v77_playbook_leader_rbac.sql", import.meta.url), "utf8");

describe("V80 embedded Playbook curriculum and RBAC", () => {
  it("giữ nguyên bốn scenario nguồn, gồm hai thẻ Leader và đủ mô hình Iceberg", () => {
    expect(curriculum).toHaveLength(4);
    expect(curriculum.filter((card: { level: string }) => card.level === "Leader")).toHaveLength(2);
    expect(curriculum.map((card: { level: string }) => card.level)).toEqual(["Pro", "Leader", "Rookie", "Leader"]);
    for (const card of curriculum) {
      expect(card.roleplay_prompt).toEqual(expect.any(String));
      expect(card.iceberg_steps).toEqual(expect.objectContaining({
        step_1_tinh_huong: expect.any(String),
        step_2_insight: expect.any(String),
        step_3_goc_nhin: expect.any(String),
        step_4_logic: expect.any(String),
        step_5_kich_ban: expect.any(String),
      }));
    }
  });

  it("seed ánh xạ tương thích schema, bảo toàn JSON và an toàn khi chạy lại", () => {
    for (const code of ["v80-playbook-01", "v80-playbook-02", "v80-playbook-03", "v80-playbook-04"]) {
      expect(seed).toContain(code);
    }
    expect(seed).toContain("ai_evaluation_rules");
    expect(seed).toContain("'roleplay_prompt'");
    expect(seed).toContain("'iceberg_steps'");
    expect(seed).toContain("on conflict (code) do update set");
  });

  it("chặn advisor ở cả guard client và chính sách RLS, nhưng giữ quyền leader/super_admin", () => {
    expect(canAccessPlaybookLevel("Leader", "advisor")).toBe(false);
    expect(canAccessPlaybookLevel("Leader", "leader")).toBe(true);
    expect(canAccessPlaybookLevel("Leader", "super_admin")).toBe(true);
    expect(canAccessPlaybookLevel("Rookie", "advisor")).toBe(true);
    expect(canAccessPlaybookLevel("Pro", "advisor")).toBe(true);
    expect(canAccessPlaybookLevel("Master", "advisor")).toBe(true);
    expect(rlsMigration).toContain("coalesce(lower(required_level), 'rookie') <> 'leader'");
    expect(rlsMigration).toContain("profiles.role in ('leader', 'super_admin')");
  });
});
