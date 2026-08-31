import React, { useEffect, useMemo, useRef, useState } from "react";
import { Award, BarChart3, CheckCircle2, CircleUserRound, Coins, Gift, Loader2, Plus, RefreshCw, ShieldCheck, Sparkles, UserCog, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  completeAdvisorOnboarding,
  adminFundLeader,
  createAdminTeamReward,
  createPilotManagedAccount,
  fetchAdminTeamRewards,
  fetchPilotManagedAccounts,
  fetchPilotManagementTeams,
  fetchPilotMeasurementScorecard,
  fetchRewardRedemptionRequests,
  fetchTeamGiftRecipients,
  giftTeamXp,
  updatePilotManagedAccount,
  type PilotManagedAccount,
  type PilotManagementTeam,
  type PilotMeasurementScorecard,
  type PilotSession,
  type RewardRedemptionRequest,
  type XpReward,
  type TeamGiftRecipient,
} from "../lib/supabaseContent";

type GiftModalProps = { open: boolean; onClose: () => void; onCompleted: (gift: Awaited<ReturnType<typeof giftTeamXp>>) => void; session?: PilotSession | null };
const premiumControlStyle = { width: "100%", boxSizing: "border-box" as const, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#0f172a", fontSize: "0.875rem", outline: "none" };
const premiumLabelStyle = { display: "block", marginBottom: "0.5rem", color: "#334155", fontSize: "0.875rem", fontWeight: 700 };
const premiumButtonStyle = { width: "100%", border: 0, backgroundColor: "#f59e0b", color: "#ffffff", fontSize: "0.9375rem", fontWeight: 800, borderRadius: "0.75rem", padding: "0.875rem 1rem", boxShadow: "0 8px 18px rgba(245, 158, 11, .25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.5rem" };
const premiumGuideCardStyle = { display: "flex", gap: "1rem", alignItems: "flex-start", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "0.75rem", padding: "1rem" };
export function GlobalGiftXpModal({ open, onClose, onCompleted, session = null }: GiftModalProps) {
  const [recipients, setRecipients] = useState<TeamGiftRecipient[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("20");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [flyingXP, setFlyingXP] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLeader = session?.profile.role === "leader";
  const roleDescription = isLeader
    ? "Điểm được trừ từ quỹ Leader. Không ảnh hưởng điểm cá nhân của bạn."
    : "Lưu ý: Điểm sẽ được trừ trực tiếp từ quỹ XP thành tích cá nhân của bạn.";
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useEffect(() => {
    if (!open) return;
    setNotice("");
    void fetchTeamGiftRecipients().then((items) => { setRecipients(items); setRecipientId(items[0]?.id ?? ""); }).catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Không thể tải đồng đội trong Team."));
  }, [open]);
  const closeModal = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setRecipientId("");
    setAmount("20");
    setNote("");
    setNotice("");
    setLoading(false);
    setFlyingXP(null);
    onClose();
  };
  const sendGift = async () => {
    if (flyingXP !== null) return;
    const xp = Math.round(Number(amount));
    if (!recipientId || !Number.isFinite(xp) || xp < 1 || xp > 5000 || note.trim().length < 4) { setNotice("Chọn người nhận, nhập 1–5.000 XP và lời vinh danh tối thiểu 4 ký tự."); return; }
    setLoading(true);
    try {
      const result = await giftTeamXp(recipientId, xp, note, false);
      setNotice(`Đã tặng ${xp} XP. Quỹ còn lại: ${result.giverRemainingXpBudget.toLocaleString("vi-VN")} XP.`);
      setFlyingXP(xp);
      closeTimer.current = setTimeout(() => {
        closeTimer.current = null;
        setFlyingXP(null);
        onCompleted(result);
        closeModal();
      }, 1500);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tặng XP lúc này."); }
    finally { setLoading(false); }
  };
  if (!open) return null;
  return <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 99998, backgroundColor: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} role="presentation">
    <div className="absolute inset-0" style={{ position: "absolute", inset: 0 }} data-testid="gift-xp-backdrop" onClick={closeModal} />
    <section style={{ position: "relative", zIndex: 99999, backgroundColor: "#ffffff", width: "100%", maxWidth: "28rem", borderRadius: "1.5rem", padding: "1.5rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.22)", display: "flex", flexDirection: "column", gap: "1.25rem" }} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-5" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="global-gift-title">
      <header className="flex items-start justify-between border-b border-slate-200 pb-3" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.875rem" }}>
        <div><span className="flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-amber-600" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#d97706", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em" }}><Award size={15} />TẶNG ĐIỂM TOÀN TEAM</span><h2 id="global-gift-title" className="mt-2 text-2xl font-extrabold text-slate-900" style={{ margin: "0.5rem 0 0", color: "#0f172a", fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 800 }}>Tặng XP Động Viên</h2><p className="mt-2 text-sm leading-6 text-slate-500" style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>{roleDescription}</p></div>
        <button type="button" className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" style={{ flex: "0 0 auto", border: 0, borderRadius: "0.75rem", padding: "0.625rem", backgroundColor: "#f8fafc", color: "#64748b", cursor: "pointer" }} aria-label="Đóng Tặng Điểm" onClick={closeModal}><X size={20} /></button>
      </header>
      <div className="flex flex-col gap-2" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div><label className="text-sm font-bold text-slate-700" style={premiumLabelStyle} htmlFor="gift-recipient">Đồng đội nhận XP</label><select id="gift-recipient" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" style={premiumControlStyle} value={recipientId} onChange={(event) => setRecipientId(event.target.value)}>{recipients.length ? recipients.map((recipient) => <option value={recipient.id} key={recipient.id}>{recipient.displayName} · {recipient.role === "leader" ? "Leader" : "TVV"}</option>) : <option value="">Chưa có đồng đội trong Team</option>}</select></div>
        <div><label className="text-sm font-bold text-slate-700" style={premiumLabelStyle} htmlFor="gift-amount">Số XP</label><input id="gift-amount" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" style={premiumControlStyle} inputMode="numeric" min={1} max={5000} value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))} /></div>
        <div><label className="text-sm font-bold text-slate-700" style={premiumLabelStyle} htmlFor="gift-note">Lời vinh danh</label><textarea id="gift-note" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all min-h-28 resize-y" style={{ ...premiumControlStyle, minHeight: "7rem", resize: "vertical" }} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi nhận một đóng góp cụ thể, không chứa thông tin khách hàng." maxLength={240} /></div>
        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", border: "1px solid #f1f5f9", borderRadius: "1rem", backgroundColor: "#f8fafc", padding: "1rem", color: "#334155" }}><Gift size={18} className="mt-0.5 shrink-0 text-amber-600" /><span><strong style={{ display: "block", color: "#0f172a", fontWeight: 800 }}>Ghi nhận riêng tư trong Team</strong><small style={{ display: "block", marginTop: "0.25rem", color: "#64748b", lineHeight: 1.45 }}>Điểm và lời vinh danh đi qua Sổ cái XP; hệ thống không tự tạo bài viết Cộng Đồng.</small></span></div>
        <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60" style={premiumButtonStyle} disabled={loading || !recipients.length || flyingXP !== null} onClick={() => void sendGift()}>{loading ? <><Loader2 className="spin" size={16} />Đang ghi nhận…</> : <><Coins size={16} />Tặng Điểm</>}</button>
        {notice && <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800" style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #a7f3d0", borderRadius: "0.75rem", backgroundColor: "#ecfdf5", padding: "0.75rem", color: "#065f46", fontSize: "0.875rem" }}><CheckCircle2 size={16} />{notice}</p>}
      </div>
      {flyingXP !== null && <><style>{`@keyframes gift-xp-fly { 0% { opacity: 0; transform: translateY(20px) scale(.88); } 18% { opacity: 1; transform: translateY(0) scale(1.08); } 100% { opacity: 0; transform: translateY(-110px) scale(1); } }`}</style><div data-testid="gift-xp-flyup" aria-live="polite" style={{ position: "absolute", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ animation: "gift-xp-fly 1.5s cubic-bezier(0.23, 1, 0.32, 1) both", color: "#d97706", fontSize: "2rem", fontWeight: 800, textShadow: "0 8px 20px rgba(217, 119, 6, .28)" }}>+{flyingXP} XP</span></div></>}
    </section>
  </div>;
}

