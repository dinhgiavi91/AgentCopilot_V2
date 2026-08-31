import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const content = readFileSync("client/src/lib/supabaseContent.ts", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");

describe("V17 Content Library resilience", () => {
  it("đọc từng nguồn độc lập, không để một bảng Supabase làm hỏng toàn bộ thư viện", () => {
    expect(content).toContain("async function safeContentRead");
    expect(content).toContain("[Content Library] ${source} unavailable:");
    expect(content).toContain("const readErrors = Object.fromEntries");
    expect(content).toContain("readErrors,");
    expect(content).not.toContain("const error = [playbooks.error, empathy.error");
  });

  it("giữ fallback session và đọc đủ năm nguồn Content Library cần thiết", () => {
    for (const table of ["playbook_cards", "empathy_dictionary", "leader_playbook", "marketing_templates", "disc_questions", "news_90s", "case_studies"]) {
      expect(content).toContain(`supabase.from(\"${table}\")`);
    }
    expect(content).toContain("Không đọc được session; dùng dữ liệu công khai an toàn.");
  });

  it("hiển thị lỗi đúng tab và cho phép thử đồng bộ lại thay vì chặn mọi module", () => {
    expect(home).toContain("const retryContentLibrary = React.useCallback");
    expect(home).toContain("const contentSourceError = React.useCallback");
    expect(home).toContain("Thử đồng bộ lại");
    for (const source of ["playbooks", "marketing", "discQuestions", "news"]) {
      expect(home).toContain(`contentSourceError(\"${source}\")`);
    }
    expect(home).toContain('contentSourceError(isEmpathy ? "empathy" : "leadership")');
  });
});
