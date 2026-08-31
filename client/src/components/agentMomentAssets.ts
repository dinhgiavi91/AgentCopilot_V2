export const AGENT_MOMENT_ASSETS = {
  heartMoment: "/manus-storage/heart-moment_8f6f2f41.png",
  growthMoment: "/manus-storage/growth-moment_a331c401.png",
  trophyMoment: "/manus-storage/trophy-moment_90651156.png",
  recovery: "/manus-storage/01_recovery_moment_996404f0.png",
  consistency: "/manus-storage/02_7_day_consistency_014309fa.png",
  leaderRecognition: "/manus-storage/03_leader_recognition_5650a092.png",
  breakthrough: "/manus-storage/04_breakthrough_moment_cfe29344.png",
  rewardMoney: "/manus-storage/05_reward_money_1a57436a.png",
  rewardCoffee: "/manus-storage/06_reward_coffee_1839c446.png",
  rewardFood: "/manus-storage/07_reward_food_83210d81.png",
  rewardGift: "/manus-storage/08_reward_gift_af0968f6.png",
} as const;

export type AgentMomentAssetKey = keyof typeof AGENT_MOMENT_ASSETS;

export function resolveRewardMomentAsset(rewardName: string | null | undefined) {
  const normalizedName = (rewardName || "").toLocaleLowerCase("vi");
  if (/(cafe|cà phê|coffee|starbucks|trà|tea)/.test(normalizedName)) return AGENT_MOMENT_ASSETS.rewardCoffee;
  if (/(ăn|food|meal|nhà hàng|restaurant|grab)/.test(normalizedName)) return AGENT_MOMENT_ASSETS.rewardFood;
  if (/(tiền|cash|money|thưởng nóng|voucher tiền)/.test(normalizedName)) return AGENT_MOMENT_ASSETS.rewardMoney;
  return AGENT_MOMENT_ASSETS.rewardGift;
}
