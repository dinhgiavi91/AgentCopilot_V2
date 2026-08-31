import { describe, expect, it } from "vitest";
import { getMarketingCardsForAudience, getMarketingSegment, productIntroductionPoster } from "../client/src/lib/marketingSegmentation";

const cards = [
  { code: "birthday", category: "Chăm sóc khách hàng", occasion: "Chúc mừng sinh nhật KH", message_template: "Chúc bạn sinh nhật vui vẻ.", image_url: null, sort_order: 1 },
  { code: "premium", category: "Nhắc phí", occasion: "Nhắc phí hợp đồng", message_template: "Nhắc bạn rà soát phí đúng hạn.", image_url: null, sort_order: 2 },
  { code: "fortune", category: "Thiệp tử vi", occasion: "Tử vi tháng mới", message_template: "Chúc gia đình nhiều bình an.", image_url: null, sort_order: 3 },
  { code: "top-sale", category: "Vinh danh nội bộ", occasion: "Chúc mừng Top Sale", message_template: "Cảm ơn nỗ lực đội ngũ.", image_url: null, sort_order: 4 },
  { code: "promotion", category: "Thăng cấp", occasion: "Chúc mừng thăng cấp", message_template: "Chúc mừng bước tiến mới.", image_url: null, sort_order: 5 },
];

describe("Marketing 1-Chạm segmentation", () => {
  it("gắn category tag đúng cho thẻ khách hàng và nội bộ", () => {
    expect(getMarketingSegment(cards[0])).toBe("customer");
    expect(getMarketingSegment(cards[1])).toBe("customer");
    expect(getMarketingSegment(cards[2])).toBe("customer");
    expect(getMarketingSegment(cards[3])).toBe("leader_internal");
    expect(getMarketingSegment(cards[4])).toBe("leader_internal");
  });

  it("TVV chỉ thấy thẻ phục vụ khách hàng", () => {
    const advisorCards = getMarketingCardsForAudience([productIntroductionPoster, ...cards], "advisor");
    expect(advisorCards.map((card) => card.code)).toEqual(["advisor-product-poster", "birthday", "premium", "fortune"]);
    expect(advisorCards.every((card) => card.segment === "customer")).toBe(true);
  });

  it("Leader thấy toàn bộ vũ khí TVV và mẫu nội bộ", () => {
    const leaderCards = getMarketingCardsForAudience([productIntroductionPoster, ...cards], "leader");
    expect(leaderCards.map((card) => card.code)).toEqual(["advisor-product-poster", "birthday", "premium", "fortune", "top-sale", "promotion"]);
    expect(leaderCards.some((card) => card.segment === "leader_internal")).toBe(true);
    expect(leaderCards.some((card) => card.segment === "customer")).toBe(true);
  });
});
