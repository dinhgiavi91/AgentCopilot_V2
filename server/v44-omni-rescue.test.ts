import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const studio = readFileSync(`${root}/client/src/components/BaoBoiStudio.tsx`, "utf8");
const marketing = readFileSync(`${root}/client/src/components/Sprint10VideoModules.tsx`, "utf8");
const report = readFileSync(`${root}/client/src/components/LeaderExecutiveReport.tsx`, "utf8");
const oracle = readFileSync(`${root}/client/src/components/LeaderWeeklyOracle.tsx`, "utf8");
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const css = readFileSync(`${root}/client/src/index.css`, "utf8");

describe("V44 Omni-Rescue cross-device contracts", () => {
  it("keeps Bảo Bối responsive grid, flip interaction, and a guarded full-screen mobile detail", () => {
    for (const marker of [
      "function DesktopPlaybookDetail",
      "if (!selectedItem) return null",
      "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full",
      "group-hover:rotate-y-180",
      "relative z-[99] pointer-events-auto cursor-pointer mt-auto flex",
      "lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col w-full h-full",
    ]) expect(studio).toContain(marker);
  });

  it("keeps UI thumbnails native while giving the dedicated export background its own CORS-safe image layer", () => {
    expect(marketing).toContain("template.image_url ? <img src={template.image_url}");
    expect(marketing).toContain('id="marketing-export-node"');
    expect(marketing).toContain('src={selectedTemplateImage} crossOrigin="anonymous"');
    for (const marker of ["import { toPng } from \"html-to-image\";", "import { jsPDF } from \"jspdf\";", "document.getElementById(\"leader-report-container\")", "await toPng(target, { backgroundColor: \"#ffffff\", pixelRatio: 1, skipFonts: true })", "const pageHeight = pdf.internal.pageSize.getHeight()", "pdf.getImageProperties(imageData)", "while (heightLeft > 0)", "pdf.addPage()", "pdf.addImage(imageData, \"PNG\"", "pdf.save(\"Bao_Cao_Leader.pdf\")"] ) expect(report).toContain(marker);
    expect(report).not.toContain("window.print()");
    expect(report).not.toContain("html2canvas");
  });

  it("retains Tarot face isolation and keeps the global FAB below modal layers", () => {
    for (const marker of ["tarot-card-face", "backface-visibility: hidden", "bg-[#0f172a]", "bg-slate-950"]) expect(`${oracle}\n${css}`).toContain(marker);
    expect(home).toContain("className=\"fab-log cta-glow fixed bottom-6 right-6 z-40\"");
    expect(css).toContain(".fab-log { z-index: 40 !important; }");
  });
});
