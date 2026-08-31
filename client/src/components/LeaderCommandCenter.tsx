import { Activity, AlertTriangle, ArrowUpRight, BookOpenCheck, Calendar, CheckCircle2, Download, Flame, HeartHandshake, Info, LifeBuoy, Loader2, MessageCircleHeart, Sparkles, Target, Trophy, Users } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { fetchLeaderGoalRadarSnapshot, fetchLeaderTeamReport, fetchPilotSignals, fetchTeamGiftRecipients, fetchTeamRecoveryWatchlist, type LeaderGoalRadarSnapshot, type LeaderTeamReport, type PilotSession, type PilotSignalItem, type TeamGiftRecipient, type TeamRecoveryWatchlist } from "../lib/supabaseContent";
import LeaderExecutiveReport from "./LeaderExecutiveReport";
import LeaderMetricsGuide, { type LeaderMetricTopic } from "./LeaderMetricsGuide";
import LeaderWeeklyOracle from "./LeaderWeeklyOracle";
import { SignalInterventionModal } from "./PilotStep2Modules";

type RangeKey = "today" | "7d" | "30d";
type LeaderCommandCenterProps = {
  session: PilotSession | null;
  onToast: (message: string) => void;
  onCreateMoment?: (agent: { id: string; displayName: string }) => void;
  onOpenGoalSettings?: () => void;
};

const rangeOptions: Array<{ value: RangeKey; label: string; hours: number }> = [
  { value: "today", label: "24 giờ qua", hours: 24 },
  { value: "7d", label: "Tuần này", hours: 24 * 7 },
  { value: "30d", label: "30 ngày", hours: 24 * 30 },
];

const severityWeight = { critical: 0, high: 1, medium: 2, low: 3 } as const;

function isInRange(timestamp: string, range: RangeKey) {
  const option = rangeOptions.find((item) => item.value === range) ?? rangeOptions[1];
  const time = Date.parse(timestamp);
  return Number.isFinite(time) && time >= Date.now() - option.hours * 60 * 60 * 1000;
}

function empathyActionFor(signal: PilotSignalItem) {
  if (signal.signal_type === "followup_overdue") return { label: "Nhắc hẹn nhẹ nhàng", hint: "Mở Playbook để chọn lời nhắc phù hợp", icon: MessageCircleHeart, tone: "cyan" };
  if (signal.signal_type === "low_activity" || signal.signal_type === "streak_break") return { label: "Nhắn hỏi thăm & động viên", hint: "Ưu tiên check-in không phán xét", icon: HeartHandshake, tone: "rose" };
  if (signal.signal_type === "conversion_drop" || signal.signal_type === "high_rejection") return { label: "Gợi ý kịch bản cùng luyện", hint: "Mở Playbook coaching theo tình huống", icon: BookOpenCheck, tone: "amber" };
  return { label: "Mở Playbook hỗ trợ", hint: "Chọn hình thức đồng hành phù hợp", icon: LifeBuoy, tone: "cyan" };
}

function empathySignalLabel(signal: PilotSignalItem) {
  const metadata = signal.metadata ?? {};
  if (metadata.rule_key === "leader_goal_pace_v70") {
    const metric = metadata.metric_key;
    if (metric === "coaching_sessions") return "Low Coaching";
    if (metric === "active_rate") return "Active Rate cần hỗ trợ";
    if (metric === "recruitment_outreach") return "Tuyển dụng chậm nhịp";
    if (metric === "personal_income") return "Tiến độ làm gương";
    return "Mục tiêu quản trị lệch nhịp";
  }
  const labels: Partial<Record<PilotSignalItem["signal_type"], string>> = {
    low_activity: "Mất nhịp hoạt động",
    streak_break: "Chuỗi bị gián đoạn",
    followup_overdue: "Follow-up cần chạm",
    conversion_drop: "Cần gỡ vướng chuyển đổi",
    high_rejection: "Từ chối lặp lại",
  };
  return labels[signal.signal_type] ?? signal.signal_type.replaceAll("_", " ");
}

