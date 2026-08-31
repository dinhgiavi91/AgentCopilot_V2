export type TargetRole = "advisor" | "leader" | "director";

export type AdvisorProductTarget = {
  incomeTarget: number;
  commissionRate: number;
  averageContractSize: number;
};

export type AdvisorTargetPlan = {
  bhntContracts: number;
  pntContracts: number;
  requiredContracts: number;
  requiredMeetings: number;
  projectedIncome: number;
};

export type LeaderTargetPlan = {
  totalRevenue: number;
  activeAdvisorTarget: number;
  recruitTarget: number;
  priority: string;
};

const productContracts = ({ incomeTarget, commissionRate, averageContractSize }: AdvisorProductTarget) => {
  if (incomeTarget <= 0 || commissionRate <= 0 || averageContractSize <= 0) return 0;
  const incomePerContract = averageContractSize * (commissionRate / 100);
  return Math.ceil(incomeTarget / incomePerContract);
};

export function calculateAdvisorTargetPlan(bhnt: AdvisorProductTarget, pnt: AdvisorProductTarget): AdvisorTargetPlan {
  const bhntContracts = productContracts(bhnt);
  const pntContracts = productContracts(pnt);
  const requiredContracts = bhntContracts + pntContracts;
  return {
    bhntContracts,
    pntContracts,
    requiredContracts,
    requiredMeetings: requiredContracts * 3,
    projectedIncome: bhnt.incomeTarget + pnt.incomeTarget,
  };
}

export function calculateLeaderTargetPlan({ bhntRevenue, pntRevenue, activeAdvisorTarget, recruitTarget }: { bhntRevenue: number; pntRevenue: number; activeAdvisorTarget: number; recruitTarget: number }): LeaderTargetPlan {
  const totalRevenue = Math.max(0, bhntRevenue) + Math.max(0, pntRevenue);
  const priority = activeAdvisorTarget > 0
    ? `Giữ ít nhất ${activeAdvisorTarget} TVV active trước khi mở rộng tuyển dụng.`
    : "Thiết lập chuẩn TVV active trước khi mở rộng đội ngũ.";
  return { totalRevenue, activeAdvisorTarget: Math.max(0, activeAdvisorTarget), recruitTarget: Math.max(0, recruitTarget), priority };
}

const motivationQuotes = [
  "Một cuộc hẹn tử tế hôm nay tạo nền cho một hành trình dài.",
  "Giữ nhịp chăm sóc trước, kết quả sẽ theo sau.",
  "Đội mạnh hơn khi từng TVV biết mình đang đi về đâu.",
  "Mỗi câu hỏi sâu là một bước gần hơn tới sự tin cậy.",
];

export function getDailyMotivation(teamName: string, dayOfYear = new Date().getDate() + new Date().getMonth() * 31): string {
  const safeName = teamName.trim() || "Agent Copilot";
  return `${safeName}: ${motivationQuotes[Math.abs(dayOfYear) % motivationQuotes.length]}`;
}
