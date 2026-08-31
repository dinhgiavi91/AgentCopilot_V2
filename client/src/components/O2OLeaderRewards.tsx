import { useEffect, useState } from "react";
import { CheckCircle2, Gift, Loader2, PackageCheck, RefreshCw } from "lucide-react";
import {
  fetchTeamPendingRewardRedemptions,
  fulfillTeamRewardRedemption,
  type PilotSession,
  type TeamRewardRedemption,
} from "../lib/supabaseContent";

export function O2OLeaderRewards({ session, onToast }: { session: PilotSession | null; onToast: (message: string) => void }) {
  const [redemptions, setRedemptions] = useState<TeamRewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const reload = async () => {
    if (!session || (session.profile.role !== "leader" && session.profile.role !== "super_admin")) return;
    setLoading(true);
    try {
      setRedemptions(await fetchTeamPendingRewardRedemptions());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải yêu cầu đổi quà.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, [session?.userId, session?.profile.primary_team_id]);

  const fulfill = async (redemption: TeamRewardRedemption) => {
    setFulfillingId(redemption.id);
    try {
      await fulfillTeamRewardRedemption(redemption.id);
      setRedemptions((current) => current.filter((item) => item.id !== redemption.id));
      onToast(`Đã xác nhận trao “${redemption.rewardName}” cho ${redemption.requester}.`);
    } catch (cause) {
      onToast(cause instanceof Error ? cause.message : "Không thể xác nhận trao quà lúc này.");
    } finally {
      setFulfillingId(null);
    }
  };

  if (!session || (session.profile.role !== "leader" && session.profile.role !== "super_admin")) return null;

  return <section className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm" aria-label="Quản lý trả quà O2O">
    <header className="flex items-start justify-between gap-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
      <div className="flex min-w-0 gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Gift size={20} /></span><div><p className="text-[10px] font-extrabold tracking-[0.14em] text-amber-700">O2O REWARD FULFILLMENT</p><h2 className="text-base font-extrabold text-slate-900">Quản lý Trả Quà</h2><p className="mt-0.5 text-xs leading-5 text-slate-600">Chỉ hiển thị phần thưởng đang chờ trao của Team bạn.</p></div></div>
      <button className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-100 hover:text-amber-700" onClick={() => void reload()} aria-label="Làm mới yêu cầu đổi quà"><RefreshCw size={16} /></button>
    </header>
    <div className="p-4">
      {loading ? <div className="flex items-center justify-center gap-2 py-7 text-sm text-slate-500"><Loader2 size={17} className="animate-spin" />Đang tải yêu cầu O2O…</div> : error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : redemptions.length ? <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">{redemptions.map((redemption) => <article key={redemption.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><PackageCheck size={18} /></span><div className="font-semibold text-slate-800"><span>{redemption.requester}</span> <span className="text-sm font-normal text-slate-500">đổi</span><br /><span className="text-amber-600">{redemption.rewardName}</span><p className="mt-2 text-xs font-normal text-slate-500">{redemption.xpCost} XP · {new Date(redemption.createdAt).toLocaleString("vi-VN")}</p></div></div>
        <button className="w-full rounded-lg bg-green-500 py-2 font-bold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void fulfill(redemption)} disabled={fulfillingId !== null}>{fulfillingId === redemption.id ? <><Loader2 size={15} className="mr-1 inline animate-spin" />Đang cập nhật…</> : <><CheckCircle2 size={15} className="mr-1 inline" />Trao Quà Xong</>}</button>
      </article>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"><CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={22} /><strong className="block text-sm text-slate-800">Chưa có quà nào chờ trao.</strong><p className="mt-1 text-xs text-slate-500">Các yêu cầu đổi quà pending của Team sẽ xuất hiện tại đây.</p></div>}
    </div>
  </section>;
}
