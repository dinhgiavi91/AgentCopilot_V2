import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const compass = readFileSync(new URL("../client/src/components/Sprint11LeaderModules.tsx", import.meta.url), "utf8");

describe("V89 strict Leader Playbook React renderer", () => {
  it("tạo hai danh sách type-safe trước khi render từng tab", () => {
    expect(compass).toContain('const principlesList = data.filter((item) => item.type === "principle");');
    expect(compass).toContain('const coachingList = data.filter((item) => item.type === "coaching_script");');
    expect(compass).toContain('const visibleItems = tab === "principle" ? principlesList : filteredCoachingList;');
    expect(compass).toContain('data-leader-principles="accordion"');
    expect(compass).toContain('data-leader-coaching="card-grid"');
  });

  it("nối Tab Nguyên tắc của component thực tế vào route La Bàn", () => {
    expect(compass).toContain('tab === "principle" ? (');
    expect(compass).toContain('data-leader-principles="accordion"');
    expect(home).toContain("<Sprint11LeaderCompass");
  });

  it("đặt pills trên Card Grid coaching và truyền prompt riêng vào Roleplay", () => {
    expect(compass).toContain('const filteredCoachingList = coachingList.filter((item) => selectedTag === "all"');
    expect(compass).toContain('tab === "principle" ? (');
    expect(compass).toContain('filteredCoachingList.map((item) => <article');
    expect(compass).toContain('onClick={() => onOpenRoleplay(item)}');
    expect(compass).toContain("🎭 Luyện tập với AI");
    expect(home).toContain("onOpenRoleplay={openLeaderRoleplay}");
    expect(home).toContain("{leaderRoleplayCard && <AIRoleplayStudio");
    expect(home).toContain('ai_evaluation_rules: { roleplay_prompt: leaderRoleplayScript.roleplay_prompt ?? undefined }');
  });
});
