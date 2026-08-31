import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pagePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const cssPath = new URL("../client/src/sprint2.css", import.meta.url);

describe("Sprint 2 Agent Copilot UI", () => {
  it("contains routed command views backed by the Supabase Content Library", async () => {
    const source = await readFile(pagePath, "utf8");

    expect(source).toContain("type View =");
    for (const route of ["profile", "playbook", "radar", "marketing", "empathy", "leader"]) expect(source).toContain(`| "${route}"`);
    expect(source).toContain('"founder"');
    expect(source).toContain('window.history.pushState');
    expect(source).toContain('fetchContentLibrary');
    expect(source).toContain('playbooks={content.playbooks}');
    expect(source).toContain('MarketingStudio');
    expect(source).toContain('LeaderCommandCenter');
    expect(source).toContain('FounderPilotOverview');
  });

  it("applies Navy/Gold high-energy card, progress and mobile responsive styling", async () => {
    const css = await readFile(cssPath, "utf8");

    expect(css).toContain('.sprint-two-app .command-sidebar{background:#1A365D');
    expect(css).toContain('linear-gradient(90deg,#F59E0B 0%,#F97316 54%,#E11D48 100%)');
    expect(css).toContain('.flashcard-scene.is-flipped .flashcard{transform:rotateY(180deg)}');
    expect(css).toContain('.coffee-cta');
    expect(css).toContain('@media(max-width:600px)');
  });
});
