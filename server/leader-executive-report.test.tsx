// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LeaderExecutiveReport, { generateCopilotInsights } from "../client/src/components/LeaderExecutiveReport";
import { fetchExecutivePerformanceReport, fetchPilotSignals, fetchTeamRecoveryWatchlist } from "../client/src/lib/supabaseContent";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("../client/src/lib/supabaseContent", () => ({ fetchExecutivePerformanceReport: vi.fn(), fetchPilotSignals: vi.fn(), fetchTeamRecoveryWatchlist: vi.fn() }));

afterEach(() => cleanup());

describe("LeaderExecutiveReport", () => {
  beforeEach(() => {
    vi.mocked(fetchExecutivePerformanceReport).mockResolvedValue({
      teamName: "Team Alpha",
      rangeStart: "2026-08-14T00:00:00.000Z",
      rangeEnd: "2026-08-21T00:00:00.000Z",
      totalActivity: 18,
      leaderInterventions: 3,
      totalSelfReportedRevenue: 12000000,
      teamMoraleScore: 78,
      rows: [{ userId: "advisor-1", displayName: "TVV A", activityCount: 8, pillars: { learn: 2, engage: 3, execute: 3 }, moraleScore: 78, observedStreak: 3, coachingCount: 1, selfReportedRevenue: 12000000, status: "positive" }],
    });
    vi.mocked(fetchTeamRecoveryWatchlist).mockResolvedValue({ totalInterventions: 3, recoveredCount: 1, measurableOutcomes: 2, recoveryRate: 50, items: [] });
    vi.mocked(fetchPilotSignals).mockResolvedValue([]);
  });

  it("xuất PDF nhiều trang từ PNG html-to-image", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/LeaderExecutiveReport.tsx"), "utf8");
    for (const token of ["import { toPng } from \"html-to-image\";", "import { jsPDF } from \"jspdf\";", "const handleDownloadPDF = async", "document.getElementById(\"leader-report-container\")", "if (!target) {", "await toPng(target, { backgroundColor: \"#ffffff\", pixelRatio: 1, skipFonts: true })", "const pdf = new jsPDF(\"p\", \"mm\", \"a4\")", "const pageHeight = pdf.internal.pageSize.getHeight()", "pdf.getImageProperties(imageData)", "let heightLeft = imageHeight", "while (heightLeft > 0)", "position -= pageHeight", "pdf.addPage()", "pdf.addImage(imageData, \"PNG\"", "pdf.save(\"Bao_Cao_Leader.pdf\")", "console.error(\"PDF Export Crash:\", error)", "onClick={() => void handleDownloadPDF()}", "id=\"leader-report-container\"", "bg-white px-4"]) expect(source).toContain(token);
    expect(source).not.toContain("window.print()");
    expect(source).not.toContain("html2canvas");
    expect(source).not.toMatch(/\.at\(|structuredClone|\(\?<([=!])/);
  });

  it("trình bày KPI ROI, bảng tương quan và insight từ dữ liệu Team thật", async () => {
    render(<LeaderExecutiveReport isOpen={true} onClose={vi.fn()} hours={168} rangeLabel="Tuần này" onToast={vi.fn()} />);
    const dialog = await screen.findByRole("dialog", { name: "Báo cáo Hiệu suất Cấp cao" });
    expect(dialog).toBeTruthy();
    expect(dialog.className).toContain("min-h-screen");
    expect(dialog.className).toContain("w-full");
    expect(dialog.className).toContain("max-w-full");
    expect(dialog.className).toContain("flex-col");
    expect(dialog.className).toContain("md:w-auto");
    expect(dialog.className).toContain("md:flex-row");
    expect(dialog.className).toContain("max-md:!w-full");
    expect(dialog.className).toContain("max-md:!max-w-full");
    expect(dialog.className).toContain("max-md:!px-4");
    expect(screen.getByText(/Team Alpha/)).toBeTruthy();
    expect(screen.getAllByText("Tổng nỗ lực").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Chỉ số Động lực").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Leader hỗ trợ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Doanh số tự khai báo").length).toBeGreaterThan(0);
    expect(screen.getByText("TVV A")).toBeTruthy();
    expect(screen.getByText("Học tập · Gắn kết · Thực chiến")).toBeTruthy();
    expect(screen.getByText("Tham mưu Chiến lược từ Copilot")).toBeTruthy();
    expect(screen.getByText(/Nỗ lực Quản trị/i)).toBeTruthy();
    expect(screen.getByText(/Tỷ lệ chuyển đổi đang có tín hiệu tốt/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tải PDF/i })).toBeTruthy();
  });

  it("mở Từ điển đúng mục từ hai cột giải thích trong Báo cáo A4", async () => {
    render(<LeaderExecutiveReport isOpen={true} onClose={vi.fn()} hours={168} rangeLabel="Tuần này" onToast={vi.fn()} />);
    await screen.findByRole("dialog", { name: "Báo cáo Hiệu suất Cấp cao" });

    fireEvent.click(screen.getByRole("button", { name: "Giải thích Chỉ số Động lực" }));
    expect(screen.getByRole("dialog", { name: "Từ điển Tham mưu" })).toBeTruthy();
    expect(screen.getAllByText("Chỉ số Động lực").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Đóng Từ điển Tham mưu" }));
    fireEvent.click(screen.getByRole("button", { name: "Giải thích Cấu trúc Nhịp đập" }));
    expect(screen.getAllByText("Cấu trúc 3 Trụ Cột").length).toBeGreaterThan(0);
    expect(screen.getByText(/năng suất ảo/i)).toBeTruthy();
  });

  it("sinh cảnh báo năng suất ảo và rủi ro rớt nhịp từ dữ liệu Team", () => {
    const insights = generateCopilotInsights([{
      userId: "advisor-risk",
      displayName: "TVV Rủi ro",
      activityCount: 5,
      pillars: { learn: 3, engage: 2, execute: 0 },
      moraleScore: 20,
      observedStreak: 0,
      coachingCount: 0,
      selfReportedRevenue: 0,
      status: "false_productivity",
    }]);

    expect(insights.correlationText).toMatch(/Báo động đỏ/i);
    expect(insights.macroSummary.healthAlert).toBe(true);
    expect(insights.alerts.map((alert) => alert.title)).toEqual(expect.arrayContaining(["Năng suất ảo", "Rủi ro rớt nhịp"]));
  });
});
