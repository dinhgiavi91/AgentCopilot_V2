import type { MarketingTemplate } from "./supabaseContent";

export type MarketingAudience = "advisor" | "leader";
export type MarketingSegment = "customer" | "leader_internal";
export type SegmentedMarketingTemplate = MarketingTemplate & { segment: MarketingSegment; segmentLabel: string };

const customerSignals = /khách|sinh nhật|nhắc phí|tử vi|hâm nóng|hợp đồng|tri ân|chăm sóc|quyền lợi|sản phẩm|dịch vụ|bảo vệ|gia đình|tư vấn/i;
const internalSignals = /nội bộ|vinh danh|top sale|thăng cấp|đội ngũ|leader|coaching|tuyển dụng|thi đua|contest/i;

export const productIntroductionPoster: MarketingTemplate = {
  code: "advisor-product-poster",
  category: "Giới thiệu sản phẩm/dịch vụ",
  occasion: "Giới thiệu giải pháp bảo vệ gia đình",
  message_template: "Một giải pháp bảo vệ phù hợp bắt đầu từ nhu cầu của gia đình. Mình có thể gửi bạn vài câu hỏi để cùng tham khảo, hoàn toàn không áp lực.",
  image_url: null,
  sort_order: -2,
};

export function getMarketingSegment(card: Pick<MarketingTemplate, "category" | "occasion" | "message_template">): MarketingSegment {
  const searchable = `${card.category} ${card.occasion} ${card.message_template}`;
  if (internalSignals.test(searchable)) return "leader_internal";
  return customerSignals.test(searchable) ? "customer" : "leader_internal";
}

export function getMarketingSegmentLabel(segment: MarketingSegment) {
  return segment === "customer" ? "KHÁCH HÀNG" : "NỘI BỘ LEADER";
}

export function getMarketingCardsForAudience(cards: MarketingTemplate[], audience: MarketingAudience): SegmentedMarketingTemplate[] {
  const classified = cards.map((card) => {
    const segment = getMarketingSegment(card);
    return { ...card, segment, segmentLabel: getMarketingSegmentLabel(segment) };
  });
  return audience === "leader" ? classified : classified.filter((card) => card.segment === "customer");
}
