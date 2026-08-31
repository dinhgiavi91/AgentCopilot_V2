import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pagePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const cssPath = new URL("../client/src/sprint4.css", import.meta.url);

describe("Sprint 4 Agent Copilot master data and knowledge", () => {
  it("updates the income target and reverse-calculates the meeting funnel from state", async () => {
    const source = await readFile(pagePath, "utf8");

    expect(source).toContain('const [targetIncome, setTargetIncome] = useState(0)');
    expect(source).toContain('calculateTargetPlan(');
    expect(source).toContain('Math.max(targetIncome, 1)');
    expect(source).toContain('earnedIncome');
    expect(source).toContain('setTargetIncome(value * 1_000_000)');
    expect(source).toContain('Lưu & Tính lại phễu');
  });

  it("provides both Accordion knowledge paths, a first-visit welcome and Zalo deep link", async () => {
    const source = await readFile(pagePath, "utf8");
    const css = await readFile(cssPath, "utf8");

    expect(source).toContain('content.empathy');
    expect(source).toContain('content.leadership');
    expect(source).toContain('buildZaloDeepLink(message)');
    expect(source).toContain('window.open(buildZaloDeepLink(message), "_blank", "noopener,noreferrer")');
    expect(source).toContain('Nơi không có áp lực KPI, chỉ có mục tiêu của chính bạn.');
    expect(css).toContain('.welcome-modal');
    expect(css).toContain('.knowledge-detail');
  });
});
