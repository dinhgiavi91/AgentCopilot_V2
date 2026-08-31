import React from "react";
import { BarChart3, Target, Users } from "lucide-react";
import { calculateIncomeMeetingPlan } from "../lib/sprint10Logic";

const teamTargetSnapshot = [
  { advisor: "Thu Hà", rank: "Chuyên viên 1 năm", bhnt: 30, pnt: 8, commission: 40, averageContract: 25 },
  { advisor: "Minh Tuấn", rank: "Newbie 1 tháng", bhnt: 20, pnt: 5, commission: 35, averageContract: 18 },
  { advisor: "Ngân", rank: "Quản lý", bhnt: 45, pnt: 15, commission: 45, averageContract: 30 },
];

export function LeaderTargetOverview() {
  return <section className="leader-target-overview"><div className="leader-target-heading"><div><span><Users size={14} />THIẾT LẬP MỤC TIÊU ĐỘI · DEMO</span><h2>Đọc <em>đường đi</em> của từng TVV.</h2><p>Leader xem mục tiêu BHNT/PNT và phễu quy đổi từ thu nhập, hoa hồng và size HĐ; dữ liệu vận hành thực tế cần được phân quyền theo RLS.</p></div><div className="leader-target-mark"><Target size={23} /><small>TEAM PLAN</small></div></div><div className="leader-target-table"><div className="leader-target-row leader-target-head"><span>TVV</span><span>Mục tiêu BHNT</span><span>Mục tiêu PNT</span><span>Phễu dự kiến</span></div>{teamTargetSnapshot.map((advisor) => { const plan = calculateIncomeMeetingPlan({ targetIncome: (advisor.bhnt + advisor.pnt) * 1_000_000, commissionRatePercent: advisor.commission, averageContractSize: advisor.averageContract * 1_000_000 }); return <div className="leader-target-row" key={advisor.advisor}><div><strong>{advisor.advisor}</strong><small>{advisor.rank} · {advisor.commission}% HH · {advisor.averageContract}tr/HĐ</small></div><b>{advisor.bhnt}tr</b><b>{advisor.pnt}tr</b><span><BarChart3 size={14} />{plan.requiredMeetings} cuộc gặp · {plan.requiredContracts} HĐ</span></div>; })}</div></section>;
}
