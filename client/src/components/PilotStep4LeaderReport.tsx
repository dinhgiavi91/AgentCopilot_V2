import React, { useEffect, useState } from "react";
import { Activity, BarChart3, CheckCircle2, CircleAlert, Users } from "lucide-react";
import { fetchLeaderTeamReport, type LeaderTeamReport } from "../lib/supabaseContent";

function ReportMetric({ label, value, detail, tone = "navy" }: { label: string; value: number; detail: string; tone?: "navy" | "gold" | "orange" | "green" }) {
  return <article className={`pilot-report-metric tone-${tone}`}><span>{label}</span><strong>{value}</strong><p className="text-xs text-slate-500">{detail}</p></article>;
}

export function PilotStep4LeaderReport() {
  const [report, setReport] = useState<LeaderTeamReport | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetchLeaderTeamReport().then((next) => active && setReport(next)).catch((cause: unknown) => active && setError(cause instanceof Error ? cause.message : "Không thể đọc báo cáo Team."));
    return () => { active = false; };
  }, []);
  const maxTouches = Math.max(1, ...(report?.weeklyTouches.map((item) => item.count) ?? [0]));
  return <section className="pilot-leader-report lift-card" aria-label="Báo cáo Leader theo Team"><header><div><span><BarChart3 size={15} />BÁO CÁO LEADER · TEAM LIVE</span><h2>Nhìn đúng nhịp đội,<em> không chỉ nhìn kết quả.</em></h2><p>Chỉ số được tổng hợp từ hoạt động, Follow-up, Signal và Intervention trong phạm vi Team của bạn.</p></div><div className="pilot-report-mark"><Activity size={24} /></div></header>{error ? <div className="pilot-report-empty is-error"><CircleAlert size={22} /><div><strong>Chưa thể tải báo cáo Team.</strong><span>{error}</span></div></div> : !report ? <div className="pilot-report-empty"><Activity size={22} /><div><strong>Đang tổng hợp Báo cáo Leader…</strong><span>Chỉ số sẽ hiển thị ngay khi phiên Team sẵn sàng.</span></div></div> : <><div className="pilot-report-grid"><ReportMetric label="Năng lượng Team (Nhịp đập)" value={report.touchesThisWeek} detail="Đo lường mức độ chăm chỉ tương tác của toàn đội." tone="gold" /><ReportMetric label="Báo động đỏ (Signal)" value={report.newSignals} detail="TVV đang tụt nhịp hoặc trễ hẹn cần hỗ trợ NGAY." tone="orange" /><ReportMetric label="Lần ra tay (Intervention)" value={report.interventionsThisWeek} detail="Số lần bạn ghi nhận hỗ trợ để kéo TVV lại đường đua." tone="green" /><ReportMetric label="Quân số sống sót" value={report.activeAdvisors} detail="Số TVV còn đang bám trụ và tương tác tuần này." tone="navy" /></div><section className="pilot-report-chart"><header><div><span>NHỊP HÀNH ĐỘNG 7 NGÀY</span><strong>Xu hướng chạm Team</strong></div><small>{report.completedFollowupsThisWeek} Follow-up hoàn tất · {report.openFollowups} cần theo dõi</small></header>{report.touchesThisWeek ? <div className="pilot-report-bars" aria-label="Biểu đồ hoạt động 7 ngày">{report.weeklyTouches.map((item) => <div key={item.label}><i style={{ height: `${Math.max(10, Math.round((item.count / maxTouches) * 100))}%` }} aria-label={`${item.label}: ${item.count} hoạt động`} /><span>{item.label}</span><b>{item.count}</b></div>)}</div> : <div className="pilot-report-empty"><CheckCircle2 size={22} /><div><strong>Chưa có dữ liệu tuần này.</strong><span>Khi TVV ghi Nhịp Đập hoặc CRM Zero-PII, biểu đồ sẽ tự cập nhật.</span></div></div>}</section></>}</section>;
}
