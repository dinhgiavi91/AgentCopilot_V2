// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentMomentCard, type AgentMomentCardProps } from "../client/src/components/AgentMomentCard";
import { AGENT_MOMENT_ASSETS } from "../client/src/components/agentMomentAssets";

const baseProps: AgentMomentCardProps = {
  bgAssetUrl: AGENT_MOMENT_ASSETS.rewardGift,
  momentBadgeText: "AGENT MOMENT™",
  heroTitle: "BẠN ĐÃ MỞ KHÓA",
  heroSubtitle: "Hành trình nhỏ hôm nay, tạo nên bạn tốt hơn ngày mai.",
  agentName: "ĐINH VĨ",
  teamName: "Agent Copilot Việt Nam",
  rewardName: "01 Cốc Cafe Starbucks",
  rewardValueText: "Phần thưởng",
  quoteText: "Không phải ngày nào cũng phải bứt phá.",
  cardId: "moment-test",
};

describe("Universal AgentMomentCard", () => {
  afterEach(() => cleanup());

  it("render Pure Card marketing với Hero background và data stacking", () => {
    const { container } = render(<AgentMomentCard {...baseProps} />);
    expect(document.getElementById("moment-test")).toBeTruthy();
    expect(container.innerHTML).toContain(AGENT_MOMENT_ASSETS.rewardGift);
    expect(screen.getByRole("img", { name: "Agent Copilot" })).toBeTruthy();
    expect(container.innerHTML).toContain("h-[280px]");
    expect(container.innerHTML).toContain("from-[#0B1431] via-[#0B1431]/80 to-transparent");
    expect(container.innerHTML).toContain("border-amber-500/30 bg-amber-500/20 text-amber-400");
    expect(container.innerHTML).toContain("flex flex-col gap-4");
    expect(container.innerHTML).toContain("sm:gap-5");
    expect(container.innerHTML).toContain("laurel-wreath-3d-gold_eb5fed57.png");
    expect(screen.getByRole("img", { name: "Recognition Seal" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Recognition Seal" }).className).toContain("mix-blend-multiply");
    expect(screen.getByRole("img", { name: "Recognition Seal" }).className).toContain("contrast-105");
    expect(screen.getByRole("img", { name: "Recognition Seal" }).className).toContain("h-8");
    expect(container.innerHTML).toContain("TVV");
    expect(container.innerHTML).toContain("system-ui");
    expect(container.innerHTML).toContain("amber-500/40");
    expect(container.innerHTML).toContain("grayscale opacity-70");
    expect(container.innerHTML).toContain("bg-gradient-to-br from-amber-400 to-orange-500");
    expect(container.innerHTML).toContain("bg-gradient-to-br from-amber-50/80 to-orange-50/40");
    expect(container.innerHTML).toContain("animate-pulse");
    expect(container.innerHTML).toContain("lucide-sparkles");
    expect(container.innerHTML).not.toContain("lucide-calendar-clock");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("CỘT MỐC ĐÁNG NHỚ")).toBeNull();
    expect(screen.queryByText("Lan tỏa năng lượng tích cực")).toBeNull();
    expect(container.innerHTML).toContain("Trợ Lý Đội Ngũ");
    expect(screen.getByText("ĐINH VĨ")).toBeTruthy();
    expect(screen.getByText("Team Agent Copilot Việt Nam")).toBeTruthy();
    expect(screen.getByText("01 Cốc Cafe Starbucks")).toBeTruthy();
  });

  it.each([
    ["recovery", AGENT_MOMENT_ASSETS.growthMoment, "bg-[#10B981]"],
    ["consistency", AGENT_MOMENT_ASSETS.consistency, "bg-[#3B82F6]"],
    ["leader", AGENT_MOMENT_ASSETS.heartMoment, "bg-[#8B5CF6]"],
  ] as const)("áp dụng Hero art %s", (_type, assetUrl) => {
    const { container } = render(<AgentMomentCard {...baseProps} bgAssetUrl={assetUrl} />);
    expect(container.innerHTML).toContain(assetUrl);
  });

  it("không render CTA button trong ảnh tĩnh", () => {
    render(<AgentMomentCard {...baseProps} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("CỘT MỐC ĐÁNG NHỚ")).toBeNull();
  });

  it("biến thành Recognition Card ưu tiên background và không còn seal trung tâm", () => {
    const { container } = render(<AgentMomentCard {...baseProps} cardType="recognition" rewardName={null} leaderMessage="Cảm ơn bạn đã quay lại nhịp cùng Team." />);
    expect(screen.getByText("CẢM ƠN BẠN")).toBeTruthy();
    expect(screen.getByText("VÌ NHỮNG NỖ LỰC")).toBeTruthy();
    expect(screen.queryByText("MỘT PHẦN THƯỞNG")).toBeNull();
    expect(screen.getByText("Lời nhắn trực tiếp từ Leader")).toBeTruthy();
    expect(screen.getByText("Cảm ơn bạn đã quay lại nhịp cùng Team.")).toBeTruthy();
    expect(container.innerHTML).toContain("lucide-heart");
    expect(container.innerHTML).toContain("from-emerald-400 to-teal-600");
    expect(container.innerHTML).toContain("border-emerald-100 bg-white/90 text-emerald-700");
    expect(container.innerHTML).toContain("from-cyan-50");
    expect(container.innerHTML).toContain("background-position: right center");
    expect(container.innerHTML).toContain("h-[240px] bg-slate-50 sm:h-[260px]");
    expect(container.innerHTML).toContain("from-white/90 via-white/10 to-transparent");
    expect(container.innerHTML).toContain("w-[65%] sm:w-[60%]");
    expect(container.innerHTML).toContain("pt-2 pb-1 text-[22px]");
    expect(container.innerHTML).toContain("leading-[1.2]");
    expect(container.innerHTML).toContain("text-[#0B1431]");
    expect(container.innerHTML).toContain("text-slate-700");
    expect(container.innerHTML).toContain("whitespace-nowrap");
    expect(container.innerHTML).toContain("-mt-4 rounded-t-[24px] pt-6");
    expect(container.innerHTML).not.toContain("Emerald Heart Seal");
    expect(container.innerHTML).not.toContain("h-20 w-20");
    expect(container.innerHTML).not.toContain("01 Cốc Cafe Starbucks");
  });

  it("dùng avatar gamified theo chữ cái khi không có ảnh và ưu tiên ảnh khi được truyền vào", () => {
    const { rerender } = render(<AgentMomentCard {...baseProps} />);
    expect(screen.getByText("Đ")).toBeTruthy();
    expect(screen.queryByRole("img", { name: "Avatar TVV" })).toBeNull();

    rerender(<AgentMomentCard {...baseProps} agentAvatar="https://example.test/avatar.png" />);
    expect(screen.getByRole("img", { name: "Avatar TVV" }).getAttribute("src")).toBe("https://example.test/avatar.png");
  });

  it("giữ Team Badge cân đối khi tên team dài trên một hàng", () => {
    render(<AgentMomentCard {...baseProps} teamName="Đội Ngũ Tư Vấn Bảo Hiểm Nhân Thọ Phát Triển Bền Vững" />);
    const teamBadge = screen.getByText(/Team Đội Ngũ Tư Vấn Bảo Hiểm Nhân Thọ/i);
    expect(teamBadge.className).toContain("whitespace-nowrap");
    expect(teamBadge.className).toContain("truncate");
    expect(teamBadge.parentElement?.className).toContain("items-center");
    expect(teamBadge.className).toContain("max-w-[110px]");
  });

  it("dùng padding, hero width và nhãn no-wrap an toàn cho màn hình cực hẹp", () => {
    const { container } = render(<AgentMomentCard {...baseProps} teamName="Đội Ngũ Tư Vấn Bảo Hiểm Nhân Thọ Phát Triển Bền Vững" />);

    expect(container.innerHTML).toContain("px-6 sm:px-8");
    expect(container.innerHTML).toContain("max-w-[460px]");
    expect(container.innerHTML).toContain("whitespace-nowrap");
    expect(container.innerHTML).toContain("px-4 pb-4");
    expect(container.innerHTML).toContain("sm:px-6 sm:pb-6");
    const journeyLabel = screen.getByText("Hành trình của");
    expect(journeyLabel.className).toContain("whitespace-nowrap");
    expect(journeyLabel.className).toContain("truncate");
    const avatarFrame = journeyLabel.parentElement?.previousElementSibling;
    expect(avatarFrame?.className).toContain("h-10");
    expect(avatarFrame?.className).toContain("w-10");
    expect(avatarFrame?.className).toContain("sm:h-12");
  });

  it.each([
    ["personal", "Hành trình cá nhân"],
    ["leader", "Leader tiếp lửa"],
    ["team", "Team Agent Copilot Việt Nam"],
  ] as const)("đổi Recognition Badge theo context %s", (recognitionType, expectedText) => {
    render(<AgentMomentCard {...baseProps} recognitionType={recognitionType} />);
    expect(screen.getByText(expectedText)).toBeTruthy();
  });
});
