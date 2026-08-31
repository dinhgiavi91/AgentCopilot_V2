import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const globalCss = readFileSync(`${root}/client/src/index.css`, "utf8");
const roleplay = readFileSync(`${root}/client/src/components/BaoBoiStudio.tsx`, "utf8");
const oracle = readFileSync(`${root}/client/src/components/LeaderWeeklyOracle.tsx`, "utf8");
const marketing = readFileSync(`${root}/client/src/components/Sprint10VideoModules.tsx`, "utf8");
const dictionary = readFileSync(`${root}/client/src/components/TroLyThamDinh.tsx`, "utf8");
const dock = readFileSync(`${root}/client/src/components/FloatingGamificationDock.tsx`, "utf8");

describe("V39 Omnichannel Assistant — responsive and visual safety", () => {
  it("keeps floating actions below modal overlays and gives keyboard-safe modal containers scroll behavior", () => {
    expect(globalCss).toContain(".fab-log { z-index: 40 !important; }");
    expect(globalCss).toContain(".store-backdrop, .sprint6-backdrop, .roleplay-backdrop, .log-sheet-backdrop { z-index: 50 !important;");
    expect(globalCss).toContain("max-height: min(90vh, 780px)");
    expect(globalCss).toContain("@media (min-width: 761px) and (max-width: 1023px)");
    expect(globalCss).toContain(".command-main { padding-left: 0 !important; padding-bottom: 66px !important; }");
    expect(dock).toContain("z-40");
  });

  it("stacks AI Roleplay and dictionary detail flows until the desktop breakpoint", () => {
    for (const marker of ["flex-col overflow-y-auto bg-slate-50 lg:flex-row", "lg:w-5/12", "lg:w-7/12", "fixed inset-0 z-[100]", "max-h-[90vh]"]) expect(roleplay).toContain(marker);
    for (const marker of ["flex flex-col gap-6 lg:flex-row", "lg:w-[42%]", "lg:w-[58%]", "grid grid-cols-1 gap-4 lg:grid-cols-2"]) expect(dictionary).toContain(marker);
  });

  it("isolates both Tarot faces during the 3D flip", () => {
    expect(oracle).toContain("tarot-card-3d");
    expect(oracle).toContain("tarot-card-face");
    expect(globalCss).toContain("backface-visibility: hidden");
    expect(globalCss).toContain("transform-style: preserve-3d");
  });

  it("uses deterministic local gradients for preview and canvas export rather than remote template images", () => {
    for (const marker of ["MARKETING_GRADIENTS", "getMarketingGradient", "const width = 800", "context.createLinearGradient", "selectedBg?.code"]) expect(marketing).toContain(marker);
    expect(marketing).not.toContain("const sourceUrl = getExportUrl(selectedBg.image_url)");
    expect(marketing).not.toContain("context.drawImage(background, 0, 0, width, height)");
  });
});