export function AdvisorQuickGuide({ session, onCompleted }: { session: PilotSession | null; onCompleted: (completedAt: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const onboardingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setDismissed(false), [session?.userId, session?.profile.onboarding_completed_at]);
  useEffect(() => {
    const eligible = Boolean(session && session.profile.role === "advisor" && !session.profile.onboarding_completed_at && !dismissed);
    if (!eligible) { setIsOpen(false); return; }
    onboardingTimer.current = setTimeout(() => { setIsOpen(true); onboardingTimer.current = null; }, 2500);
    return () => { if (onboardingTimer.current) clearTimeout(onboardingTimer.current); onboardingTimer.current = null; };
  }, [dismissed, session?.profile.onboarding_completed_at, session?.profile.role, session?.userId]);
  const complete = async () => { setSaving(true); try { onCompleted(await completeAdvisorOnboarding()); setDismissed(true); } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể hoàn tất hướng dẫn."); } finally { setSaving(false); } };
  const closeGuide = () => { setSaving(false); setError(""); setIsOpen(false); setDismissed(true); };
  if (!isOpen) return null;
  return <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 99998, backgroundColor: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} role="presentation">
    <div className="absolute inset-0" style={{ position: "absolute", inset: 0 }} data-testid="advisor-guide-backdrop" onClick={closeGuide} />
    <section style={{ position: "relative", zIndex: 99999, backgroundColor: "#ffffff", width: "100%", maxWidth: "28rem", borderRadius: "1.5rem", padding: "1.5rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.22)", display: "flex", flexDirection: "column", gap: "1.25rem" }} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-5" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="advisor-guide-title">
      <header className="flex items-start justify-between border-b border-slate-200 pb-3" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.875rem" }}>
        <div><span className="flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-amber-600" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#d97706", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em" }}><Sparkles size={15} />KHỞI ĐẦU TVV</span><h2 id="advisor-guide-title" className="mt-2 text-2xl font-extrabold text-slate-900" style={{ margin: "0.5rem 0 0", color: "#0f172a", fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 800 }}>Ba nhịp đầu tiên cho một tuần rõ ràng.</h2><p className="mt-2 text-sm leading-6 text-slate-500" style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>Không có áp lực KPI. Chỉ có những bước nhỏ có thể kiểm soát.</p></div>
        <button type="button" className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" style={{ flex: "0 0 auto", border: 0, borderRadius: "0.75rem", padding: "0.625rem", backgroundColor: "#f8fafc", color: "#64748b", cursor: "pointer" }} aria-label="Đóng hướng dẫn" onClick={closeGuide}><X size={20} /></button>
      </header>
      <div className="flex flex-col gap-3" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}><div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100" style={premiumGuideCardStyle}><b style={{ display: "flex", width: "2.25rem", height: "2.25rem", flex: "0 0 auto", alignItems: "center", justifyContent: "center", borderRadius: "0.75rem", backgroundColor: "#fef3c7", color: "#b45309", fontSize: "0.875rem", fontWeight: 800 }}>01</b><div><strong style={{ display: "block", color: "#0f172a", fontWeight: 800 }}>Ghi Nhịp Đập</strong><span style={{ display: "block", marginTop: "0.25rem", color: "#64748b", fontSize: "0.875rem", lineHeight: 1.45 }}>Lưu hành động và lịch Follow-up không định danh.</span></div></div><div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100" style={premiumGuideCardStyle}><b style={{ display: "flex", width: "2.25rem", height: "2.25rem", flex: "0 0 auto", alignItems: "center", justifyContent: "center", borderRadius: "0.75rem", backgroundColor: "#fef3c7", color: "#b45309", fontSize: "0.875rem", fontWeight: 800 }}>02</b><div><strong style={{ display: "block", color: "#0f172a", fontWeight: 800 }}>Xem Mục Tiêu</strong><span style={{ display: "block", marginTop: "0.25rem", color: "#64748b", fontSize: "0.875rem", lineHeight: 1.45 }}>Biết số cuộc gặp cần tạo để tiến gần thu nhập mong muốn.</span></div></div><div className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100" style={premiumGuideCardStyle}><b style={{ display: "flex", width: "2.25rem", height: "2.25rem", flex: "0 0 auto", alignItems: "center", justifyContent: "center", borderRadius: "0.75rem", backgroundColor: "#fef3c7", color: "#b45309", fontSize: "0.875rem", fontWeight: 800 }}>03</b><div><strong style={{ display: "block", color: "#0f172a", fontWeight: 800 }}>Tương tác Cộng Đồng</strong><span style={{ display: "block", marginTop: "0.25rem", color: "#64748b", fontSize: "0.875rem", lineHeight: 1.45 }}>Chia sẻ, động viên và ghi nhận đồng đội trong Team.</span></div></div></div>
      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60" style={premiumButtonStyle} disabled={saving} onClick={() => void complete()}>{saving ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}Bắt đầu hành trình</button>{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800" style={{ border: "1px solid #fecaca", borderRadius: "0.75rem", backgroundColor: "#fef2f2", padding: "0.75rem", color: "#991b1b", fontSize: "0.875rem" }}>{error}</p>}
    </section>
  </div>;
}

