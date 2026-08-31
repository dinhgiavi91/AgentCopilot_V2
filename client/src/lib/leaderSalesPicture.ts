export type SelfReportedRevenueLog = { status: string; revenue: number };

export type GoalVsActual = {
  teamGoal: number;
  actualRevenue: number;
  completionRate: number;
  progressWidth: number;
  successfulTouches: number;
};

export function buildGoalVsActual(teamGoal: number, logs: SelfReportedRevenueLog[]): GoalVsActual {
  const successfulLogs = logs.filter((log) => /ký hợp đồng|thành công/i.test(log.status));
  const actualRevenue = successfulLogs.reduce((total, log) => total + Math.max(0, log.revenue), 0);
  const completionRate = teamGoal > 0 ? Math.round((actualRevenue / teamGoal) * 100) : 0;
  return { teamGoal, actualRevenue, completionRate, progressWidth: Math.min(100, completionRate), successfulTouches: successfulLogs.length };
}

export const mockSelfReportedSales = [
  { status: "Ký Hợp Đồng", revenue: 120_000_000 },
  { status: "Thành công", revenue: 95_000_000 },
  { status: "Ký Hợp Đồng", revenue: 65_000_000 },
  { status: "Dời lịch", revenue: 0 },
] satisfies SelfReportedRevenueLog[];

export const mockMonthlyPerformance = {
  revenueChange: 18,
  contractChange: -6,
  previousRevenue: 237_000_000,
  previousContracts: 17,
  currentContracts: 16,
};

export const mockWeeklyRevenueTrend = [
  { week: "T1", revenue: 48_000_000 },
  { week: "T2", revenue: 62_000_000 },
  { week: "T3", revenue: 74_000_000 },
  { week: "T4", revenue: 96_000_000 },
];

export const mockRevenueContributors = [
  { alias: "TVV #01", contribution: 92_000_000, contracts: 2 },
  { alias: "TVV #02", contribution: 71_000_000, contracts: 1 },
  { alias: "TVV #03", contribution: 63_000_000, contracts: 1 },
  { alias: "TVV #04", contribution: 54_000_000, contracts: 1 },
];
