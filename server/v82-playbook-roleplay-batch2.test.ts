import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildAiRoleplayPayload, canAccessPlaybookLevel } from "../client/src/components/BaoBoiStudio";

const source = readFileSync("/home/ubuntu/upload/pasted_content_179.txt", "utf8").replace(/\r\n/g, "\n");
const startMarker = "THE JSON DATA:\n";
const endMarker = "\n\n2. RBAC FILTERING REMINDER:";
const curriculum = JSON.parse(source.slice(source.indexOf(startMarker) + startMarker.length, source.indexOf(endMarker)).trim());
const seed = readFileSync(new URL("../supabase/seeds/20260827031000_v82_playbook_curriculum_batch2.sql", import.meta.url), "utf8");
const contentClient = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const rlsMigration = readFileSync(new URL("../supabase/migrations/20260827013000_v77_playbook_leader_rbac.sql", import.meta.url), "utf8");

describe("V82 Playbook & Roleplay batch 2", () => {
  it("giữ đúng năm scenario, năm bước Iceberg và một thẻ Leader", () => {
    expect(curriculum).toHaveLength(5);
    expect(curriculum.filter((item: { level: string }) => item.level === "Leader")).toHaveLength(1);
    expect(curriculum.every((item: { iceberg_steps: Record<string, string> }) => Object.keys(item.iceberg_steps).sort().join(",") === "step_1_tinh_huong,step_2_insight,step_3_goc_nhin,step_4_logic,step_5_kich_ban")).toBe(true);
    expect(curriculum.every((item: { roleplay_prompt: string }) => item.roleplay_prompt.trim().length > 0)).toBe(true);
  });

  it("dùng upsert append-only ổn định cho năm code V82 và lưu prompt vào JSONB", () => {
    for (const code of ["v82-playbook-01", "v82-playbook-02", "v82-playbook-03", "v82-playbook-04", "v82-playbook-05"]) expect(seed).toContain(code);
    expect(seed).toContain("on conflict (code) do update set");
    expect(seed).toContain("v82_embedded_iceberg");
    expect(seed).toContain("roleplay_prompt");
    expect(seed).not.toContain("delete from public.playbook_cards");
  });

  it("nạp ai_evaluation_rules từ Supabase và dùng roleplay_prompt làm system prompt an toàn", () => {
    expect(contentClient).toContain("ai_evaluation_rules");
    const payload = buildAiRoleplayPayload({
      code: "v82-playbook-01",
      team_id: null,
      skill_system: "Xử lý Từ chối & Chốt Sales",
      required_level: "Pro",
      situation: "Kỹ thuật Neo Giá trong Đàm Phán",
      customer_insight: "Khách hàng bị ảnh hưởng bởi mỏ neo.",
      mindset: "Giữ giá trị.",
      core_logic: "Đưa gói đầy đủ trước.",
      coaching_prompts: "Đề xuất phương án phù hợp.",
      ai_evaluation_rules: { roleplay_prompt: "Đóng vai khách hàng VIP cứng rắn và chấm lập luận logic." },
      is_pro: true,
      sort_order: 184,
    }, "Tôi sẽ làm rõ giá trị bảo vệ trước khi đề xuất phương án.");
    expect(payload.system_prompt).toContain("Đóng vai khách hàng VIP cứng rắn");
    expect(payload.system_prompt).toContain("không suy luận, yêu cầu hoặc lưu dữ liệu định danh khách hàng");
  });

  it("duy trì chặn đa tầng cho thẻ Leader trong khi các cấp Rookie/Pro vẫn sẵn sàng", () => {
    expect(canAccessPlaybookLevel("Leader", "advisor")).toBe(false);
    expect(canAccessPlaybookLevel("Leader", "leader")).toBe(true);
    expect(canAccessPlaybookLevel("Leader", "super_admin")).toBe(true);
    expect(canAccessPlaybookLevel("Rookie", "advisor")).toBe(true);
    expect(canAccessPlaybookLevel("Pro", "advisor")).toBe(true);
    expect(rlsMigration).toContain("profiles.role in ('leader', 'super_admin')");
  });
});
