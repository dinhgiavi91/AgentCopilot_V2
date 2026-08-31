import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const source = readFileSync("/home/ubuntu/upload/pasted_content_182.txt", "utf8").replace(/\r\n/g, "\n");
const jsonStart = source.indexOf('{\n  "principles"');
const jsonEnd = source.indexOf("\n\nPART 3:", jsonStart);
if (jsonStart < 0 || jsonEnd < 0) throw new Error("Không trích xuất được JSON V87.");
const curriculum = JSON.parse(source.slice(jsonStart, jsonEnd)) as {
  principles: Array<{ id: string; title: string; content: string; highlight_note: string; share_text: string }>;
  coaching_scripts: Array<{ prefix: string; title: string; tags: string[]; description: string; action_text: string; roleplay_prompt: string }>;
};
const seed = readFileSync(`${root}/supabase/seeds/20260827041000_v87_ultimate_leader_playbook_seed.sql`, "utf8");
const content = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const roleplayStudio = readFileSync(`${root}/client/src/components/BaoBoiStudio.tsx`, "utf8");

describe("V87 Ultimate Leader Playbook", () => {
  it("giữ nguyên bộ curriculum gồm 4 nguyên tắc và 10 kịch bản có metadata đầy đủ", () => {
    expect(curriculum.principles).toHaveLength(4);
    expect(curriculum.coaching_scripts).toHaveLength(10);
    expect(curriculum.principles.map((item) => item.id)).toEqual(["01", "02", "03", "04"]);
    expect(curriculum.principles.every((item) => item.share_text.trim().length > 20)).toBe(true);
    expect(curriculum.coaching_scripts.map((item) => item.prefix)).toEqual(Array.from({ length: 10 }, (_, index) => `CHẠM ${String(index + 1).padStart(2, "0")}`));
    expect(curriculum.coaching_scripts.every((item) => item.tags.length > 0 && item.roleplay_prompt.trim().length > 40)).toBe(true);
    expect(new Set(curriculum.coaching_scripts.flatMap((item) => item.tags))).toEqual(new Set(["Mất động lực", "Áp lực chỉ tiêu", "Khủng hoảng", "Kỹ năng yếu", "Mâu thuẫn", "Thiết lập mục tiêu", "Kiêu ngạo"]));
  });

  it("có seed giao dịch idempotent, chỉ thay V86/V87 đã audit và bảo toàn coaching log", () => {
    expect(seed).toContain("begin;");
    expect(seed).toContain("v86-leader-playbook-%");
    expect(seed).toContain("v87-leader-playbook-%");
    expect(seed).toContain("not exists (\n    select 1 from public.coaching_logs");
    expect(seed).toContain("on conflict (legacy_source_code) do update");
    expect(seed).toContain("commit;");
    for (let index = 1; index <= 14; index += 1) {
      expect(seed).toContain(`v87-leader-playbook-${String(index).padStart(2, "0")}`);
    }
  });

  it("nạp metadata live và giữ đầy đủ trigger hành vi cho filter, chia sẻ, Roleplay", () => {
    expect(content).toContain("share_text, roleplay_prompt");
    expect(content).toContain("prefix: item.prefix, topic: item.title");
    expect(content).toContain("share_text: item.share_text, roleplay_prompt: item.roleplay_prompt");
    expect(home).toContain('const coachingList = content.leadership.filter((item) => item.type === "coaching_script");');
    expect(home).toContain("setLeaderSituationFilter(tag)");
    expect(home).toContain("Đã copy thông điệp!");
    expect(home).toContain("📤 Gửi Team");
    expect(home).toContain("🎭 Luyện tập với AI");
    expect(home).toContain("ai_evaluation_rules: { roleplay_prompt: leaderRoleplayScript.roleplay_prompt ?? undefined }");
    expect(home).toContain("<AIRoleplayStudio playbook={leaderRoleplayCard}");
    expect(roleplayStudio).toContain("export function AIRoleplayStudio");
  });
});
