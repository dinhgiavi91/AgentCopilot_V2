import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateLeadershipTraitResult, getLeadershipPracticePlaybookCode } from "../client/src/lib/leadershipTestLogic";

const source = readFileSync("/home/ubuntu/upload/pasted_content_178.txt", "utf8").replace(/\r\n/g, "\n");
const startMarker = "THE JSON DATA:\n";
const endMarker = "\n\n2. RESULT PAGE UI UPGRADE";
const seed = JSON.parse(source.slice(source.indexOf(startMarker) + startMarker.length, source.indexOf(endMarker)).trim());
const generatedSeed = readFileSync(new URL("../supabase/seeds/20260827030000_v81_master_leadership_test.sql", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../client/src/lib/supabaseContent.ts", import.meta.url), "utf8");
const studio = readFileSync(new URL("../client/src/components/BaoBoiStudio.tsx", import.meta.url), "utf8");

describe("V81 Master L.E.A.D Test and actionable cross-linking", () => {
  it("giữ chính xác 15 câu, id liên tiếp và bốn lựa chọn trait cho mỗi câu", () => {
    expect(seed.questions).toHaveLength(15);
    expect(seed.questions.map((question: { id: number }) => question.id)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
    seed.questions.forEach((question: { options: Array<{ trait: string }> }) => {
      expect(question.options).toHaveLength(4);
      expect(question.options.map((option) => option.trait).sort()).toEqual(["Architect", "Coach", "Nurturer", "Visionary"]);
    });
  });

  it("bảo toàn mô tả, góc khuất và hai gợi ý hành động của bốn phong cách", () => {
    for (const trait of ["Visionary", "Architect", "Nurturer", "Coach"] as const) {
      expect(seed.results[trait]).toEqual(expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        goc_khuat: expect.any(String),
        goi_y_bao_boi: expect.any(String),
        goi_y_roleplay: expect.any(String),
      }));
    }
    expect(generatedSeed).toContain("Master L.E.A.D Leadership Test (15 questions)");
    expect(generatedSeed).toContain("on conflict (test_key) do update set");
    expect(generatedSeed).toContain("leadership_style_description = test.results");
  });

  it("tính kết quả ổn định và ánh xạ từng phong cách tới thẻ thực hành đã được RLS bảo vệ", () => {
    expect(calculateLeadershipTraitResult(Array(15).fill("Coach"))).toBe("Coach");
    expect(calculateLeadershipTraitResult(["Architect", "Coach", "Architect"])).toBe("Architect");
    expect(getLeadershipPracticePlaybookCode("Visionary")).toBe("v80-playbook-02");
    expect(getLeadershipPracticePlaybookCode("Architect")).toBe("v80-playbook-04");
    expect(getLeadershipPracticePlaybookCode("Nurturer")).toBe("v80-playbook-04");
    expect(getLeadershipPracticePlaybookCode("Coach")).toBe("v80-playbook-01");
  });

  it("render Góc khuất và hai CTA, rồi thực thi trigger Bảo Bối/Roleplay qua guard dữ liệu hiện hữu", () => {
    expect(content).toContain("goc_khuat: string");
    expect(content).toContain("goi_y_bao_boi: string");
    expect(content).toContain("goi_y_roleplay: string");
    expect(home).toContain("Góc khuất cần lưu tâm");
    expect(home).toContain("Đọc Thẻ:");
    expect(home).toContain("Thực Hành:");
    expect(home).toContain('openView("playbook")');
    expect(home).toContain("leadershipLearningRequest");
    expect(studio).toContain("canAccessPlaybookLevel(playbook.required_level, session?.profile.role)");
    expect(studio).toContain("learningRequest.openRoleplay");
  });
});
