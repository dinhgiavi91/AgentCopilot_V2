export function calculateTargetPlan(targetIncome: number, earnedIncome: number) {
  const requiredMeetings = Math.max(1, Math.round((targetIncome / 30_000_000) * 40));
  const finishedMeetings = Math.min(20, requiredMeetings);
  const progress = Math.min(100, Math.round((earnedIncome / targetIncome) * 100));
  const meetingProgress = Math.round((finishedMeetings / requiredMeetings) * 100);

  return { requiredMeetings, finishedMeetings, progress, meetingProgress };
}

export function buildZaloDeepLink(message: string) {
  return `https://zalo.me/?text=${encodeURIComponent(message)}`;
}

export function shouldShowWelcome(hash: string, hasSeenWelcome: boolean) {
  return !hash && !hasSeenWelcome;
}
