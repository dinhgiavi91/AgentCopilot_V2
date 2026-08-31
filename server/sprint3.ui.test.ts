import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pagePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const baoBoiStudioPath = new URL("../client/src/components/BaoBoiStudio.tsx", import.meta.url);
const cssPath = new URL("../client/src/sprint3.css", import.meta.url);

describe("Sprint 3 Agent Copilot hook and gating", () => {
  it("keeps the FREE/PRO model while sourcing Playbook and Marketing from Supabase", async () => {
    const [source, studio] = await Promise.all([readFile(pagePath, "utf8"), readFile(baoBoiStudioPath, "utf8")]);

    expect(source).toContain('const userRole: UserRole = managerMode || pilotManager ? "PRO" : "FREE"');
    expect(studio).toContain('userRole === "FREE" && playbook.is_pro');
    expect(source).toContain('playbooks={content.playbooks}');
    expect(source).toContain('<MarketingStudio session={pilotSession} templates={content.marketing} />');
  });

  it("gates Radar theo Pilot role và PRO Playbooks while exposing Marketing 1-Chạm", async () => {
    const [source, studio] = await Promise.all([readFile(pagePath, "utf8"), readFile(baoBoiStudioPath, "utf8")]);
    const css = await readFile(cssPath, "utf8");

    expect(source).toContain('Radar Lãnh Đạo chưa áp dụng cho TVV.');
    expect(source).toContain('LeaderCommandCenter');
    expect(studio).toContain('is-pro-locked');
    expect(source).toContain('Marketing 1-Chạm');
    expect(source).toContain('MarketingStudio');
    expect(css).toContain('.pro-gate');
    expect(css).toContain('.radar-locked-zone{filter:blur(6px)');
    expect(css).toContain('.marketing-grid');
  });
});
