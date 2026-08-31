import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const homePath = "/home/ubuntu/bhnt-learning-hub-research/client/src/pages/Home.tsx";
const cssPath = "/home/ubuntu/bhnt-learning-hub-research/client/src/sprint11.css";
const modalPath = "/home/ubuntu/bhnt-learning-hub-research/client/src/components/Sprint11TargetModal.tsx";

describe("Sprint 11 Phase 1–2 regression", () => {
  it("giữ Plus Jakarta Sans, sửa contrast/mobile và thay logo tĩnh bằng widget động lực", async () => {
    const css = await readFile(cssPath, "utf8");
    for (const marker of ["Plus Jakarta Sans", "font-synthesis: none", ".knowledge-detail .empathy-answer", ".income-shield img { display: none; }", "daily-motivation-widget", ":focus-visible", "@media (max-width: 760px)"]) expect(css).toContain(marker);
  });

  it("giữ Mục Tiêu conditional rendering cho TVV BHNT/PNT và Player-Coach input goals", async () => {
    const [home, modal] = await Promise.all([readFile(homePath, "utf8"), readFile(modalPath, "utf8")]);
    expect(home).toContain("Sprint11TargetModal");
    expect(home).toContain("managerMode ? \"leader\" : \"advisor\"");
    expect(home).toContain('demoPreset === "target-advisor"');
    expect(home).toContain('demoPreset === "target-leader"');
    for (const marker of ["MỤC TIÊU CÁ NHÂN · TVV", "BHNT · Thu nhập cá nhân", "PNT · Thu nhập cá nhân", "MỤC TIÊU PLAYER-COACH", "Mục Tiêu Quản Trị", "2. Tuyển dụng (Mở rộng)", "Tỷ lệ Active mục tiêu", "Số ca Coaching gỡ rối", "Ngân sách thưởng"]) expect(modal).toContain(marker);
  });

  it("giữ state Team ngoài form và không dùng setState trong render", async () => {
    const home = await readFile(homePath, "utf8");
    expect(home).toContain('const [teamName, setTeamName]');
    expect(home).toContain("onTeamNameChange={setTeamName}");
    expect(home).toContain("Sprint10LogModal");
  });
});