function severityTone(severity: PilotSignalItem["severity"]) {
  return severity === "critical" ? "rose" : severity === "high" ? "orange" : severity === "medium" ? "amber" : "cyan";
}

function watchlistSignalLabel(signalType: string) {
  return empathySignalLabel({ signal_type: signalType as PilotSignalItem["signal_type"] } as PilotSignalItem);
}

function watchlistStatus(recoveryStatus: TeamRecoveryWatchlist["items"][number]["recoveryStatus"]) {
  if (recoveryStatus === "recovered") return { label: "Đã có nhịp đập mới", tone: "emerald" };
  if (recoveryStatus === "not_recovered") return { label: "Cần hỗ trợ tiếp", tone: "rose" };
  if (recoveryStatus === "insufficient_data") return { label: "Chưa đủ dữ liệu đo", tone: "amber" };
  return { label: recoveryStatus === "monitoring" ? "Đang theo dõi" : "Chờ đo kết quả", tone: "amber" };
}

function GoalProgressTracker({ snapshot, onOpenGoalSettings }: { snapshot: LeaderGoalRadarSnapshot | null; onOpenGoalSettings?: () => void }) {
  const start = snapshot ? Date.parse(snapshot.monthStart) : Number.NaN;
  const end = snapshot ? Date.parse(snapshot.monthEnd) : Number.NaN;
  const elapsed = Number.isFinite(start) && Number.isFinite(end) && end > start ? Math.min(1, Math.max(0, (Date.now() - start) / (end - start))) : 0;
  const income = (amount: number) => `${Math.round(amount / 1_000_000).toLocaleString("vi-VN")}tr`;
  const metrics = snapshot ? [
    { label: "Thu nhập làm gương", actual: snapshot.actuals.personalIncome, goal: snapshot.goals.personalIncome, actualLabel: income(snapshot.actuals.personalIncome), goalLabel: income(snapshot.goals.personalIncome) },
    { label: "Tuyển dụng", actual: snapshot.actuals.recruitmentOutreach, goal: snapshot.goals.recruitmentOutreach, actualLabel: Math.round(snapshot.actuals.recruitmentOutreach).toLocaleString("vi-VN"), goalLabel: Math.round(snapshot.goals.recruitmentOutreach).toLocaleString("vi-VN") },
    { label: "Active Rate", actual: snapshot.actuals.activeRatePercent, goal: snapshot.goals.activeRatePercent, actualLabel: `${Math.round(snapshot.actuals.activeRatePercent)}%`, goalLabel: `${Math.round(snapshot.goals.activeRatePercent)}%` },
    { label: "Ca Coaching", actual: snapshot.actuals.coachingSessions, goal: snapshot.goals.coachingSessions, actualLabel: Math.round(snapshot.actuals.coachingSessions).toLocaleString("vi-VN"), goalLabel: Math.round(snapshot.goals.coachingSessions).toLocaleString("vi-VN") },
  ] : [];
  return <section className="rounded-[24px] border border-indigo-100 bg-white p-5 shadow-sm" aria-label="Tiến Độ Mục Tiêu Quản Trị"><header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600"><Target size={13} />MỤC TIÊU LEADER · KHÔNG PHẢI TÍN HIỆU TEAM</span><h2 className="mt-1 text-[18px] font-black text-[#0B1431]">Tiến Độ Mục Tiêu Quản Trị</h2><p className="mt-1 text-[13px] font-medium text-slate-500">Theo dõi bốn cam kết của Leader, tách biệt hoàn toàn với Radar hỗ trợ TVV.</p></div>{onOpenGoalSettings && <button type="button" onClick={onOpenGoalSettings} className="inline-flex items-center justify-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-600 hover:text-white"><Target size={14} />Điều chỉnh mục tiêu</button>}</header>{metrics.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => { const ratio = metric.goal > 0 ? Math.max(0, Math.min(1, metric.actual / metric.goal)) : 0; const slow = metric.goal > 0 && ratio + 0.08 < elapsed; const status = metric.goal <= 0 ? "Chưa thiết lập" : slow ? "Đang chậm nhịp" : "Đúng tiến độ"; return <article key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5"><div className="flex items-start justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{metric.label}</span><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-black ${status === "Đang chậm nhịp" ? "bg-rose-100 text-rose-700" : status === "Đúng tiến độ" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{status}</span></div><strong className="mt-3 block text-[22px] font-black text-[#0B1431]">{metric.actualLabel}<span className="text-sm text-slate-400"> / {metric.goalLabel}</span></strong><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><i className={`block h-full rounded-full ${status === "Đang chậm nhịp" ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${Math.round(ratio * 100)}%` }} /></div><p className="mt-2 text-[10px] font-medium text-slate-500">{Math.round(ratio * 100)}% mục tiêu tháng · mốc thời gian {Math.round(elapsed * 100)}%</p></article>; })}</div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Chưa có mục tiêu tháng để theo dõi. Hãy thiết lập bốn trụ cột trước.</div>}</section>;
}

export default function LeaderCommandCenter({ session, onToast, onCreateMoment, onOpenGoalSettings }: LeaderCommandCenterProps) {
  const [range, setRange] = useState<RangeKey>("7d");
  const [report, setReport] = useState<LeaderTeamReport | null>(null);
  const [signals, setSignals] = useState<PilotSignalItem[]>([]);
  const [goalRadar, setGoalRadar] = useState<LeaderGoalRadarSnapshot | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamGiftRecipient[]>([]);
  const [watchlist, setWatchlist] = useState<TeamRecoveryWatchlist>({ totalInterventions: 0, recoveredCount: 0, measurableOutcomes: 0, recoveryRate: null, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<PilotSignalItem | null>(null);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [guideTopic, setGuideTopic] = useState<LeaderMetricTopic | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const nextGoalRadar = session?.profile.role === "leader" || session?.profile.role === "director"
        ? await fetchLeaderGoalRadarSnapshot()
        : null;
      const [nextReport, nextSignals, nextMembers, nextWatchlist] = await Promise.all([fetchLeaderTeamReport(), fetchPilotSignals({ evaluateGoals: false }), fetchTeamGiftRecipients(), fetchTeamRecoveryWatchlist()]);
      setReport(nextReport);
      setSignals(nextSignals);
      setGoalRadar(nextGoalRadar);
      setTeamMembers(nextMembers);
      setWatchlist(nextWatchlist);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đồng bộ Command Center.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, [session?.userId]);

  const visibleSignals = useMemo(() => signals.filter((signal) => isInRange(signal.detected_at, range)), [range, signals]);
  const teamSignals = useMemo(() => {
    const advisorIds = new Set(teamMembers.filter((member) => member.role === "advisor").map((member) => member.id));
    return visibleSignals.filter((signal) => signal.user_id !== session?.userId && advisorIds.has(signal.user_id) && signal.metadata?.rule_key !== "leader_goal_pace_v70");
  }, [session?.userId, teamMembers, visibleSignals]);
  const prioritizedSignals = useMemo(() => teamSignals
    .filter((signal) => signal.status !== "dismissed" && signal.status !== "acted_on")
    .sort((left, right) => severityWeight[left.severity] - severityWeight[right.severity] || Date.parse(right.detected_at) - Date.parse(left.detected_at))
    .slice(0, 3), [teamSignals]);
  const atRiskSignals = teamSignals.filter((signal) => signal.status !== "dismissed" && signal.status !== "acted_on");
  const advisorCount = Math.max(report?.activeAdvisors ?? 0, teamMembers.filter((member) => member.role === "advisor").length);
  const activeCount = Math.min(report?.activeAdvisors ?? 0, advisorCount);
  const activeRatio = advisorCount ? Math.round((activeCount / advisorCount) * 100) : 0;
  const followupBase = (report?.completedFollowupsThisWeek ?? 0) + (report?.openFollowups ?? 0);
  const followupCompletion = followupBase ? Math.round(((report?.completedFollowupsThisWeek ?? 0) / followupBase) * 100) : 0;
  const processedSignals = teamSignals.filter((signal) => signal.status === "acted_on").length;
  const processedRatio = teamSignals.length ? Math.round((processedSignals / teamSignals.length) * 100) : 0;
  const moraleScore = advisorCount ? Math.round(activeRatio * 0.6 + followupCompletion * 0.25 + processedRatio * 0.15) : 0;
  const criticalSignalCount = atRiskSignals.filter((signal) => signal.severity === "critical").length;

  const matrixPeople = useMemo(() => {
    const grouped = new Map<string, { name: string; effort: number; outcomes: number; criticality: number }>();
    for (const signal of teamSignals) {
      const current = grouped.get(signal.user_id) ?? { name: signal.advisor_display_name, effort: 0, outcomes: 0, criticality: 0 };
      const activityCount = typeof signal.metadata.activity_count === "number" ? signal.metadata.activity_count : 0;
      current.effort += Math.max(0, activityCount);
      current.outcomes += signal.status === "acted_on" ? 1 : 0;
      current.criticality += 4 - severityWeight[signal.severity];
      grouped.set(signal.user_id, current);
    }
    const values = [...grouped.values()];
    const effortMax = Math.max(1, ...values.map((item) => item.effort));
    const outcomeMax = Math.max(1, ...values.map((item) => item.outcomes));
    return values.map((item) => {
      const effortPercent = item.effort ? Math.max(18, Math.min(88, Math.round((item.effort / effortMax) * 80 + 8))) : 18;
      const outcomePercent = item.outcomes ? Math.max(18, Math.min(88, Math.round((item.outcomes / outcomeMax) * 80 + 8))) : Math.max(16, 54 - item.criticality * 5);
      const category = effortPercent >= 55 && outcomePercent >= 55 ? "Ngôi sao" : effortPercent >= 55 ? "Cần coaching" : outcomePercent >= 55 ? "Cần định hướng" : "Cần check-in";
      const tone = category === "Ngôi sao" ? "emerald" : category === "Cần coaching" ? "amber" : category === "Cần check-in" ? "rose" : "cyan";
      return { ...item, effortPercent, outcomePercent, category, tone };
    }).slice(0, 8);
  }, [teamSignals]);

  if (!session || session.profile.role === "advisor") return null;

  const metrics = [
    { label: "Năng lượng Team", value: `${activeCount}/${advisorCount}`, suffix: "TVV giữ nhịp", detail: `${activeRatio}% trong phạm vi Team`, icon: Flame, tone: "orange", guideTopic: "energy" as const },
    { label: "Chỉ số Động lực", value: `${moraleScore}%`, suffix: "Sức khỏe nhịp Team", detail: "Nhịp · follow-up · tín hiệu đã xử lý", icon: HeartHandshake, tone: "emerald", guideTopic: "morale" as const },
    { label: "Cần Thấu Cảm", value: atRiskSignals.length.toLocaleString("vi-VN"), suffix: "TVV cần chạm", detail: `Trong ${rangeOptions.find((item) => item.value === range)?.label.toLowerCase()}`, icon: AlertTriangle, tone: "rose", guideTopic: "empathy" as const },
    { label: "Kết quả Team", value: (report?.completedFollowupsThisWeek ?? 0).toLocaleString("vi-VN"), suffix: "Follow-up hoàn tất", detail: "Kết quả từ sự bền bỉ", icon: Trophy, tone: "navy", guideTopic: null },
    { label: "Ngân sách Động viên", value: `${Math.max(0, session.profile.xp_balance).toLocaleString("vi-VN")} XP`, suffix: "Sẵn sàng tặng thưởng", detail: "Quỹ Leader không ảnh hưởng điểm thành tích", icon: Sparkles, tone: "orange", guideTopic: null },
  ] as const;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 bg-slate-50/70 pb-8 font-sans" aria-label="Leader Command Center">
      <header className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#0B1431] p-2.5 text-white"><Activity size={20} /></div>
          <div><h1 className="text-[20px] font-black leading-none tracking-tight text-[#0B1431]">Radar Thấu Cảm & Hiệu Suất</h1><p className="mt-1 text-[13px] font-medium text-slate-500">Đo nỗ lực để chọn đúng hỗ trợ, không ép KPI.</p></div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex-none"><Calendar size={16} className="text-slate-500" /><select value={range} onChange={(event) => setRange(event.target.value as RangeKey)} className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-[#0B1431] outline-none"><option value="today">24 giờ qua</option><option value="7d">Tuần này</option><option value="30d">30 ngày</option></select></label>
          <button type="button" onClick={() => setGuideTopic("matrix")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" aria-label="Mở Từ điển Tham mưu"><Info size={17} /></button><button type="button" onClick={() => setIsOracleOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.02] hover:from-blue-500 hover:to-indigo-500 sm:flex-none sm:text-[14px]" aria-label="Mở Leader Weekly Oracle"><Sparkles size={18} /><span>Bắt Tín Hiệu</span></button><button type="button" onClick={() => setIsExecutiveReportOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all hover:from-amber-600 hover:to-orange-600 sm:flex-none sm:text-[14px]"><Download size={16} />Xuất Báo Cáo</button>
        </div>
      </header>

      {loading ? <div className="flex min-h-48 items-center justify-center gap-2 rounded-[24px] border border-slate-100 bg-white text-slate-500"><Loader2 className="animate-spin" size={18} />Đang tổng hợp dữ liệu Team…</div> : error ? <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-5 text-rose-700"><AlertTriangle className="mr-2 inline" size={17} />{error}</div> : <>
        <GoalProgressTracker snapshot={goalRadar} onOpenGoalSettings={onOpenGoalSettings} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {metrics.map(({ label, value, suffix, detail, icon: Icon, tone, guideTopic: metricGuideTopic }) => <article key={label} className={`relative overflow-hidden rounded-[22px] border p-4 shadow-sm ${tone === "navy" ? "border-[#0B1431] bg-[#0B1431]" : tone === "rose" ? "border-rose-100 bg-white" : tone === "emerald" ? "border-emerald-100 bg-white" : "border-orange-100 bg-white"}`}><div className="flex items-start justify-between gap-3"><div><p className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${tone === "navy" ? "text-slate-300" : "text-slate-500"}`}>{label}{metricGuideTopic && <button type="button" onClick={() => setGuideTopic(metricGuideTopic)} aria-label={`Giải thích ${label}`} className="rounded p-0.5 hover:bg-slate-100 hover:text-[#0B1431]"><Info size={12} /></button>}</p><strong className={`mt-2 block text-[28px] font-black leading-none ${tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-600" : tone === "navy" ? "text-white" : "text-[#0B1431]"}`}>{value}</strong><p className={`mt-1 text-[11px] font-black ${tone === "rose" ? "text-rose-500" : tone === "emerald" ? "text-emerald-500" : tone === "navy" ? "text-amber-400" : "text-orange-600"}`}>{suffix}</p><p className={`mt-1 text-[10px] font-medium ${tone === "navy" ? "text-slate-300" : "text-slate-500"}`}>{detail}</p></div><div className={`rounded-xl p-2.5 ${tone === "rose" ? "bg-rose-100 text-rose-600" : tone === "emerald" ? "bg-emerald-100 text-emerald-600" : tone === "navy" ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-orange-100 text-orange-600"}`}><Icon size={18} /></div></div></article>)}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"><header className="mb-4 flex items-end justify-between gap-3"><div><div className="flex items-center gap-1"><h2 className="text-[18px] font-black text-[#0B1431]">Ma Trận Hiệu Suất</h2><button type="button" onClick={() => setGuideTopic("matrix")} aria-label="Giải thích Ma trận Hiệu suất" className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-500"><Info size={15} /></button></div><p className="mt-1 text-[13px] font-medium text-slate-500">Nỗ lực vs. Kết quả giúp Leader gỡ vướng thay vì phán xét.</p></div><span className="rounded-lg bg-cyan-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-700">{matrixPeople.length} TVV có Signal</span></header><div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-70"><div className="border-b border-r border-slate-200 bg-emerald-50/60" /><div className="border-b border-slate-200 bg-cyan-50/60" /><div className="border-r border-slate-200 bg-rose-50/60" /><div className="bg-amber-50/60" /></div><span className="absolute left-3 top-1/2 -rotate-90 text-[9px] font-black uppercase tracking-widest text-slate-400">Kết quả hỗ trợ</span><span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-400">Nỗ lực · nhịp · chuỗi</span>{matrixPeople.length ? matrixPeople.map((person) => <div key={person.name} className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${person.effortPercent}%`, top: `${100 - person.outcomePercent}%` }}><div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-xs font-black shadow-lg ${person.tone === "emerald" ? "border-emerald-500 text-emerald-700" : person.tone === "amber" ? "border-amber-500 text-amber-700" : person.tone === "rose" ? "border-rose-500 text-rose-700" : "border-cyan-500 text-cyan-700"}`}>{person.name.slice(0, 1).toUpperCase()}</div><span className="mt-1 max-w-24 truncate rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold shadow-sm">{person.category}</span></div>) : <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"><CheckCircle2 className="text-emerald-500" size={28} /><strong className="mt-2 text-sm text-[#0B1431]">Chưa có Signal trong phạm vi đã chọn.</strong><p className="mt-1 text-xs text-slate-500">Ma trận sẽ xuất hiện khi Engine ghi nhận tín hiệu Team thật.</p></div>}</div></section>

      <section className="flex min-h-[360px] flex-col rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"><header className="mb-4 flex items-end justify-between gap-3"><div><div className="flex items-center gap-1"><h2 className="text-[18px] font-black text-[#0B1431]">Tín Hiệu Radar</h2><button type="button" onClick={() => setGuideTopic("radar")} aria-label="Giải thích Tín hiệu Radar" className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Info size={15} /></button></div><p className="mt-1 text-[13px] font-medium text-slate-500">Chỉ hiển thị TVV trong Team cần được hỏi thăm và gỡ vướng.</p></div><span className="rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-black text-rose-600">{atRiskSignals.length} TVV CẦN HỖ TRỢ</span></header><div className="flex flex-1 flex-col gap-3 overflow-y-auto">{prioritizedSignals.length ? prioritizedSignals.map((signal) => { const tone = severityTone(signal.severity); const action = empathyActionFor(signal); const ActionIcon = action.icon; return <article key={signal.id} className={`relative overflow-hidden rounded-2xl border p-3 ${tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "orange" ? "border-orange-200 bg-orange-50" : tone === "amber" ? "border-amber-200 bg-amber-50" : "border-cyan-200 bg-cyan-50"}`}><div className={`absolute inset-y-0 left-0 w-1 ${tone === "rose" ? "bg-rose-500" : tone === "orange" ? "bg-orange-500" : tone === "amber" ? "bg-amber-500" : "bg-cyan-500"}`} /><div className="pl-1"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${tone === "rose" ? "animate-pulse bg-rose-500" : tone === "orange" ? "bg-orange-500" : tone === "amber" ? "bg-amber-500" : "bg-cyan-500"}`} /><span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{empathySignalLabel(signal)}</span></div><div className="mt-2 flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1431] text-xs font-black text-white" aria-label={`Avatar ${signal.advisor_display_name}`}>{signal.advisor_display_name.slice(0, 1).toUpperCase()}</span><h3 className="line-clamp-1 text-[14px] font-black text-[#0B1431]">{signal.advisor_display_name}</h3></div><p className="mt-2 line-clamp-2 text-[12px] leading-5 text-slate-600">{signal.summary}</p><p className="mt-2 text-[10px] font-bold text-slate-500">{action.hint}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => setSelectedSignal(signal)} className="flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"><ActionIcon size={14} />Hỗ trợ TVV này 🤝</button>{onCreateMoment && <button type="button" onClick={() => onCreateMoment({ id: signal.user_id, displayName: signal.advisor_display_name })} className="rounded-xl border border-violet-200 bg-white px-2 text-violet-700 hover:bg-violet-600 hover:text-white" aria-label={`Tạo thẻ vinh danh cho ${signal.advisor_display_name}`}><Sparkles size={14} /></button>}</div></div></article>; }) : <div className="flex flex-1 flex-col items-center justify-center text-center"><CheckCircle2 className="text-emerald-500" size={28} /><strong className="mt-2 text-sm text-[#0B1431]">Radar đang sạch.</strong><p className="mt-1 text-xs text-slate-500">Chưa có TVV nào có tín hiệu ưu tiên trong phạm vi đã chọn.</p></div>}</div></section>
        </div>
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><header className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-black uppercase tracking-wide text-slate-800">Tiến độ Phục hồi (Watchlist)</h2><p className="mt-1 text-xs text-slate-500">Theo dõi kết quả từ các ca coaching và hỗ trợ gần nhất của Team.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${watchlist.recoveryRate === null ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{watchlist.recoveryRate === null ? "Chờ đủ dữ liệu đo" : `Tỷ lệ hồi sinh đã đo: ${watchlist.recoveryRate}%`}</span></header><div className="overflow-x-auto"><table className="w-full min-w-[660px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="pb-3 font-bold">Thành viên</th><th className="pb-3 font-bold">Vấn đề (Tín hiệu)</th><th className="pb-3 font-bold">Hành động của bạn</th><th className="pb-3 font-bold">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-50">{watchlist.items.length ? watchlist.items.map((item) => { const status = watchlistStatus(item.recoveryStatus); return <tr key={item.id} className="group transition-colors hover:bg-slate-50"><td className="py-3 font-bold text-slate-700">{item.memberName}</td><td className="py-3 text-slate-500"><p className="font-medium">{watchlistSignalLabel(item.signalType)}</p><p className="mt-0.5 max-w-xs truncate text-[11px] text-slate-400">{item.signalSummary}</p></td><td className="py-3 text-slate-600"><p className="capitalize">{item.interventionType.replaceAll("_", " ")}</p><p className="mt-0.5 text-[11px] text-slate-400">{item.actionDate ? new Date(`${item.actionDate}T00:00:00Z`).toLocaleDateString("vi-VN") : "Chưa đặt ngày"}</p></td><td className="py-3"><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${status.tone === "emerald" ? "bg-emerald-50 text-emerald-600" : status.tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}><i className={`h-1.5 w-1.5 rounded-full ${status.tone === "emerald" ? "bg-emerald-500" : status.tone === "rose" ? "bg-rose-500" : "animate-pulse bg-amber-500"}`} />{status.label}</span></td></tr>; }) : <tr><td colSpan={4} className="py-8 text-center text-xs text-slate-400">Chưa có ca hỗ trợ trong Watchlist Team.</td></tr>}</tbody></table></div><p className="mt-3 text-[10px] text-slate-400">{watchlist.totalInterventions} ca hỗ trợ · {watchlist.recoveredCount} ca phục hồi được ghi nhận · {watchlist.measurableOutcomes} ca đủ dữ liệu đo</p></section>
      </>}
      <AnimatePresence>{selectedSignal && <SignalInterventionModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} onError={onToast} onSaved={() => { setSelectedSignal(null); void reload(); onToast("Đã lưu hỗ trợ và cập nhật Radar."); }} />}</AnimatePresence>
      <LeaderExecutiveReport isOpen={isExecutiveReportOpen} onClose={() => setIsExecutiveReportOpen(false)} hours={rangeOptions.find((item) => item.value === range)?.hours ?? 24 * 7} rangeLabel={rangeOptions.find((item) => item.value === range)?.label ?? "Tuần này"} onToast={onToast} />
      <LeaderWeeklyOracle isOpen={isOracleOpen} onClose={() => setIsOracleOpen(false)} teamData={{ moraleScore, activeRatio, followupCompletion, atRiskCount: atRiskSignals.length, criticalSignalCount }} />
      <LeaderMetricsGuide isOpen={guideTopic !== null} onClose={() => setGuideTopic(null)} initialTab={guideTopic ?? "matrix"} />
    </section>
  );
}
