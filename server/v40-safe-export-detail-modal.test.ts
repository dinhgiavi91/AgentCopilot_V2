import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const home = readFileSync(`${root}/client/src/pages/Home.tsx`, "utf8");
const card = readFileSync(`${root}/client/src/components/AgentMomentCard.tsx`, "utf8");
const dictionary = readFileSync(`${root}/client/src/components/TroLyThamDinh.tsx`, "utf8");
const css = readFileSync(`${root}/client/src/index.css`, "utf8");

describe("V40 Safe Export and mobile master-detail", () => {
  it("keeps Agent Moment capture static and excludes decorative blur/overlay nodes", () => {
    for (const marker of [
      "data-export-target=\"agent-moment\"",
      "min-h-[560px]",
      "data-export-ignore=\"true\"",
      "data-export-decoration=\"true\"",
      "pixelRatio: Math.min",
      "filter: (node) => !(node instanceof Element",
      "position: \"relative\"",
      "boxShadow: \"none\"",
    ]) expect(`${card}\n${home}`).toContain(marker);
  });

  it("opens selected dictionary details in a keyboard-accessible mobile/tablet dialog with a close action", () => {
    for (const marker of [
      "const [mobileDetailOpen, setMobileDetailOpen] = useState(false)",
      "window.matchMedia(\"(max-width: 1023px)\").matches",
      "role=\"dialog\"",
      "aria-modal=\"true\"",
      "Đóng chi tiết Từ điển",
      "lg:hidden",
      "lg:flex-row",
    ]) expect(dictionary).toContain(marker);
    expect(css).toContain(".dictionary-master-detail > section:last-child { display: none; }");
  });
});
