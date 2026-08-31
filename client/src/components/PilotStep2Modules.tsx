import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleUserRound,
  ClipboardCheck,
  Compass,
  Filter,
  HelpCircle,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Play,
  Radar,
  RefreshCw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { HeaderProfileWidget } from "./HeaderProfileWidget";
import {
  completePilotPasswordReset,
  conciseSignalContext,
  createPilotIntervention,
  fetchPilotOverview,
  fetchPilotSignals,
  fetchSignalEngineRuleConfigs,
  requestPilotPasswordReset,
  reviewPilotSignal,
  runPilotOutcomeEvaluator,
  runPilotSignalEngine,
  signInPilot,
  signOutPilot,
  subscribePilotPasswordRecovery,
  updateSignalEngineRuleConfigs,
  type PilotInterventionInput,
  type PilotOverview,
  type PilotRadarFilters,
  type PilotSession,
  type PilotSignalItem,
} from "../lib/supabaseContent";
import type {
  InterventionActionStatus,
  InterventionCheckpointDay,
  InterventionType,
  OutcomeEvaluatorRun,
  ReviewOutcome,
  SignalEngineRuleConfig,
  SignalEngineRun,
  SignalSeverity,
  SignalStatus,
} from "../lib/pilotTypes";

type PilotAuthControlProps = {
  session: PilotSession | null;
  error: string;
  userName?: string;
  userAvatar?: string;
  onOpenProfileSettings?: () => void;
  onSession: (session: PilotSession) => void;
  onError: (message: string) => void;
  onLoggedOut: () => void;
};

const roleLabel: Record<PilotSession["profile"]["role"], string> = {
  advisor: "TVV Pilot",
  director: "GA Director",
  leader: "Leader Pilot",
  super_admin: "Founder Pilot",
};

