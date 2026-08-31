import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const homePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const sprint9CssPath = new URL("../client/src/sprint9.css", import.meta.url);
const sprint9ModulesPath = new URL("../client/src/components/Sprint9Modules.tsx", import.meta.url);
const sprint11CrmPath = new URL("../client/src/components/Sprint11CrmModules.tsx", import.meta.url);
const leaderTargetPath = new URL("../client/src/components/LeaderTargetOverview.tsx", import.meta.url);
const leaderReportPath = new URL("../client/src/components/PilotStep4LeaderReport.tsx", import.meta.url);
const pilotRadarPath = new URL("../client/src/components/PilotStep2Modules.tsx", import.meta.url);
const leaderCommandCenterPath = new URL("../client/src/components/LeaderCommandCenter.tsx", import.meta.url);

describe("Sprint 9 social and leadership UI regression", () => {
  it("giữ Community Feed, Nhật Ký Zero-PII và các tương tác động viên", async () => {
    const [source, modules] = await Promise.all([readFile(homePath, "utf8"), readFile(sprint9ModulesPath, "utf8")]);
    for (const feature of [
      'id: "community"',
      "CommunityHub",
      "JournalFields",
      "validateJournalEntry",
      "Số XP muốn tặng",
      "sendGratitudeXp",
      "useXpReward",
    ]) expect(source).toContain(feature);
    for (const interaction of ["const react =", "const comment =", "Nhật Ký công khai đã vào Feed Cộng Đồng.", "Đã gửi một lời động viên tới đồng đội.", "community-gift"]) expect(modules).toContain(interaction);
  });

  it("áp dụng mục tiêu BHNT/PNT và cấp bậc vào phễu hành động", async () => {
    const source = await readFile(homePath, "utf8");
    for (const feature of [
      "targetBhnt",
      "targetPnt",
      "advisorRank",
      "calculateFlexibleTarget",
      "incomeMeetingPlan",
      "calculateIncomeMeetingPlan",
      "Mục tiêu BHNT",
      "Mục tiêu PNT",
    ]) expect(source).toContain(feature);
  });

  it("nối Leader Command Center theo role Leader và giữ các helper phân tích cũ", async () => {
    const [source, modules, targetOverview, commandCenter] = await Promise.all([readFile(homePath, "utf8"), readFile(sprint9ModulesPath, "utf8"), readFile(leaderTargetPath, "utf8"), readFile(leaderCommandCenterPath, "utf8")]);
    for (const feature of ["LeaderCommandCenter", "LeadershipMatrixRadar", "role === \"leader\"", "managerMode"]) expect(source).toContain(feature);
    for (const feature of ["getEmpathySuggestion", "buildDirectorSummary", "Xuất Báo Cáo GĐ"]) expect(modules).toContain(feature);
    expect(commandCenter).toContain("Radar Thấu Cảm & Hiệu Suất");
    expect(commandCenter).toContain("Ma Trận Hiệu Suất");
    expect(targetOverview).toContain("THIẾT LẬP MỤC TIÊU ĐỘI · DEMO");
  });

  it("giữ white-label Header và style contrast cho các modal mới", async () => {
    const [source, css] = await Promise.all([readFile(homePath, "utf8"), readFile(sprint9CssPath, "utf8")]);
    for (const feature of ["TeamNameEditor", "teamName", "team-brand-control", "Đổi tên Team", "event.stopPropagation"]) expect(source).toContain(feature);
    for (const rule of [".gratitude-modal", ".director-report", ".empathy-radar", ".xp-flyup", ".customer-journal-page", ".leader-target-overview"]) expect(css).toContain(rule);
  });

  it("giữ tab CRM Nhật Ký Khách Hàng với nguyên tắc Zero-PII và gợi ý nuôi dưỡng", async () => {
    const [source, modules] = await Promise.all([readFile(homePath, "utf8"), readFile(sprint11CrmPath, "utf8")]);
    for (const feature of ["customer_journal", "Sprint11CrmHub", "Nhật Ký Khách Hàng"]) expect(source).toContain(feature);
    for (const feature of ["CRM NUÔI DƯỠNG · ZERO-PII", "getNurtureSuggestion", "Hồ sơ nuôi dưỡng", "Đã hoàn thành chạm"]) expect(modules).toContain(feature);
  });

  it("giữ breakpoint mobile cho modal XP và bảng mục tiêu Leader", async () => {
    const css = await readFile(sprint9CssPath, "utf8");
    for (const rule of ["@media(max-width:760px){.gratitude-modal", "@media(max-width:760px){.leader-target-heading", ".leader-target-row{grid-template-columns:1fr 1fr", ".gratitude-modal{padding:24px 20px"]) expect(css).toContain(rule);
  });

  it("kể câu chuyện hành động cho Leader và hiển thị SOP Radar", async () => {
    const [report, radar] = await Promise.all([readFile(leaderReportPath, "utf8"), readFile(pilotRadarPath, "utf8")]);
    for (const label of ["Năng lượng Team (Nhịp đập)", "Báo động đỏ (Signal)", "Lần ra tay (Intervention)", "Quân số sống sót", "text-xs text-slate-500"]) expect(report).toContain(label);
    for (const instruction of ["📖 Cách dùng Radar", "Quét:", "Chạm:", "Ghi Nhận:", "<HelpCircle size={18} className=\"text-amber-700\" />"]) expect(radar).toContain(instruction);
  });
});
