// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentProfileSettings, CORE_CAST_AVATARS } from "../client/src/components/AgentProfileSettings";

describe("AgentProfileSettings", () => {
  afterEach(() => cleanup());

  it("render Core Cast Visual DNA và lưu đúng danh xưng cùng nhân vật đã chọn", () => {
    const onSave = vi.fn();
    render(<AgentProfileSettings initialName="ĐINH VĨ" onClose={vi.fn()} onSave={onSave} />);

    expect(screen.getByRole("dialog", { name: "Người Đồng Hành" })).toBeTruthy();
    for (const character of CORE_CAST_AVATARS) expect(screen.getByAltText(character.name)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tải ảnh thật/i })).toBeTruthy();
    expect((screen.getByLabelText("Tên hiển thị / Danh xưng") as HTMLInputElement).value).toBe("ĐINH VĨ");

    fireEvent.change(screen.getByLabelText("Tên hiển thị / Danh xưng"), { target: { value: "Hải Đăng" } });
    fireEvent.click(screen.getByRole("button", { name: /Loyal Guardian/i }));
    fireEvent.click(screen.getByRole("button", { name: /Lưu lựa chọn/i }));

    expect(onSave).toHaveBeenCalledWith({
      displayName: "Hải Đăng",
      avatarId: "guardian",
      avatarUrl: CORE_CAST_AVATARS[3].url,
    });
  });

  it("đóng modal khi click backdrop nhưng không đóng khi click panel", () => {
    const onClose = vi.fn();
    render(<AgentProfileSettings initialName="ĐINH VĨ" onClose={onClose} onSave={vi.fn()} />);

    fireEvent.click(screen.getByText("Biệt đội Copilot Squad"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("dialog", { name: "Người Đồng Hành" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("đổi nổi bật Tính cách và quote theo nhân vật đang chọn", () => {
    render(<AgentProfileSettings initialName="ĐINH VĨ" onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByText(/Đáng tin cậy, rõ ràng/i)).toBeTruthy();
    expect(screen.getByText(/Tôi biết đường, hãy đi cùng tôi/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Chọn Wise Copilot" }));
    expect(screen.getByText(/Thông thái, bao quát, tầm nhìn xa/i)).toBeTruthy();
    expect(screen.getByText(/Để tôi giúp bạn nhìn xa hơn/i)).toBeTruthy();
    expect(screen.getByText(/Thông thái, bao quát, tầm nhìn xa/i).closest("section")?.className).toContain("bg-[#0E7490]");

    fireEvent.click(screen.getByRole("button", { name: "Chọn Nurturer" }));
    expect(screen.getByText(/Ấm áp, lắng nghe, thấu cảm/i)).toBeTruthy();
    expect(screen.getByText(/Tôi ở đây để lắng nghe và hỗ trợ bạn/i)).toBeTruthy();
  });
});