export function PilotAuthControl({
  session,
  error,
  userName,
  userAvatar,
  onOpenProfileSettings,
  onSession,
  onError,
  onLoggedOut,
}: PilotAuthControlProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  useEffect(() => subscribePilotPasswordRecovery(() => {
    setRecoveryOpen(true);
    setOpen(false);
    setResetCompleted(false);
    onError("");
  }), [onError]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const next = await signInPilot(email, password);
      onSession(next);
      setPassword("");
      setOpen(false);
    } catch (loginError) {
      onError(loginError instanceof Error ? loginError.message : "Không thể đăng nhập Pilot.");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await signOutPilot();
      onLoggedOut();
    } catch (logoutError) {
      onError(logoutError instanceof Error ? logoutError.message : "Không thể đăng xuất Pilot.");
    }
  };

  const requestReset = async () => {
    if (!email.trim()) return onError("Nhập Email Pilot trước khi yêu cầu reset mật khẩu.");
    setSaving(true);
    try {
      await requestPilotPasswordReset(email);
      setResetSent(true);
      onError("");
    } catch (resetError) {
      onError(resetError instanceof Error ? resetError.message : "Không thể gửi link reset mật khẩu.");
    } finally {
      setSaving(false);
    }
  };

  const completeReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (nextPassword !== confirmPassword) return onError("Xác nhận mật khẩu chưa khớp.");
    setSaving(true);
    try {
      await completePilotPasswordReset(nextPassword);
      setResetCompleted(true);
      setNextPassword("");
      setConfirmPassword("");
      onError("");
    } catch (resetError) {
      onError(resetError instanceof Error ? resetError.message : "Không thể hoàn tất đặt lại mật khẩu.");
    } finally {
      setSaving(false);
    }
  };

  if (session) {
    return (
      <HeaderProfileWidget
        onLogout={() => void logout()}
        onOpenSettings={onOpenProfileSettings ?? (() => undefined)}
        role={roleLabel[session.profile.role]}
        userAvatar={userAvatar}
        userName={userName || session.profile.display_name}
      />
    );
  }

  return (
    <>
      <button className="pilot-login-trigger cta-hover" onClick={() => setOpen(true)}>
        <LogIn size={15} />
        <span>Đăng nhập Pilot</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="pilot-auth-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form className="pilot-login-card" onSubmit={login} initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.98 }}>
              <button className="pilot-modal-close" type="button" onClick={() => setOpen(false)} aria-label="Đóng đăng nhập"><X size={18} /></button>
              <span><ShieldCheck size={15} />PILOT ACCESS</span>
              <h2>Đăng nhập<br /><em>Agent Copilot.</em></h2>
              <p>Dùng Email/Password đã được quản trị viên Pilot cấu hình. Quyền truy cập được kiểm tra từ hồ sơ Supabase.</p>
              <label>Email<input value={email} onChange={(event) => { setEmail(event.target.value); setResetSent(false); }} type="email" autoComplete="email" required /></label>
              <label>Mật khẩu<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required /></label>
              {error && <div className="pilot-auth-error"><AlertTriangle size={16} />{error}</div>}
              {resetSent && <div className="pilot-reset-success"><CheckCircle2 size={16} />Nếu Email thuộc Pilot, link đặt lại mật khẩu đã được gửi.</div>}
              <button className="cta-glow" disabled={saving}>{saving ? <><Loader2 size={16} className="spin" />Đang xác thực…</> : <><LogIn size={16} />Vào Pilot</>}</button>
              <button type="button" className="pilot-reset-trigger" disabled={saving} onClick={() => void requestReset()}>Quên mật khẩu? Gửi link reset</button>
            </motion.form>
          </motion.div>
        )}
        {recoveryOpen && (
          <motion.div className="pilot-auth-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form className="pilot-login-card pilot-reset-card" onSubmit={completeReset} initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.98 }}>
              <button className="pilot-modal-close" type="button" onClick={() => setRecoveryOpen(false)} aria-label="Đóng đặt lại mật khẩu"><X size={18} /></button>
              <span><ShieldCheck size={15} />PILOT ACCESS</span>
              <h2>Đặt lại<br /><em>mật khẩu Pilot.</em></h2>
              {resetCompleted ? (
                <div className="pilot-reset-success pilot-reset-complete"><CheckCircle2 size={18} /><div><strong>Mật khẩu đã được cập nhật.</strong><span>Bạn có thể đóng cửa sổ này và đăng nhập bằng mật khẩu mới.</span></div></div>
              ) : (
                <>
                  <p>Chọn mật khẩu mới có tối thiểu 8 ký tự. Liên kết reset chỉ hợp lệ trong phiên bảo mật hiện tại.</p>
                  <label>Mật khẩu mới<input value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label>
                  <label>Xác nhận mật khẩu<input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label>
                  {error && <div className="pilot-auth-error"><AlertTriangle size={16} />{error}</div>}
                  <button className="cta-glow" disabled={saving}>{saving ? <><Loader2 size={16} className="spin" />Đang cập nhật…</> : <><CheckCircle2 size={16} />Lưu mật khẩu mới</>}</button>
                </>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PilotAdvisorDailyStart({ session }: { session: PilotSession | null }) {
  if (!session || session.profile.role !== "advisor") return null;
  return <section className="pilot-advisor-start lift-card"><div><span><Activity size={15} />PILOT · NHỊP ĐẬP HÔM NAY</span><h2>Một hoạt động thật,<br /><em>một tín hiệu rõ.</em></h2><p>Mỗi Nhịp Đập được ghi vào `activity_events`; hành động Dời lịch tạo thêm Follow-up Zero-PII trong Team của bạn.</p></div></section>;
}

const interventionTypes: Array<{ value: InterventionType; label: string }> = [
  { value: "checkin", label: "Check-in" },
  { value: "coaching_1on1", label: "Coaching 1-1" },
  { value: "roleplay", label: "Roleplay" },
  { value: "goal_reset", label: "Điều chỉnh mục tiêu" },
  { value: "shadow_support", label: "Đi thực chiến cùng" },
  { value: "other", label: "Khác" },
];

type InterventionRecommendation = {
  title: string;
  tip: string;
  interventionType: InterventionType;
  tone: "yellow" | "orange" | "red" | "navy";
};

const interventionPlaybooks: Record<string, InterventionRecommendation> = {
  followup_gap: { title: "Check-in nhanh (SLA: 24h)", tip: "Nhắn 1 tin Zalo nhắc nhở nhẹ nhàng hoặc gửi kịch bản mẫu từ Content Library.", interventionType: "checkin", tone: "yellow" },
  followup_overdue: { title: "Check-in nhanh (SLA: 24h)", tip: "Nhắn 1 tin Zalo nhắc nhở nhẹ nhàng hoặc gửi kịch bản mẫu từ Content Library.", interventionType: "checkin", tone: "yellow" },
  activity_drop: { title: "Coaching 1:1 (SLA: 48h)", tip: "Mời cafe 15 phút, hỏi thăm tình hình cá nhân/vướng mắc.", interventionType: "coaching_1on1", tone: "orange" },
  low_activity: { title: "Coaching 1:1 (SLA: 48h)", tip: "Mời cafe 15 phút, hỏi thăm tình hình cá nhân/vướng mắc.", interventionType: "coaching_1on1", tone: "orange" },
  goal_deviation: { title: "Roleplay / Goal Reset (SLA: 72h)", tip: "Ngồi lại luyện tập kỹ năng chốt sale hoặc thiết lập lại mục tiêu khả thi hơn.", interventionType: "roleplay", tone: "red" },
};

const fallbackInterventionPlaybook: InterventionRecommendation = {
  title: "Check-in thấu cảm (SLA: 48h)",
  tip: "Trao đổi ngắn để làm rõ trở ngại trước khi chọn hình thức hỗ trợ phù hợp.",
  interventionType: "checkin",
  tone: "navy",
};

function interventionRecommendationFor(signal: PilotSignalItem) {
  const ruleKey = typeof signal.metadata.rule_key === "string" ? signal.metadata.rule_key : "";
  return interventionPlaybooks[ruleKey] ?? interventionPlaybooks[signal.signal_type] ?? fallbackInterventionPlaybook;
}

const statusLabels: Record<SignalStatus, string> = { new: "Mới", reviewed: "Đã review", dismissed: "Đã bỏ qua", acted_on: "Đã hành động" };
const severityLabels: Record<SignalSeverity, string> = { low: "Thấp", medium: "Trung bình", high: "Cao", critical: "Khẩn" };
const defaultRadarFilters: PilotRadarFilters = { status: "all", severity: "all", dateRange: "all" };

function isWithinDateRange(timestamp: string, range: PilotRadarFilters["dateRange"]) {
  if (range === "all") return true;
  const now = Date.now();
  const value = Date.parse(timestamp);
  const hours = range === "today" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  return Number.isFinite(value) && value >= now - hours * 60 * 60 * 1000;
}

export function SignalInterventionModal({ signal, onClose, onSaved, onError }: { signal: PilotSignalItem; onClose: () => void; onSaved: () => void; onError: (message: string) => void }) {
  const recommendation = interventionRecommendationFor(signal);
  const [interventionType, setInterventionType] = useState<InterventionType>(() => recommendation.interventionType);
  const [actionStatus, setActionStatus] = useState<Extract<InterventionActionStatus, "planned" | "done">>("planned");
  const [actionDate, setActionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rationale, setRationale] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rationale.trim().length < 4) return onError("Hãy ghi rationale ngắn, tối thiểu 4 ký tự.");
    setSaving(true);
    try {
      const input: PilotInterventionInput = { signal, interventionType, actionStatus, actionDate, rationale, note };
      await createPilotIntervention(input);
      onSaved();
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : "Không thể lưu Intervention.");
    } finally {
      setSaving(false);
    }
  };
  return <motion.div className="pilot-auth-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.form className="pilot-intervention-modal" onSubmit={submit} initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }}><button className="pilot-modal-close" type="button" onClick={onClose} aria-label="Đóng intervention"><X size={18} /></button><span><Target size={15} />LOG INTERVENTION</span><h2>{signal.advisor_display_name}</h2><p>{signal.summary}</p><section className={`pilot-copilot-recommendation tone-${recommendation.tone}`} aria-label="Khuyến nghị Copilot"><header><span><Sparkles size={15} />COPILOT RECOMMENDATION</span><strong>{recommendation.title}</strong></header><p>{recommendation.tip}</p><small>Gợi ý đã chọn sẵn trong danh sách bên dưới; Leader vẫn có thể đổi theo bối cảnh thực tế.</small></section><div className="pilot-intervention-grid"><label>Loại can thiệp<select value={interventionType} onChange={(event) => setInterventionType(event.target.value as InterventionType)}>{interventionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label><label>Trạng thái<select value={actionStatus} onChange={(event) => setActionStatus(event.target.value as Extract<InterventionActionStatus, "planned" | "done">)}><option value="planned">Đã lên lịch</option><option value="done">Đã hoàn thành</option></select></label></div><label>Ngày hành động<input type="date" value={actionDate} onChange={(event) => setActionDate(event.target.value)} required /></label><label>Rationale ngắn<textarea value={rationale} onChange={(event) => setRationale(event.target.value)} maxLength={2000} placeholder="VD: Check-in 15 phút để làm rõ trở ngại follow-up." required /></label><label>Ghi chú <small>không bắt buộc</small><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} placeholder="Không nhập PII khách hàng." /></label><button className="cta-glow" disabled={saving}>{saving ? <><Loader2 size={16} className="spin" />Đang lưu…</> : <><CheckCircle2 size={16} />Lưu Intervention</>}</button></motion.form></motion.div>;
}

export function PilotRadar({ session, onToast, onCreateMoment }: { session: PilotSession | null; onToast: (message: string) => void; onCreateMoment?: (agentName: string) => void }) {
  const [signals, setSignals] = useState<PilotSignalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<PilotSignalItem | null>(null);
  const [filters, setFilters] = useState<PilotRadarFilters>(defaultRadarFilters);
  const reload = async () => {
    setLoading(true);
    try { setSignals(await fetchPilotSignals()); setError(""); }
    catch (fetchError) { setError(fetchError instanceof Error ? fetchError.message : "Không thể đọc Radar Pilot."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, [session?.userId]);
  const visibleSignals = useMemo(() => signals.filter((signal) => (
    (filters.status === "all" || signal.status === filters.status)
    && (filters.severity === "all" || signal.severity === filters.severity)
    && isWithinDateRange(signal.detected_at, filters.dateRange)
  )), [filters, signals]);
  const review = async (signal: PilotSignalItem, outcome: ReviewOutcome) => {
    try { await reviewPilotSignal(signal.id, outcome); await reload(); onToast(outcome === "relevant" ? "Đã đánh dấu tín hiệu Relevant." : outcome === "not_relevant" ? "Đã dismiss tín hiệu không phù hợp." : "Đã ghi nhận cần thêm ngữ cảnh."); }
    catch (reviewError) { onToast(reviewError instanceof Error ? reviewError.message : "Không thể review tín hiệu."); }
  };
  if (!session || session.profile.role === "advisor") return <section className="radar-empty lift-card"><LockKeyhole size={24} /><div><span>PILOT ACCESS</span><h3>Radar cần tài khoản Leader hoặc Super Admin.</h3><p>Đăng nhập đúng role để xem các tín hiệu thật trong phạm vi Team được RLS cho phép.</p></div></section>;
  return <>
    <section className="empathy-radar pilot-radar">
      <div className="radar-section-head">
        <div>
          <span><Radar size={15} />LEADER RADAR · LIVE</span>
          <div className="flex items-center gap-2">
            <h2>Đọc tín hiệu, <em>chạm đúng lúc.</em></h2>
            <div className="relative group inline-block z-[100] ml-3">
              <button type="button" aria-label="Xem Cẩm nang Radar" className="p-2 rounded-full hover:bg-amber-100 transition"><HelpCircle size={18} className="text-amber-700" /></button>
              <div role="tooltip" className="absolute top-full mt-2 right-0 w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 p-4">
                <h3 className="font-bold text-amber-900 mb-2 border-b pb-2">📖 Cách dùng Radar</h3>
                <ul className="text-sm text-amber-800 space-y-2"><li><strong>1. Quét:</strong> Ưu tiên thẻ màu Đỏ/Cam.</li><li><strong>2. Chạm:</strong> Gọi điện/Cafe gỡ rối tâm lý.</li><li><strong>3. Ghi Nhận:</strong> Bấm &quot;Ghi nhận hỗ trợ&quot; để đo lường.</li></ul>
              </div>
            </div>
          </div>
          <p>Ưu tiên tín hiệu mới, sau đó sắp xếp theo thời điểm phát hiện.</p>
        </div>
        <button className="report-trigger cta-glow" onClick={() => void reload()}><RefreshCw size={16} />Làm mới Radar</button>
      </div>
      <section className="pilot-radar-filter" aria-label="Bộ lọc Radar"><div><Filter size={16} /><strong>Lọc tín hiệu</strong></div><label>Trạng thái<select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as PilotRadarFilters["status"] }))}><option value="all">Tất cả</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Mức độ<select value={filters.severity} onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value as PilotRadarFilters["severity"] }))}><option value="all">Tất cả</option>{Object.entries(severityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Khoảng thời gian<select value={filters.dateRange} onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value as PilotRadarFilters["dateRange"] }))}><option value="all">Tất cả</option><option value="today">24 giờ</option><option value="7d">7 ngày</option><option value="30d">30 ngày</option></select></label><button className="pilot-filter-reset" onClick={() => setFilters(defaultRadarFilters)}>Xóa lọc</button></section>
      {loading && <div className="pilot-loading"><Loader2 className="spin" size={18} />Đang đồng bộ tín hiệu Pilot…</div>}
      {error && <div className="pilot-data-error"><AlertTriangle size={17} />{error}</div>}
      {!loading && !error && !signals.length && <div className="radar-empty lift-card"><Sparkles size={24} /><div><span>RADAR SẠCH</span><h3>Chưa có tín hiệu cần review.</h3><p>Khi server tạo Signal mới cho Team, chúng sẽ hiện ở đây theo thứ tự ưu tiên.</p></div></div>}
      {!loading && !error && signals.length > 0 && !visibleSignals.length && <div className="radar-empty lift-card"><Filter size={24} /><div><span>KHÔNG CÓ KẾT QUẢ</span><h3>Không có Signal khớp bộ lọc hiện tại.</h3><p>Thử mở rộng trạng thái, mức độ hoặc khoảng thời gian để xem lại dữ liệu trong Team.</p><button className="pilot-empty-reset" onClick={() => setFilters(defaultRadarFilters)}>Hiển thị tất cả Signal</button></div></div>}
      <div className="pilot-signal-list">{visibleSignals.map((signal) => { const context = conciseSignalContext(signal.metadata); return <article className={`pilot-signal-card lift-card severity-${signal.severity}`} key={signal.id}><header><div><span>{statusLabels[signal.status].toUpperCase()} · {severityLabels[signal.severity]}</span><h3>{signal.advisor_display_name}</h3></div><time>{new Date(signal.detected_at).toLocaleString("vi-VN")}</time></header><h4>{signal.signal_type.replaceAll("_", " ")}</h4><p>{signal.summary}</p>{context && <small><Compass size={14} />{context}</small>}<div className="pilot-signal-actions"><button onClick={() => void review(signal, "relevant")}>Relevant</button><button onClick={() => void review(signal, "not_relevant")}>Not relevant</button><button onClick={() => void review(signal, "need_more_context")}>Thêm ngữ cảnh</button><button type="button" className="bg-violet-100 text-violet-700 hover:bg-violet-600 hover:text-white border border-violet-300 font-bold py-1.5 px-3 rounded-md transition-colors shadow-sm inline-flex items-center gap-1" onClick={() => onCreateMoment?.(signal.advisor_display_name)}><Sparkles size={15} />Tạo thẻ vinh danh</button><button className="bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-300 font-bold py-1.5 px-3 rounded-md transition-colors shadow-sm inline-flex items-center gap-1" onClick={() => setSelectedSignal(signal)}><Send size={15} />Ghi nhận hỗ trợ</button></div></article>; })}</div>
    </section>
    <AnimatePresence>{selectedSignal && <SignalInterventionModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} onError={onToast} onSaved={() => { setSelectedSignal(null); void reload(); onToast("Đã lưu Intervention và cập nhật trạng thái Signal."); }} />}</AnimatePresence>
  </>;
}

