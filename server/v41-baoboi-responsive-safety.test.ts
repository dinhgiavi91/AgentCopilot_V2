import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const studio = readFileSync(`${root}/client/src/components/BaoBoiStudio.tsx`, "utf8");
const css = readFileSync(`${root}/client/src/sprint2.css`, "utf8");

describe("V45 Bảo Bối flip-card, master-detail and mobile detail safety", () => {
  it("uses flow-safe cards so copy and CTA cannot overlap at tablet widths", () => {
    for (const marker of [
      "w-full h-[300px]",
      "absolute inset-0 backface-hidden bg-white shadow-md rounded-2xl p-6 flex flex-col overflow-hidden",
      "min-height:300px",
      "height:auto",
      "overflow:hidden",
      ".card-content{position:relative;z-index:1;display:flex;min-height:0;flex:1;flex-direction:column",
      "margin-top:auto",
      "overflow-wrap:anywhere",
      "relative z-[99] pointer-events-auto cursor-pointer mt-auto flex",
    ]) expect(`${studio}\n${css}`).toContain(marker);
  });

  it("opens mobile cards through a guarded, closable detail modal above all application chrome", () => {
    for (const marker of [
      "function MobilePlaybookDetail",
      "if (!selectedItem) return null",
      "window.matchMedia(\"(max-width: 1023px)\").matches",
      "lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col w-full h-full",
      "flex items-center justify-between p-4 border-b bg-slate-50 flex-shrink-0",
      "✕ Đóng</button>",
      "flex-1 overflow-y-auto p-4 pb-28",
      "onClose={() => setSelectedItem(null)}",
    ]) expect(studio).toContain(marker);
  });

  it("uses strict desktop master-detail, but restores desktop and tablet flip-card interaction", () => {
    for (const marker of [
      "const [selectedItem, setSelectedItem]",
      "function DesktopPlaybookDetail",
      "if (!selectedItem) return null",
      "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full",
      "selectedItem ? <DesktopPlaybookDetail",
      "onPractice={setRoleplayItem}",
      "Xem toàn bộ",
      "group perspective-1000 w-full h-[300px]",
      "relative w-full h-full transition-transform duration-700 preserve-3d group-hover:rotate-y-180",
      "absolute inset-0 backface-hidden rotate-y-180 bg-slate-50 shadow-md rounded-2xl p-6 flex flex-col justify-between",
      "const [isFlipped, setIsFlipped] = useState(false)",
      ".flashcard-scene.group:hover .flashcard{transform:rotateY(180deg)}",
    ]) expect(`${studio}\n${css}`).toContain(marker);
  });

  it("keeps the Roleplay entry point wired from both detail surfaces", () => {
    for (const marker of [
      "function AIRoleplayStudio",
      "function isRoleplayPlaybook",
      "isRoleplayPlaybook(selectedItem) && <button",
      "Bắt đầu AI Roleplay",
      "onPractice(selectedItem)",
      "{roleplayItem && <AIRoleplayStudio playbook={roleplayItem}",
      "roleplay|kịch\\s*bản/i.test(roleplayContext)",
      "if (isRoleplayPlaybook(playbook)) setRoleplayItem(playbook);",
    ]) expect(studio).toContain(marker);
  });
});
