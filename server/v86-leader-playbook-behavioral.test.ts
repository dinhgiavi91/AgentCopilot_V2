import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const source = readFileSync("/home/ubuntu/upload/pasted_content_181.txt", "utf8").replace(/\r\n/g, "\n");
const payload = source.match(/\{\n  "principles"[\s\S]*?\n\}/)?.[0];
if (!payload) throw new Error("Không trích xuất được JSON V86.");
const curriculum = JSON.parse(payload) as {
  principles: Array<{ title: string; share_text: string }>;
  coaching_scripts: Array<{ title: string; tags: string[]; roleplay_prompt: string }>;
};
const migration = readFileSync(`${root}/supabase/migrations/20260827040000_v86_leader_playbook_behavioral_metadata.sql`, "utf8");
const seed = readFileSync(`${root}/supabase/seeds/20260827040010_v86_leader_playbook_behavioral_seed.sql`, "utf8");
const content = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const roleplayStudio = readFileSync(`${root}/client/src/components/BaoBoiStudio.tsx`, "utf8");

describe("V86 behavioral Leader Playbook", () => {
  it("bảo toàn chính xác hai nguyên tắc và ba kịch bản có dữ liệu hành vi", () => {
    expect(curriculum.principles).toHaveLength(2);
    expect(curriculum.coaching_scripts).toHaveLength(3);
    expect(curriculum.principles.every((item) => item.share_text.startsWith("Gửi team:"))).toBe(true);
    expect(curriculum.coaching_scripts.map((item) => item.tags[0])).toEqual(["Mất động lực", "Áp lực chỉ tiêu", "Mâu thuẫn"]);
    expect(curriculum.coaching_scripts.every((item) => item.roleplay_prompt.length > 40)).toBe(true);
  });

  it("có migration và seed idempotent chỉ thay thế dữ liệu mẫu đã audit", () => {
    expect(migration).toContain("add column if not exists share_text text");
    expect(migration).toContain("add column if not exists roleplay_prompt text");
    expect(seed).toContain("delete from public.leader_playbook as playbook");
    expect(seed).toContain("not exists (\n    select 1 from public.coaching_logs");
    expect(seed).toContain("on conflict (legacy_source_code) do update");
    for (const code of ["v86-leader-playbook-01", "v86-leader-playbook-02", "v86-leader-playbook-03", "v86-leader-playbook-04", "v86-leader-playbook-05"]) {
      expect(seed).toContain(code);
    }
  });

  it("tải metadata từ Supabase, cho gửi Team và mở Studio theo prompt từng card", () => {
    expect(content).toContain("share_text, roleplay_prompt");
    expect(home).toContain("Đã copy thông điệp!");
    expect(home).toContain("📤 Gửi Team");
    expect(home).toContain("🎭 Luyện tập với AI");
    expect(home).toContain("ai_evaluation_rules: { roleplay_prompt: leaderRoleplayScript.roleplay_prompt ?? undefined }");
    expect(home).toContain("<AIRoleplayStudio playbook={leaderRoleplayCard}");
    expect(roleplayStudio).toContain("export function AIRoleplayStudio");
  });
});
