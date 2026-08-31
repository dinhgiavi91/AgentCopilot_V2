import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "/home/ubuntu/bhnt-learning-hub-research";
const source = readFileSync("/home/ubuntu/upload/pasted_content_183.txt", "utf8").replace(/\r\n/g, "\n");
const jsonStart = source.indexOf("[\n  {");
const jsonEnd = source.indexOf("\n\nPART 2:", jsonStart);
if (jsonStart < 0 || jsonEnd < 0) throw new Error("Không trích xuất được flat JSON V88.");
const curriculum = JSON.parse(source.slice(jsonStart, jsonEnd)) as Array<{
  type: "principle" | "coaching_script";
  prefix: string;
  title: string;
  description: string;
  action_text: string;
  tags?: string[];
  share_text?: string;
  roleplay_prompt?: string;
}>;
const migration = readFileSync(`${root}/supabase/migrations/20260827042000_v88_flat_leader_playbook_types.sql`, "utf8");
const seed = readFileSync(`${root}/supabase/seeds/20260827042100_v88_flat_leader_playbook_seed.sql`, "utf8");
const content = readFileSync(`${root}/client/src/lib/supabaseContent.ts`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const cms = readFileSync(`${root}/client/src/components/InPlaceContentAdmin.tsx`, "utf8");

describe("V88 flat Leader Playbook mapping", () => {
  it("giữ nguyên mảng phẳng sáu bản ghi với type, prefix và metadata phân biệt tuyệt đối", () => {
    expect(curriculum).toHaveLength(6);
    expect(curriculum.filter((item) => item.type === "principle")).toHaveLength(2);
    expect(curriculum.filter((item) => item.type === "coaching_script")).toHaveLength(4);
    expect(curriculum.filter((item) => item.type === "principle").map((item) => item.prefix)).toEqual(["01", "02"]);
    expect(curriculum.filter((item) => item.type === "coaching_script").map((item) => item.prefix)).toEqual(["CHẠM 01", "CHẠM 02", "CHẠM 03", "CHẠM 04"]);
    expect(curriculum.filter((item) => item.type === "principle").every((item) => Boolean(item.share_text))).toBe(true);
    expect(curriculum.filter((item) => item.type === "coaching_script").every((item) => Boolean(item.roleplay_prompt) && (item.tags?.length ?? 0) > 0)).toBe(true);
  });

  it("mở rộng schema cho prefix/coaching_script và seed clear bảng theo chỉ định", () => {
    expect(migration).toContain("add column if not exists prefix text");
    expect(migration).toContain("set type = 'coaching_script'");
    expect(migration).toContain("type in ('principle', 'coaching_script')");
    expect(seed).toContain("delete from public.leader_playbook;");
    expect(seed).toContain("insert into public.leader_playbook (type, prefix");
    expect(seed).toContain("'coaching_script'");
    for (let index = 1; index <= 6; index += 1) expect(seed).toContain(`v88-leader-playbook-${String(index).padStart(2, "0")}`);
  });

  it("lọc dữ liệu theo type trước khi map đúng tab và đưa behavioral UX vào đúng vị trí", () => {
    expect(content).toContain('type: "principle" | "coaching_script"');
    expect(content).toContain('select("id, type, prefix, title, content, note, tags, share_text, roleplay_prompt, mini_quiz, learning_carousel, created_at")');
    expect(content).toContain('const type = input.type === "coaching_script" ? "coaching_script" : "principle";');
    expect(cms).toContain('value: "coaching_script", label: "Kịch bản Coaching"');
    expect(cms).toContain('key: "prefix", label: "Mã hiển thị"');
    expect(home).toContain('const principlesList = content.leadership.filter((item) => item.type === "principle");');
    expect(home).toContain('const coachingList = content.leadership.filter((item) => item.type === "coaching_script");');
    expect(home).toContain('const filteredCoachingList = coachingList.filter((item) => leaderSituationFilter === "all"');
    expect(home).toContain('data-leader-principles="accordion"');
    expect(home).toContain('data-leader-coaching="card-grid"');
    expect(home).toContain("Đã copy thông điệp!");
    expect(home).toContain("📤 Gửi Team");
    expect(home).toContain("🎭 Luyện tập với AI");
    expect(home).toContain("ai_evaluation_rules: { roleplay_prompt: leaderRoleplayScript.roleplay_prompt ?? undefined }");
  });
});
