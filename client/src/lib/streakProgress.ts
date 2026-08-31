export type StreakProgressMilestone = { milestoneDay: number };

export type StreakProgress = {
  currentStreak: number;
  previousMilestoneDay: number;
  nextMilestoneDay: number | null;
  progressPercent: number;
  daysLeft: number;
};

export function calculateStreakProgress(currentStreak: number, milestones: StreakProgressMilestone[]): StreakProgress {
  const current = Math.max(0, Math.floor(Number(currentStreak) || 0));
  const orderedDays = [...new Set(milestones.map((milestone) => Math.max(1, Math.floor(milestone.milestoneDay))).filter(Number.isFinite))].sort((left, right) => left - right);
  const reachedDays = orderedDays.filter((day) => day <= current);
  const previous = reachedDays.length ? reachedDays[reachedDays.length - 1] : 0;
  const next = orderedDays.find((day) => day > current) ?? null;
  if (!next) return { currentStreak: current, previousMilestoneDay: previous, nextMilestoneDay: null, progressPercent: 100, daysLeft: 0 };
  const distance = Math.max(1, next - previous);
  return { currentStreak: current, previousMilestoneDay: previous, nextMilestoneDay: next, progressPercent: Math.min(100, Math.max(0, Math.round(((current - previous) / distance) * 100))), daysLeft: Math.max(0, next - current) };
}
