export const SPRINT6_ROUTE_IDS = ["profile", "playbook", "community", "customer_journal", "heartbeat", "radar", "marketing", "empathy", "leader", "disc", "cover", "news", "feedback"] as const;
export type Sprint6Route = (typeof SPRINT6_ROUTE_IDS)[number];
export type DiscType = "D" | "I" | "S" | "C";
export type DiscResultType = DiscType | "DI" | "DC" | "IS" | "SC" | "CHAMELEON";

export function resolveSprint6Route(hash: string): Sprint6Route {
  const candidate = hash.replace(/^#/, "") as Sprint6Route;
  return SPRINT6_ROUTE_IDS.includes(candidate) ? candidate : "profile";
}

export function calculateDiscScores(answers: DiscType[]) {
  const scores: Record<DiscType, number> = { D: 0, I: 0, S: 0, C: 0 };
  answers.forEach((answer) => scores[answer]++);
  return scores;
}

export function calculateDiscResult(answers: DiscType[]): DiscResultType | null {
  if (!answers.length) return null;
  const scores = calculateDiscScores(answers);
  const orderedTypes = ["D", "I", "S", "C"] as DiscType[];
  const maxScore = Math.max(...orderedTypes.map((type) => scores[type]));
  const leadingTypes = orderedTypes.filter((type) => scores[type] === maxScore);
  if (leadingTypes.length === 1) return leadingTypes[0];
  if (leadingTypes.length >= 3) return "CHAMELEON";
  const pair = leadingTypes.join("");
  const commonHybrid: Record<string, DiscResultType> = { DI: "DI", DC: "DC", IS: "IS", SC: "SC" };
  return commonHybrid[pair] ?? "CHAMELEON";
}

export function sumXp(entries: Array<{ xp_amount: number }>) { return entries.reduce((sum, entry) => sum + entry.xp_amount, 0); }

export function buildAdvisorProgress(profile: { total_xp: number | null; current_streak: number | null; coin_balance?: number | null } | null, quizClaimsToday: number) {
  return {
    total_xp: profile?.total_xp ?? 0,
    current_streak: profile?.current_streak ?? 0,
    coin_balance: profile?.coin_balance ?? 0,
    completed_quiz_today: quizClaimsToday > 0,
  };
}

export function getUtcDayStartIso(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

export function didClaimDailyQuizToday(entries: Array<{ reason: string; created_at: string }>, now = new Date()) {
  const todayStart = getUtcDayStartIso(now);
  return entries.some((entry) => entry.reason === "daily_quiz" && entry.created_at >= todayStart);
}

export function containsPotentialContactPii(value: string) {
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const phone = /(^|[^0-9])(?:\+?84|0)[0-9 .-]{8,}(?:$|[^0-9])/;
  return email.test(value) || phone.test(value);
}

export function validateZeroPiiFeedback(favoriteFeature: string, suggestion: string) {
  if (!favoriteFeature.trim() || suggestion.trim().length < 3) return "Hãy chọn tính năng và viết góp ý ngắn.";
  if (containsPotentialContactPii(`${favoriteFeature} ${suggestion}`)) return "Không thể gửi thông tin liên hệ. Vui lòng xóa email hoặc số điện thoại khách hàng.";
  return null;
}
