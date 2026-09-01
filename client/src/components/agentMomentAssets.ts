import rewardBgImg from '../assets/images/reward-bg.png';
import leaderHeartImg from '../assets/images/leader-heart.png';
export const AGENT_MOMENT_ASSETS = {
  heartMoment: "/manus-storage/heart-moment_8f6f2f41.png",
  growthMoment: "/manus-storage/growth-moment_a331c401.png",
  trophyMoment: rewardBgImg,
  recovery: "/manus-storage/01_recovery_moment_996404f0.png",
  consistency: "/manus-storage/02_7_day_consistency_014309fa.png",
  leaderRecognition: leaderHeartImg,
  breakthrough: "/manus-storage/04_breakthrough_moment_cfe29344.png",
  rewardMoney: rewardBgImg,
  rewardCoffee: rewardBgImg,
  rewardFood: rewardBgImg,
  rewardGift: rewardBgImg,
} as const;

export type AgentMomentAssetKey = keyof typeof AGENT_MOMENT_ASSETS;

export function resolveRewardMomentAsset(rewardName: string | null | undefined) {
  const normalizedName = (rewardName || "").toLocaleLowerCase("vi");
  if (/(cafe|cà phê|coffee|starbucks|trà|tea)/.test(normalizedName)) return AGENT_MOMENT_ASSETS.rewardCoffee;
  if (/(ăn|food|meal|nhà hàng|restaurant|grab)/.test(normalizedName)) return AGENT_MOMENT_ASSETS.rewardFood;
  if (/(tiền|cash|money|thưởng nóng|voucher tiền)/.test(normalizedName)) return AGENT_MOMENT_ASSETS.rewardMoney;
  return AGENT_MOMENT_ASSETS.rewardGift;
}