type FormState = { email: string; password: string; displayName: string; role: "super_admin" | "director" | "leader" | "advisor"; teamId: string; xpBalance: string; isActive: boolean };
const freshForm = (): FormState => ({ email: "", password: "", displayName: "", role: "advisor", teamId: "", xpBalance: "500", isActive: true });
function scorePercent(value: number) { return `${Math.max(0, Math.min(100, value))}%`; }

function RewardRedemptionRequestList() {
  const [requests, setRequests] = useState<RewardRedemptionRequest[]>([]);
  useEffect(() => { void fetchRewardRedemptionRequests().then(setRequests).catch(() => setRequests([])); }, []);
  return <section className="step5-journey lift-card" aria-label="Yêu cầu đổi quà"><div className="step5-section-head"><div><span><Award size={14} />YÊU CẦU ĐỔI QUÀ</span><h3>Chờ xử lý từ TVV</h3></div></div>{requests.length ? <div className="step5-journey-list">{requests.map((request) => <article key={request.id}><div><strong>{request.requester}</strong><span>{new Date(request.createdAt).toLocaleString("vi-VN")}</span></div><p><b>{request.rewardName}</b> · {request.xpCost.toLocaleString("vi-VN")} XP · {request.status}</p></article>)}</div> : <div className="step5-empty"><Award size={22} /><strong>Chưa có yêu cầu đổi quà</strong><span>Các yêu cầu mới sẽ xuất hiện tại đây ngay sau khi TVV đổi quà.</span></div>}</section>;
}

