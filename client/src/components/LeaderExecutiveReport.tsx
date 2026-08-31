import { AlertTriangle, Download, FileText, HeartCrack, HeartHandshake, Info, Loader2, Sparkles, Star, Target, TrendingUp, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import LeaderMetricsGuide from "./LeaderMetricsGuide";
import { fetchExecutivePerformanceReport, fetchPilotSignals, fetchTeamRecoveryWatchlist, type ExecutivePerformanceReport, type PilotSignalItem, type TeamRecoveryWatchlist } from "../lib/supabaseContent";

type LeaderExecutiveReportProps = {
  isOpen: boolean;
  onClose: () => void;
  hours: number;
  rangeLabel: string;
  onToast: (message: string) => void;
};

type CopilotAlertTone = "warning" | "danger" | "success";
type CopilotAlert = { tone: CopilotAlertTone; title: string; text: string };
type CopilotInsights = {
  macroSummary: { revenueText: string; healthText: string; healthAlert: boolean };
  correlationText: string;
  alerts: CopilotAlert[];
};

function radarSignalTitle(signal: PilotSignalItem) {
  const metadata = signal.metadata ?? {};
  if (metadata.rule_key === "leader_goal_pace_v70") {
    const metric = metadata.metric_key;
    if (metric === "coaching_sessions") return "Low Coaching";
    if (metric === "active_rate") return "Active Rate dưới mục tiêu";
    if (metric === "recruitment_outreach") return "Tuyển dụng chậm nhịp";
    if (metric === "personal_income") return "Tiến độ làm gương";
    return "Mục tiêu quản trị cần theo dõi";
  }
  if (signal.signal_type === "low_activity" || signal.signal_type === "streak_break") return "Mất nhịp hoạt động";
  if (signal.signal_type === "followup_overdue") return "Follow-up cần chạm";
  if (signal.signal_type === "conversion_drop" || signal.signal_type === "high_rejection") return "Gỡ vướng chuyển đổi";
  return "Tín hiệu Radar cần theo dõi";
}

function radarSignalTone(signal: PilotSignalItem): CopilotAlertTone {
  return signal.severity === "critical" || signal.severity === "high" ? "danger" : "warning";
}

const currency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
const datetime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function generateCopilotInsights(teamData: ExecutivePerformanceReport["rows"]): CopilotInsights {
  if (!teamData.length) {
    return {
      macroSummary: { revenueText: "Chưa có nhịp hoạt động được ghi nhận trong kỳ này.", healthText: "Chưa đủ dữ liệu để đánh giá sức khỏe Team.", healthAlert: false },
      correlationText: "Hãy bắt đầu bằng một buổi check-in ngắn và khuyến khích TVV ghi nhịp để Copilot tạo tham mưu có căn cứ.",
      alerts: [],
    };
  }

  const totalRevenue = teamData.reduce((sum, member) => sum + member.selfReportedRevenue, 0);
  const avgMorale = Math.round(teamData.reduce((sum, member) => sum + member.moraleScore, 0) / teamData.length);
  const totalExecution = teamData.reduce((sum, member) => sum + member.pillars.execute, 0);
  const totalLearning = teamData.reduce((sum, member) => sum + member.pillars.learn, 0);

  const macroSummary = {
    revenueText: totalRevenue > 0
      ? `Doanh số TVV tự khai báo trong kỳ đạt ${currency(totalRevenue)}.`
      : "Chưa ghi nhận doanh số TVV tự khai báo trong kỳ này.",
    healthText: avgMorale >= 70
      ? `Sức khỏe Team đang vững (Động lực trung bình: ${avgMorale}/100).`
      : avgMorale >= 50
        ? `Sức khỏe Team cần được giữ lửa (Động lực trung bình: ${avgMorale}/100).`
        : `Cần ưu tiên hỗ trợ sức khỏe Team (Động lực trung bình: ${avgMorale}/100).`,
    healthAlert: avgMorale < 50,
  };

  const correlationText = totalExecution > 0 && totalRevenue > 0
    ? `Tỷ lệ chuyển đổi đang có tín hiệu tốt: trung bình mỗi nhịp Thực chiến gắn với khoảng ${currency(Math.round(totalRevenue / totalExecution))} doanh số tự khai báo. Học tập hiện có ${totalLearning} nhịp và Thực chiến có ${totalExecution} nhịp; hãy giữ cân bằng giữa mài rìu và ra chiến trường.`
    : totalExecution > 0
      ? `Team có ${totalExecution} nhịp Thực chiến nhưng chưa có doanh số tự khai báo. Ưu tiên review kịch bản, role-play và gỡ vướng ở điểm chốt.`
      : "Báo động đỏ: Team chưa có nhịp Thực chiến nào trong kỳ. Nguy cơ đứt gãy phễu doanh thu cần được xử lý bằng một phiên role-play hoặc check-in ngay.";

  const alerts: CopilotAlert[] = [];
  const fakeProductivity = teamData.filter((member) => member.pillars.learn + member.pillars.engage >= 4 && member.pillars.execute === 0);
  if (fakeProductivity.length) {
    alerts.push({ tone: "warning", title: "Năng suất ảo", text: `Có ${fakeProductivity.length} TVV, điển hình ${fakeProductivity[0].displayName}, có nhịp học tập/gắn kết nhưng chưa có Thực chiến. Cần check-in để gỡ rào cản.` });
  }

  const burnoutRisk = teamData.filter((member) => member.moraleScore < 30);
  if (burnoutRisk.length) {
    alerts.push({ tone: "danger", title: "Rủi ro rớt nhịp", text: `Có ${burnoutRisk.length} TVV chạm mức Động lực dưới 30. Ưu tiên một cuộc trò chuyện 1:1 không phán xét trước khi bàn về KPI.` });
  }

  const stars = teamData.filter((member) => member.pillars.execute >= 5 && member.selfReportedRevenue > 0);
  if (stars.length) {
    alerts.push({ tone: "success", title: "Đà chiến thắng", text: `Team có ${stars.length} TVV vừa thực chiến đều vừa có doanh số tự khai báo. Mời họ chia sẻ Case Study để nhân rộng cách làm.` });
  }

  return { macroSummary, correlationText, alerts };
}

export default function LeaderExecutiveReport({ isOpen, onClose, hours, rangeLabel, onToast }: LeaderExecutiveReportProps) {
  const [report, setReport] = useState<ExecutivePerformanceReport | null>(null);
  const [watchlist, setWatchlist] = useState<TeamRecoveryWatchlist>({ totalInterventions: 0, recoveredCount: 0, measurableOutcomes: 0, recoveryRate: null, items: [] });
  const [radarSignals, setRadarSignals] = useState<PilotSignalItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [guideTopic, setGuideTopic] = useState<"morale" | "pillars" | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError("");
    void Promise.all([fetchExecutivePerformanceReport(hours), fetchTeamRecoveryWatchlist(), fetchPilotSignals()])
      .then(([nextReport, nextWatchlist, nextSignals]) => { setReport(nextReport); setWatchlist(nextWatchlist); setRadarSignals(nextSignals); })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Không thể tổng hợp dữ liệu báo cáo."))
      .finally(() => setLoading(false));
  }, [hours, isOpen]);

  const copilotInsights = useMemo(() => generateCopilotInsights(report?.rows ?? []), [report]);
  const radarAlerts = useMemo<CopilotAlert[]>(() => radarSignals
    .filter((signal) => signal.status === "new" || signal.status === "reviewed")
    .filter((signal) => Date.parse(signal.detected_at) >= Date.now() - hours * 60 * 60 * 1000)
    .sort((left, right) => Date.parse(right.detected_at) - Date.parse(left.detected_at))
    .map((signal) => ({ tone: radarSignalTone(signal), title: radarSignalTitle(signal), text: signal.summary })), [hours, radarSignals]);
  const reportAlerts = useMemo(() => [...radarAlerts, ...copilotInsights.alerts], [copilotInsights.alerts, radarAlerts]);

  const handleDownloadPDF = async () => {
    const target = document.getElementById("leader-report-container");
    if (!target) {
      alert("Không tìm thấy dữ liệu báo cáo!");
      return;
    }
    setExporting(true);
    try {
      const imageData = await toPng(target, { backgroundColor: "#ffffff", pixelRatio: 1, skipFonts: true });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageProps = pdf.getImageProperties(imageData);
      const imageHeight = (imageProps.height * pdfWidth) / imageProps.width;
      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, pdfWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, pdfWidth, imageHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("Bao_Cao_Leader.pdf");
      onToast("Đã tải Báo cáo Hiệu suất Cấp cao dạng PDF.");
    } catch (error) {
      console.error("PDF Export Crash:", error);
      alert(`Lỗi xuất PDF: ${error instanceof Error ? error.message : String(error)}`);
      onToast("Chưa thể xuất PDF. Vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex min-h-screen items-center justify-center overflow-y-auto bg-[#0B1431]/90 p-0 backdrop-blur-sm sm:p-8" role="presentation" onClick={onClose}>
      <section className="relative my-auto flex min-h-screen w-full max-w-full flex-col bg-white shadow-2xl max-md:!w-full max-md:!max-w-full max-md:!px-4 sm:min-h-[80vh] sm:max-w-[900px] sm:rounded-[24px] md:w-auto md:flex-row" role="dialog" aria-modal="true" aria-label="Báo cáo Hiệu suất Cấp cao" onClick={(event) => event.stopPropagation()}>
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 print:hidden sm:right-4 sm:top-4">
          <button type="button" onClick={() => void handleDownloadPDF()} disabled={exporting || loading} className="flex items-center gap-2 rounded-xl bg-[#0B1431] px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 sm:px-4 sm:text-[13px]"><Download size={16} /><span className="hidden sm:inline">{exporting ? "Đang tạo…" : "Tải PDF"}</span></button>
          <button type="button" onClick={onClose} aria-label="Đóng Báo cáo Hiệu suất Cấp cao" className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"><X size={20} /></button>
        </div>

        <div id="leader-report-container" ref={reportRef} className="flex-1 bg-white px-4 pb-8 pt-20 max-md:!px-0 sm:p-12">
          {loading ? <div className="flex min-h-[60vh] items-center justify-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} />Đang tổng hợp báo cáo Team…</div> : error ? <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">{error}</div> : report && <>
            <header className="mb-8 border-b-2 border-[#0B1431] pb-6 sm:pr-32"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-[24px] font-black uppercase tracking-tight text-[#0B1431] sm:text-[28px]">Báo Cáo Hiệu Suất Cấp Cao</h1><p className="mt-1 text-[12px] font-bold uppercase tracking-widest text-slate-500 sm:text-[13px]">Đội ngũ: {report.teamName}</p></div><div className="text-left sm:text-right"><p className="text-[13px] font-bold text-[#0B1431]">Kỳ báo cáo: <span className="text-amber-600">{rangeLabel}</span></p><p className="mt-0.5 text-[11px] text-slate-500">Trích xuất: {datetime(report.rangeEnd)}</p></div></div></header>

            <section className="mb-9"><h2 className="mb-4 flex items-center gap-2 text-[15px] font-black uppercase tracking-widest text-[#0B1431]"><Target size={18} className="text-amber-500" />Tóm tắt ROI & Dấu ấn Lãnh đạo</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Tổng nỗ lực" value={report.totalActivity.toLocaleString("vi-VN")} detail="Nhịp hoạt động đã ghi nhận" tone="slate" /><MetricCard label="Chỉ số Động lực" value={`${report.teamMoraleScore}/100`} detail="Chuỗi quan sát + nhịp phản hồi" tone="emerald" /><MetricCard label="Leader hỗ trợ" value={`${report.leaderInterventions} lượt`} detail="Coaching / check-in trong kỳ" tone="amber" icon={<HeartHandshake size={18} />} /><MetricCard label="Doanh số tự khai báo" value={currency(report.totalSelfReportedRevenue)} detail="Chỉ tính hoạt động đạt kết quả" tone="emerald" /></div></section>

            <section className="mb-9"><h2 className="mb-4 flex items-center gap-2 text-[15px] font-black uppercase tracking-widest text-[#0B1431]"><TrendingUp size={18} className="text-emerald-500" />Phân tích Hiệu quả Cá nhân</h2><div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[760px] w-full border-collapse text-left"><thead><tr className="bg-[#0B1431] text-white"><th className="border-b border-slate-600 px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Thành viên (TVV)</th><th className="border-b border-slate-600 px-4 py-3 text-center"><div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">Chỉ số Động lực<button type="button" aria-label="Giải thích Chỉ số Động lực" onClick={() => setGuideTopic("morale")} className="rounded p-0.5 text-slate-400 transition-colors hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"><Info size={14} aria-hidden="true" /></button></div></th><th className="border-b border-slate-600 px-4 py-3"><div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">Cấu trúc Nhịp đập<button type="button" aria-label="Giải thích Cấu trúc Nhịp đập" onClick={() => setGuideTopic("pillars")} className="rounded p-0.5 text-slate-400 transition-colors hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"><Info size={14} aria-hidden="true" /></button></div><span className="block text-[9px] font-normal text-slate-400">Học tập · Gắn kết · Thực chiến</span></th><th className="border-b border-slate-600 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Chuỗi</th><th className="border-b border-slate-600 px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Doanh số</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{report.rows.length ? report.rows.map((row) => { const totalActivity = row.pillars.learn + row.pillars.engage + row.pillars.execute; const moraleTone = row.moraleScore >= 80 ? "border-emerald-500 bg-emerald-50 text-emerald-600" : row.moraleScore >= 50 ? "border-amber-500 bg-amber-50 text-amber-600" : "border-rose-500 bg-rose-50 text-rose-600"; return <tr key={row.userId} className="transition-colors hover:bg-slate-50"><td className="px-4 py-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-black text-[#0B1431]">{row.displayName.slice(0, 1).toUpperCase()}</span><div><p className="text-[13px] font-bold text-[#0B1431]">{row.displayName}</p>{row.status === "false_productivity" && <p className="text-[10px] font-bold text-rose-600">Cảnh báo năng suất ảo</p>}</div></div></td><td className="px-4 py-3 text-center"><span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-[3px] text-[12px] font-black ${moraleTone}`}>{row.moraleScore}</span></td><td className="px-4 py-3"><div className="mb-1 text-[11px] font-bold text-slate-600"><span className="text-blue-500" title="Học tập">{row.pillars.learn}</span> · <span className="text-amber-500" title="Gắn kết">{row.pillars.engage}</span> · <span className="text-emerald-600" title="Thực chiến">{row.pillars.execute}</span><span className="ml-2 text-slate-400">Tổng: {totalActivity}</span></div><div className="flex h-2 w-full max-w-[150px] overflow-hidden rounded-full bg-slate-100"><span style={{ width: `${totalActivity ? row.pillars.learn / totalActivity * 100 : 0}%` }} className="bg-blue-400" /><span style={{ width: `${totalActivity ? row.pillars.engage / totalActivity * 100 : 0}%` }} className="bg-amber-400" /><span style={{ width: `${totalActivity ? row.pillars.execute / totalActivity * 100 : 0}%` }} className="bg-emerald-500" /></div></td><td className="px-4 py-3 text-center"><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${row.observedStreak ? "bg-orange-100 text-orange-600" : "bg-rose-100 text-rose-600"}`}>Chuỗi {row.observedStreak} ngày</span></td><td className="px-4 py-3 text-[13px] font-black text-emerald-600">{currency(row.selfReportedRevenue)}</td></tr>; }) : <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">Chưa có dữ liệu TVV trong Team cho phạm vi đã chọn.</td></tr>}</tbody></table></div><p className="mt-2 text-[11px] text-slate-500">Chỉ số Động lực = chuỗi nhịp quan sát và nhịp phản hồi gần đây. Ba trụ cột được phân loại từ activity events thật; doanh số là số liệu TVV tự khai báo khi ghi hoạt động đạt kết quả.</p></section>

            <section className="relative mt-10 overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0B1431] to-slate-900 p-6 text-white shadow-2xl sm:p-8"><Sparkles aria-hidden="true" className="absolute -right-4 -top-4 h-36 w-36 text-white opacity-5" /><h2 className="relative z-10 mb-6 flex items-center gap-3 border-b border-white/10 pb-4 text-[17px] font-black uppercase tracking-widest sm:text-[18px]"><span className="rounded-lg bg-blue-500/20 p-2 text-blue-400"><Sparkles size={20} aria-hidden="true" /></span>Tham mưu Chiến lược từ Copilot</h2><div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2"><div className="space-y-6"><div><h3 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400"><span className="h-px w-4 bg-slate-500" />1. Bức tranh Tổng thể</h3><p className="text-[14px] font-medium leading-relaxed text-slate-200">{copilotInsights.macroSummary.revenueText}<br /><span className={copilotInsights.macroSummary.healthAlert ? "font-bold text-rose-400" : "font-bold text-emerald-400"}>{copilotInsights.macroSummary.healthText}</span></p></div><div><h3 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400"><span className="h-px w-4 bg-slate-500" />2. Tương quan Nỗ lực & Kết quả</h3><p className="rounded-xl border border-white/10 bg-white/5 p-4 text-[14px] font-medium leading-relaxed text-slate-200">{copilotInsights.correlationText}</p></div></div><div><h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400"><span className="h-px w-4 bg-slate-500" />3. Hành động Trọng tâm</h3><div className="space-y-3">{reportAlerts.length ? reportAlerts.map((alert, index) => <StrategicAlert key={`${alert.title}-${index}`} alert={alert} />) : <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-[13px] text-slate-400">Team đang giữ nhịp ổn định. Tiếp tục vinh danh các nỗ lực nhỏ để giữ lửa.</div>}</div></div></div></section>
            <section className="mt-9 rounded-[20px] border-2 border-amber-100 bg-amber-50/60 p-6"><h2 className="flex items-center gap-2 text-[15px] font-black uppercase tracking-widest text-[#0B1431]"><HeartHandshake size={18} className="text-amber-500" />Nỗ lực Quản trị · Coaching ROI</h2><p className="mt-2 text-[11px] leading-relaxed text-slate-500">Chỉ phản ánh ca hỗ trợ và kết quả đo đã ghi nhận; không suy diễn nguyên nhân hay hiển thị dữ liệu khách hàng.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><MetricCard label="Tổng ca hỗ trợ" value={watchlist.totalInterventions.toLocaleString("vi-VN")} detail="Intervention không bị hủy" tone="amber" /><MetricCard label="TVV phục hồi" value={watchlist.recoveredCount.toLocaleString("vi-VN")} detail={watchlist.measurableOutcomes ? `${watchlist.measurableOutcomes} ca đủ dữ liệu đo` : "Chưa đủ dữ liệu đo"} tone="emerald" /><MetricCard label="Tỷ lệ hồi sinh" value={watchlist.recoveryRate === null ? "—" : `${watchlist.recoveryRate}%`} detail={watchlist.recoveryRate === null ? "Chờ checkpoint outcome" : "Trên các ca có outcome đo được"} tone="slate" /></div></section>
          </>}
        </div>
      </section>
      <LeaderMetricsGuide isOpen={guideTopic !== null} onClose={() => setGuideTopic(null)} initialTab={guideTopic ?? "pillars"} />
    </div>
  );
}

function StrategicAlert({ alert }: { alert: CopilotAlert }) {
  const accent = alert.tone === "warning" ? "bg-amber-400/15 text-amber-300" : alert.tone === "danger" ? "bg-rose-400/15 text-rose-300" : "bg-emerald-400/15 text-emerald-300";
  const Icon = alert.tone === "warning" ? AlertTriangle : alert.tone === "danger" ? HeartCrack : Star;
  return <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 p-4 transition-colors hover:bg-white/[0.15]"><span className={`rounded-lg p-2 ${accent}`}><Icon size={17} aria-hidden="true" /></span><div><h4 className="mb-0.5 text-[13px] font-bold text-white">{alert.title}</h4><p className="text-[12px] leading-relaxed text-slate-300">{alert.text}</p></div></div>;
}

function MetricCard({ label, value, detail, tone, icon }: { label: string; value: string; detail: string; tone: "slate" | "amber" | "emerald"; icon?: React.ReactNode }) {
  const colors = tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-700" : tone === "emerald" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-[#0B1431]";
  return <article className={`rounded-2xl border p-5 ${colors}`}><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-wider">{label}</p>{icon}</div><strong className="mt-2 block text-[24px] font-black leading-none">{value}</strong><p className="mt-2 text-[11px] font-medium opacity-80">{detail}</p></article>;
}
