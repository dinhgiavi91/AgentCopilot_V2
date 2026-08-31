// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sprint11CrmHub } from "../client/src/components/Sprint11CrmModules";
import { fetchCrmNurtureScenario } from "../client/src/lib/supabaseContent";

vi.mock("../client/src/lib/supabaseContent", () => ({ fetchCrmNurtureScenario: vi.fn() }));

describe("Sprint 11 Phase 3 Calendar Follow-up", () => {
  afterEach(() => cleanup());
  beforeEach(() => {
    vi.mocked(fetchCrmNurtureScenario).mockResolvedValue({ id: "scenario-other", stage: "pre_sale", context: "other", title: "Lắng nghe để chọn bước kế tiếp", emotionalTouch: "Dùng một câu hỏi mở để hiểu bối cảnh.", actionPersuasion: "Đề xuất một bước hỗ trợ ngắn và tự nguyện.", longTermNote: "Chỉ đặt follow-up khi đã chốt thời điểm phù hợp.", quickLinkView: "empathy", followUpDays: 7 });
  });

  it("tạo, sắp xếp và hoàn tất follow-up mà Calendar chỉ hiện dữ liệu Zero-PII", async () => {
    const user = userEvent.setup();
    render(<Sprint11CrmHub onToast={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText("Bối cảnh chăm sóc"), "other");
    await user.type(screen.getByPlaceholderText(/Đã gửi checklist chuẩn bị tài chính/), "Đã gửi một ghi chú chăm sóc không định danh.");
    fireEvent.change(screen.getByLabelText(/Ngày Follow-up/), { target: { value: "2026-08-25" } });
    await user.click(screen.getByRole("button", { name: /Tạo Nhật Ký chăm sóc/ }));

    const calendar = screen.getByRole("region", { name: "Lịch Follow-up Zero-PII" });
    expect(within(calendar).getByText("25/08/2026")).toBeTruthy();
    expect(Array.from(calendar.querySelectorAll("time")).map((item) => item.textContent)).toEqual(["25/08/2026"]);
    expect(calendar.textContent).not.toContain("ghi chú chăm sóc");
    expect(calendar.textContent).not.toMatch(/\b\d{9,}\b|@/);

    const newRecord = screen.getAllByText("Hồ sơ nuôi dưỡng #01").find((node) => node.closest("tr"));
    expect(newRecord).toBeTruthy();
    const recordRow = newRecord?.closest("tr");
    expect(recordRow).toBeTruthy();
    await user.click(within(recordRow as HTMLElement).getByRole("button", { name: /Đã hoàn thành chạm/ }));
    expect(within(calendar).queryByText("25/08/2026")).toBeNull();
  });
});