function CentralBankAndRewards({ accounts, teams, onRefresh }: { accounts: PilotManagedAccount[]; teams: PilotManagementTeam[]; onRefresh: () => Promise<void> }) {
  const [leaderId, setLeaderId] = useState("");
  const [amount, setAmount] = useState("5000");
  const [reason, setReason] = useState("");
  const [funding, setFunding] = useState(false);
  const [rewards, setRewards] = useState<XpReward[]>([]);
  const [rewardName, setRewardName] = useState("");
  const [rewardType, setRewardType] = useState("Voucher / Quà tặng");
  const [rewardXp, setRewardXp] = useState("500");
  const [rewardTeamId, setRewardTeamId] = useState("");
  const [savingReward, setSavingReward] = useState(false);
  const [notice, setNotice] = useState("");
  const leaders = accounts.filter((account) => account.role === "leader" && account.isActive);
  const loadRewards = async () => { try { setRewards(await fetchAdminTeamRewards()); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tải kho quà."); } };
  useEffect(() => { setLeaderId((current) => leaders.some((leader) => leader.id === current) ? current : leaders[0]?.id ?? ""); }, [accounts]);
  useEffect(() => { void loadRewards(); }, []);
  const fund = async () => {
    const xp = Math.round(Number(amount));
    if (!leaderId || !Number.isFinite(xp) || xp < 1 || xp > 50000 || reason.trim().length < 3) { setNotice("Chọn Leader, nhập 1–50.000 XP và lý do tối thiểu 3 ký tự không chứa PII."); return; }
    setFunding(true); setNotice("");
    try { const result = await adminFundLeader({ leaderId, amount: xp, reason }); setReason(""); await onRefresh(); setNotice(`Đã cấp ${xp.toLocaleString("vi-VN")} XP. Quỹ Leader hiện là ${result.newBalance.toLocaleString("vi-VN")} XP.`); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Không thể cấp ngân sách."); }
    finally { setFunding(false); }
  };
  const createReward = async () => {
    const xpCost = Math.round(Number(rewardXp));
    if (!rewardTeamId || rewardName.trim().length < 3 || !Number.isFinite(xpCost) || xpCost < 1) { setNotice("Nhập tên quà, XP hợp lệ và chọn Team áp dụng."); return; }
    setSavingReward(true); setNotice("");
    try { const created = await createAdminTeamReward({ name: rewardName, rewardType, xpCost, teamId: rewardTeamId }); setRewards((current) => [...current, created]); setRewardName(""); setRewardXp("500"); setNotice(`Đã thêm “${created.name}” vào kho quà Team.`); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Không thể thêm quà Team."); }
    finally { setSavingReward(false); }
  };
  return <section className="grid gap-5 lg:grid-cols-2" aria-label="Central Bank và cấu hình kho quà">
    <section className="lift-card rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-5 text-white shadow-sm">
      <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.16em] text-indigo-200"><Coins size={14} />CENTRAL BANK · SUPER ADMIN</span>
      <h3 className="mt-2 text-xl font-black">Cấp ngân sách cho Leader</h3><p className="mt-1 text-sm leading-5 text-indigo-100">Ghi tăng quỹ qua Sổ cái XP, có kiểm tra role, trạng thái hoạt động và Zero-PII.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-indigo-100">Leader<select value={leaderId} onChange={(event) => setLeaderId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-amber-300">{leaders.length ? leaders.map((leader) => <option key={leader.id} value={leader.id} className="text-slate-900">{leader.displayName} · {leader.teamName}</option>) : <option value="" className="text-slate-900">Chưa có Leader hoạt động</option>}</select></label><label className="text-xs font-bold text-indigo-100">Số XP<input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-amber-300" /></label></div>
      <label className="mt-3 block text-xs font-bold text-indigo-100">Lý do không định danh<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={240} placeholder="Ví dụ: Phân bổ quỹ hoạt động tháng" className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-indigo-200 outline-none focus:ring-2 focus:ring-amber-300" /></label>
      <button type="button" onClick={() => void fund()} disabled={funding || !leaders.length} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"><Coins size={17} />{funding ? "Đang cấp quỹ…" : "Thực thi giao dịch"}</button>
    </section>
    <section className="lift-card rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.16em] text-indigo-600"><Gift size={14} />CẤU HÌNH KHO QUÀ · TEAM</span><h3 className="mt-2 text-xl font-black text-slate-900">Thêm quà theo workspace</h3><p className="mt-1 text-sm leading-5 text-slate-500">Quà chỉ hiển thị trong Team đã chọn; không lưu thông tin khách hàng.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-700">Tên quà<input value={rewardName} onChange={(event) => setRewardName(event.target.value)} maxLength={100} placeholder="Ví dụ: Voucher cà phê" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label><label className="text-xs font-bold text-slate-700">Team<select value={rewardTeamId} onChange={(event) => setRewardTeamId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="">Chọn Team áp dụng</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label className="text-xs font-bold text-slate-700">Loại quà<input value={rewardType} onChange={(event) => setRewardType(event.target.value)} maxLength={40} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label><label className="text-xs font-bold text-slate-700">Giá XP<input value={rewardXp} onChange={(event) => setRewardXp(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label></div>
      <button type="button" onClick={() => void createReward()} disabled={savingReward} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><Plus size={17} />{savingReward ? "Đang thêm quà…" : "Thêm vào kho quà Team"}</button>
      <div className="mt-4 max-h-32 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">{rewards.length ? rewards.slice(-5).reverse().map((reward) => <div key={reward.code} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0"><span className="truncate text-xs font-bold text-slate-700">{reward.name}</span><span className="shrink-0 text-[11px] font-black text-indigo-600">{reward.xp_cost.toLocaleString("vi-VN")} XP</span></div>) : <p className="text-xs text-slate-500">Chưa có dữ liệu kho quà.</p>}</div>
    </section>
    {notice && <p className="lg:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{notice}</p>}
  </section>;
}

export function SuperAdminBusinessPanel({ session }: { session: PilotSession | null }) {
  const [scorecard, setScorecard] = useState<PilotMeasurementScorecard | null>(null);
  const [accounts, setAccounts] = useState<PilotManagedAccount[]>([]);
  const [teams, setTeams] = useState<PilotManagementTeam[]>([]);
  const [form, setForm] = useState<FormState>(freshForm);
  const [editing, setEditing] = useState<PilotManagedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const load = async () => { setLoading(true); try { const [nextScorecard, nextAccounts, nextTeams] = await Promise.all([fetchPilotMeasurementScorecard(), fetchPilotManagedAccounts(), fetchPilotManagementTeams()]); setScorecard(nextScorecard); setAccounts(nextAccounts); setTeams(nextTeams); setForm((current) => ({ ...current, teamId: current.teamId || nextTeams[0]?.id || "" })); setNotice(""); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tải Measurement Layer."); } finally { setLoading(false); } };
  useEffect(() => { if (session?.profile.role === "super_admin") void load(); }, [session?.userId, session?.profile.role]);
  useEffect(() => { if (/^(Không thể|Dữ liệu|Email|Team được|Chỉ Super Admin|Hãy đăng nhập)/.test(notice)) toast.error(notice); }, [notice]);
  useEffect(() => {
    if (loading || !session || session.profile.role !== "super_admin") return;
    const roleSelect = Array.from(document.querySelectorAll<HTMLSelectElement>(".step5-user-management select")).find((select) => select.closest("label")?.textContent?.trim().startsWith("Vai trò"));
    if (!roleSelect) return;
    if (!Array.from(roleSelect.options).some((option) => option.value === "director")) {
      const directorOption = document.createElement("option");
      directorOption.value = "director";
      directorOption.text = "Director (Giám đốc GA)";
      roleSelect.insertBefore(directorOption, Array.from(roleSelect.options).find((option) => option.value === "leader") ?? null);
    }
    const editingOwnAccount = Boolean(editing && editing.id === session.userId);
    roleSelect.disabled = editingOwnAccount;
    roleSelect.classList.toggle("disabled:bg-slate-100", editingOwnAccount);
    roleSelect.classList.toggle("disabled:text-slate-500", editingOwnAccount);
    roleSelect.value = form.role;
    const existingLockHint = roleSelect.parentElement?.querySelector<HTMLElement>(".step5-self-role-lock");
    if (editingOwnAccount && !existingLockHint) {
      const hint = document.createElement("p");
      hint.className = "step5-self-role-lock mt-1 text-[10px] font-bold text-rose-500";
      hint.textContent = "*Khóa an toàn: Bạn không thể tự thay đổi vai trò của chính mình.";
      roleSelect.insertAdjacentElement("afterend", hint);
    } else if (!editingOwnAccount) existingLockHint?.remove();
    const teamSelect = Array.from(document.querySelectorAll<HTMLSelectElement>(".step5-user-management select")).find((select) => select !== roleSelect);
    if (teamSelect) teamSelect.setAttribute("aria-label", form.role === "director" ? "GA Team của Director" : "Team");
  }, [editing, form.role, loading, session]);
  if (!session || session.profile.role !== "super_admin") return null;
  const startEdit = (account: PilotManagedAccount) => { setEditing(account); setForm({ email: account.email, password: "", displayName: account.displayName, role: account.role === "director" ? "director" : account.role === "leader" ? "leader" : "advisor", teamId: account.teamId, xpBalance: String(account.xpBalance), isActive: account.isActive }); };
  const submit = async () => { const xpBalance = Math.max(0, Math.min(50_000, Math.round(Number(form.xpBalance) || 0))); if (!form.displayName.trim() || !form.teamId || (!editing && (!form.email || form.password.length < 8))) { setNotice("Nhập đủ tên hiển thị, Team và email/mật khẩu tối thiểu 8 ký tự cho tài khoản mới."); return; } setSaving(true); try { if (editing) await updatePilotManagedAccount(editing.id, { displayName: form.displayName, role: form.role, teamId: form.teamId, xpBalance, isActive: form.isActive }); else await createPilotManagedAccount({ email: form.email, password: form.password, displayName: form.displayName, role: form.role, teamId: form.teamId, xpBalance }); setNotice(editing ? "Đã cập nhật role, Team và quỹ XP." : "Đã tạo tài khoản Pilot mới."); setEditing(null); setForm(freshForm()); await load(); } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể lưu tài khoản."); } finally { setSaving(false); } };
  const metrics = scorecard ? [{ label: "Signal đang hoạt động", value: scorecard.totalActiveSignals, icon: BarChart3 }, { label: "Intervention rate", value: `${scorecard.interventionRate}%`, icon: ShieldCheck }, { label: "TTI trung bình", value: `${scorecard.timeToInterventionHours}h`, icon: RefreshCw }, { label: "Recovery D7", value: `${scorecard.d7RecoveryRate}%`, icon: CheckCircle2 }] : [];
  return <section className="step5-admin-panel"><header className="step5-section-head"><div><span><ShieldCheck size={15} />PILOT MEASUREMENT FRAMEWORK</span><h2>Detection → Action → <em>Outcome.</em></h2><p>Scorecard đọc Signal, Can thiệp và Outcome từ nguồn Pilot thật; hành trình không chứa PII khách hàng.</p></div><button className="pilot-secondary-action" onClick={() => void load()} disabled={loading}><RefreshCw size={16} />Làm mới</button></header>{loading ? <div className="pilot-loading"><Loader2 className="spin" size={17} />Đang nạp Measurement Layer…</div> : <><div className="step5-score-grid">{metrics.map(({ label, value, icon: Icon }) => <article className="lift-card" key={label}><Icon size={18} /><strong>{value}</strong><span>{label}</span></article>)}</div>{scorecard && <section className="step5-loop lift-card"><div><span>CHUYỂN HÓA CAN THIỆP</span><h3>{scorecard.actedSignals}/{scorecard.totalActiveSignals} Signal đã có hành động</h3><p>{scorecard.d7RecoveredCount}/{scorecard.d7OutcomeCount} Outcome D7 hồi phục · TTI tính từ lúc Signal được phát hiện tới Can thiệp hoàn tất.</p></div><div className="step5-progress"><i style={{ width: scorePercent(scorecard.interventionRate) }} /></div></section>}<section className="step5-journey lift-card"><div className="step5-section-head"><div><span><BarChart3 size={14} />HÀNH TRÌNH HỌC TẬP</span><h3>Signal → Can thiệp → Hồi phục</h3></div></div>{scorecard?.journeys.length ? <div className="step5-journey-list">{scorecard.journeys.map((journey) => <article key={journey.signalId}><div><strong>{journey.advisor}</strong><span>{journey.team} · {journey.severity}</span></div><p><b>Signal:</b> {journey.summary}</p><p><b>Action:</b> {journey.interventionType ? `${journey.interventionType} · ${journey.actionStatus}` : "Chưa có can thiệp"}</p><p><b>Outcome D7:</b> {journey.d7Outcome ?? "Chưa đủ checkpoint"}</p></article>)}</div> : <div className="step5-empty"><BarChart3 size={22} /><strong>Chưa có dữ liệu tuần này</strong><span>Scorecard sẽ hiển thị ngay khi Engine phát hiện Signal và Leader ghi Can thiệp.</span></div>}</section><CentralBankAndRewards accounts={accounts} teams={teams} onRefresh={load} /><RewardRedemptionRequestList /><section className="step5-user-management lift-card"><div className="step5-section-head"><div><span><UserCog size={15} />QUẢN LÝ TÀI KHOẢN</span><h2>{editing ? "Cập nhật tài khoản Pilot" : "Tạo tài khoản Pilot"}</h2><p>Super Admin quản lý role, Team, trạng thái và quỹ XP; mật khẩu chỉ dùng trong lúc tạo, không hiển thị lại.</p></div><Users size={25} /></div><div className="step5-user-form"><label>Tên hiển thị<input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>{!editing && <><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Mật khẩu tạm<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label></>}<label>Vai trò<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as FormState["role"], xpBalance: event.target.value === "leader" && form.xpBalance === "500" ? "5000" : form.xpBalance })}><option value="advisor">Advisor (TVV)</option><option value="leader">Leader</option></select></label><label>Team<select value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })}>{teams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}</select></label><label>Quỹ XP tháng<input inputMode="numeric" value={form.xpBalance} onChange={(event) => setForm({ ...form, xpBalance: event.target.value.replace(/[^0-9]/g, "") })} /></label>{editing && <label className="step5-toggle"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /><span aria-hidden="true" /><div><strong>Tài khoản hoạt động</strong><small>Tắt để ngăn đăng nhập Pilot mà vẫn giữ audit.</small></div></label>}</div><div className="step5-user-actions"><button className="cta-glow" disabled={saving} onClick={() => void submit()}>{saving ? <Loader2 className="spin" size={16} /> : editing ? <UserCog size={16} /> : <Plus size={16} />}{editing ? "Lưu tài khoản" : "Tạo tài khoản"}</button>{editing && <button className="pilot-secondary-action" onClick={() => { setEditing(null); setForm(freshForm()); }}>Hủy sửa</button>}</div>{notice && <p className="step5-notice"><CheckCircle2 size={15} />{notice}</p>}<div className="step5-account-list">{accounts.map((account) => <button key={account.id} className="step5-account-row" onClick={() => startEdit(account)}><CircleUserRound size={17} /><div><strong>{account.displayName}</strong><span>{account.role} · {account.teamName} · Quỹ {account.xpBalance.toLocaleString("vi-VN")} XP</span></div><small>{account.isActive ? "Hoạt động" : "Tạm dừng"}</small></button>)}</div></section></>}</section>;
}
