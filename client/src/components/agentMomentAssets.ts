import rewardBgImg from '../assets/images/reward-bg.png';
import leaderHeartImg from '../assets/images/leader-heart.png';
export const AGENT_MOMENT_ASSETS = {
  heartMoment: leaderHeartImg,
  growthMoment: rewardBgImg,
  trophyMoment: rewardBgImg,
  recovery: rewardBgImg,
  consistency: rewardBgImg,
  leaderRecognition: leaderHeartImg,
  breakthrough: rewardBgImg,
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