const ruleTitles: Record<SignalEngineRuleConfig["rule_key"], string> = {
  activity_drop: "Activity drop",
  followup_gap: "Follow-up gap",
};

function SignalEngineControl({ onUpdate }: { onUpdate: () => void }) {
  const [configs, setConfigs] = useState<SignalEngineRuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<SignalEngineRun | null>(null);
  const load = async () => {
    setLoading(true);
    try {
      setConfigs(await fetchSignalEngineRuleConfigs());
    } catch (engineError) {
      setNotice(engineError instanceof Error ? engineError.message : "Không thể tải cấu hình Signal Engine.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);
  const patchConfig = (ruleKey: SignalEngineRuleConfig["rule_key"], patch: Partial<SignalEngineRuleConfig>) => setConfigs((current) => current.map((config) => config.rule_key === ruleKey ? { ...config, ...patch } : config));
  const saveConfigs = async () => {
    setSaving(true);
    try {
      await updateSignalEngineRuleConfigs(configs.map(({ rule_key, is_enabled, evaluation_window_hours, severity, threshold_version }) => ({ rule_key, is_enabled, evaluation_window_hours: Math.max(1, Math.min(24 * 365, Math.round(evaluation_window_hours || 1))), severity, threshold_version })));
      await load();
      setNotice("Đã lưu ngưỡng Signal Engine. Lần chạy tiếp theo sẽ dùng cấu hình mới.");
    } catch (engineError) {
      setNotice(engineError instanceof Error ? engineError.message : "Không thể lưu cấu hình Signal Engine.");
    } finally {
      setSaving(false);
    }
  };
  const run = async () => {
    setSaving(true);
    try {
      const nextResult = await runPilotSignalEngine(dryRun);
      setResult(nextResult);
      setNotice(dryRun ? `Dry-run hoàn tất: ${nextResult.candidate_count} ứng viên, chưa tạo Signal.` : `Đã chạy engine: tạo ${nextResult.created_count} Signal mới.`);
      onUpdate();
    } catch (engineError) {
      setNotice(engineError instanceof Error ? engineError.message : "Không thể chạy Signal Engine.");
    } finally {
      setSaving(false);
    }
  };
  return <section className="signal-engine-control lift-card"><header><div><span><Settings2 size={15} />SIGNAL ENGINE V1</span><h2>Dry-run trước,<br /><em>tạo Signal sau.</em></h2><p>Engine chạy trong Postgres qua RPC bảo vệ bằng Super Admin role. UI chỉ gửi lệnh, không tự tính Signal.</p></div><button className="pilot-icon-refresh" onClick={() => void load()} aria-label="Làm mới cấu hình Signal Engine"><RefreshCw size={16} /></button></header>{loading ? <div className="pilot-loading"><Loader2 className="spin" size={17} />Đang tải ngưỡng dry-run…</div> : <><div className="signal-engine-rule-grid">{configs.map((config) => <article key={config.rule_key}><div className="signal-rule-head"><div><strong>{ruleTitles[config.rule_key]}</strong><small>v{config.threshold_version}</small></div><label className="signal-rule-toggle"><input type="checkbox" checked={config.is_enabled} onChange={(event) => patchConfig(config.rule_key, { is_enabled: event.target.checked })} /><span aria-hidden="true" />Bật</label></div><label>Cửa sổ đánh giá (giờ)<input inputMode="numeric" value={config.evaluation_window_hours} onChange={(event) => patchConfig(config.rule_key, { evaluation_window_hours: Number(event.target.value.replace(/[^0-9]/g, "")) || 1 })} min={1} max={8760} /></label><label>Mức độ<select value={config.severity} onChange={(event) => patchConfig(config.rule_key, { severity: event.target.value as SignalSeverity })}>{Object.entries(severityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></article>)}</div><div className="signal-engine-actions"><label className="signal-dry-run"><input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} /><span aria-hidden="true" /><div><strong>Chế độ dry-run</strong><small>Chỉ đếm ứng viên; không ghi Signal.</small></div></label><button className="pilot-secondary-action" disabled={saving || !configs.length} onClick={() => void saveConfigs()}>Lưu ngưỡng</button><button className="cta-glow" disabled={saving || !configs.length} onClick={() => void run()}>{saving ? <><Loader2 size={16} className="spin" />Đang chạy…</> : <><Play size={16} />{dryRun ? "Chạy dry-run" : "Chạy Signal Engine"}</>}</button></div>{notice && <div className="signal-engine-notice"><CheckCircle2 size={16} />{notice}</div>}{result && <div className="signal-engine-result"><span>LẦN CHẠY GẦN NHẤT</span><strong>{result.dry_run ? "Dry-run" : "Đã áp dụng"}</strong><p>{result.activity_drop_candidates} activity drop · {result.followup_gap_candidates} follow-up gap · {result.created_count} Signal đã tạo</p></div>}</>}</section>;
}

function OutcomeEvaluatorControl({ onUpdate }: { onUpdate: () => void }) {
  const [checkpointDay, setCheckpointDay] = useState<InterventionCheckpointDay>("d1");
  const [checkpointHours, setCheckpointHours] = useState(24);
  const [dryRun, setDryRun] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<OutcomeEvaluatorRun | null>(null);
  const run = async () => {
    setSaving(true);
    try {
      const nextResult = await runPilotOutcomeEvaluator(checkpointDay, checkpointHours, dryRun);
      setResult(nextResult);
      setNotice(dryRun ? `Dry-run Outcome: ${nextResult.candidate_count} can thiệp đủ checkpoint, chưa ghi Outcome.` : `Outcome Engine đã ghi ${nextResult.created_count} kết quả checkpoint mới.`);
      onUpdate();
    } catch (engineError) {
      setNotice(engineError instanceof Error ? engineError.message : "Không thể chạy Outcome Evaluator.");
    } finally {
      setSaving(false);
    }
  };
  return <section className="outcome-evaluator-control lift-card"><header><div><span><ClipboardCheck size={15} />OUTCOME EVALUATOR V1</span><h2>Đo hồi phục sau,<br /><em>khép vòng can thiệp.</em></h2><p>Server chỉ đánh giá hoạt động mới hoặc Follow-up hoàn tất sau ngày hành động; không đọc dữ liệu định danh khách hàng.</p></div></header><div className="outcome-evaluator-fields"><label>Checkpoint<select value={checkpointDay} onChange={(event) => setCheckpointDay(event.target.value as InterventionCheckpointDay)}><option value="d1">D1</option><option value="d7">D7</option><option value="d14">D14</option><option value="d30">D30</option></select></label><label>Ngưỡng đánh giá (giờ)<input inputMode="numeric" value={checkpointHours} onChange={(event) => setCheckpointHours(Number(event.target.value.replace(/[^0-9]/g, "")) || 1)} min={1} max={8760} /></label></div><div className="outcome-evaluator-actions"><label className="signal-dry-run"><input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} /><span aria-hidden="true" /><div><strong>Chế độ dry-run</strong><small>Chỉ đo ứng viên và kết quả dự kiến; không ghi Outcome.</small></div></label><button className="cta-glow" disabled={saving} onClick={() => void run()}>{saving ? <><Loader2 size={16} className="spin" />Đang đánh giá…</> : <><Play size={16} />{dryRun ? "Chạy dry-run Outcome" : "Chạy Outcome Engine"}</>}</button></div>{notice && <div className="signal-engine-notice"><CheckCircle2 size={16} />{notice}</div>}{result && <div className="signal-engine-result"><span>LẦN ĐÁNH GIÁ GẦN NHẤT</span><strong>{result.checkpoint_day.toUpperCase()} · {result.checkpoint_hours} giờ · {result.dry_run ? "Dry-run" : "Đã áp dụng"}</strong><p>{result.recovered_count} recovered · {result.not_recovered_count} not recovered · {result.created_count} Outcome đã ghi</p></div>}</section>;
}

export function FounderPilotOverview({ session }: { session: PilotSession | null }) {
  const [overview, setOverview] = useState<PilotOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      setOverview(await fetchPilotOverview());
      setError("");
    } catch (overviewError) {
      setError(overviewError instanceof Error ? overviewError.message : "Không thể tải Founder Overview.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, [session?.userId]);
  if (!session || session.profile.role !== "super_admin") return <section className="radar-empty lift-card"><LockKeyhole size={24} /><div><span>FOUNDER ONLY</span><h3>Founder Overview chỉ dành cho Super Admin.</h3><p>Đăng nhập đúng role để xem vận hành Pilot đa Team.</p></div></section>;
  if (loading) return <div className="pilot-loading"><Loader2 className="spin" size={18} />Đang tổng hợp vận hành Pilot…</div>;
  if (error || !overview) return <div className="pilot-data-error"><AlertTriangle size={17} />{error || "Không có dữ liệu Pilot."}</div>;
  const metrics = [{ label: "Team active", value: overview.activeTeams, icon: Users }, { label: "Advisor active", value: overview.totalAdvisors, icon: CircleUserRound }, { label: "Signal mới tuần", value: overview.newSignalsThisWeek, icon: Radar }, { label: "Intervention tuần", value: overview.interventionsThisWeek, icon: Target }, { label: "Review tuần", value: overview.signalReviewsThisWeek, icon: CheckCircle2 }];
  const handledPercentage = overview.openSignals + overview.actedOnSignals ? Math.round(overview.actedOnSignals / (overview.openSignals + overview.actedOnSignals) * 100) : 0;
  return <section className="founder-overview screen-enter"><header className="founder-overview-head"><div><span><ShieldCheck size={15} />FOUNDER PILOT OVERVIEW</span><h1>Vận hành Pilot,<br /><em>không phải sales deck.</em></h1><p>Tổng hợp đa Team theo quyền Super Admin và các query tuân thủ RLS.</p></div><button className="cta-hover" onClick={() => void load()}><Activity size={16} />Làm mới</button></header><div className="founder-metric-grid">{metrics.map(({ label, value, icon: Icon }) => <article className="lift-card" key={label}><Icon size={18} /><strong>{value}</strong><span>{label}</span></article>)}</div><section className="founder-signal-status lift-card"><div><span>TRẠNG THÁI SIGNAL</span><h2>{overview.openSignals} đang mở · <em>{overview.actedOnSignals} đã hành động</em></h2></div><div><i style={{ width: `${handledPercentage}%` }} /></div></section><SignalEngineControl onUpdate={load} /><OutcomeEvaluatorControl onUpdate={load} /><section className="founder-team-list"><div><span>BREAKDOWN THEO TEAM</span><h2>Scope hiện tại.</h2></div>{overview.teams.map((team) => <article className="lift-card" key={team.id}><div><strong>{team.name}</strong><span>{team.status}</span></div><p><b>{team.newSignals}</b> Signal mới · <b>{team.actedOnSignals}</b> đã hành động</p></article>)}</section></section>;
}
