import { useEffect, useState } from "react";
import { Award, BookOpen, Gift, Loader2, Sparkles, Users, X, Zap } from "lucide-react";
import { fetchMyAgentMirror, type AgentMirror } from "../lib/supabaseContent";

type Props = { open: boolean; onClose: () => void };
const emptyMirror: AgentMirror = { weekStart: "", xpEarned: 0, learningToolsUsed: 0, giftsReceived: 0, recognitionsReceived: 0, customerMeetings: 0, closedDeals: 0, nextTip: "Giữ một nhịp học và một hành động thực chiến trong tuần mới." };

export default function AgentMirrorModal({ open, onClose }: Props) {
  const [mirror, setMirror] = useState<AgentMirror>(emptyMirror);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError("");
    void fetchMyAgentMirror().then(setMirror).catch((reason) => setError(reason instanceof Error ? reason.message : "Chưa thể tải hành trình tuần này.")).finally(() => setLoading(false));
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  const week = mirror.weekStart ? new Date(mirror.weekStart).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : "tuần này";
  const moments = mirror.giftsReceived + mirror.recognitionsReceived;
  return <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" role="presentation" onClick={onClose}>
    <section className="relative z-[99999] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Báo Cáo Hành Trình Cá Nhân" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={onClose} aria-label="Đóng Hành Trình Của Tôi" className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"><X size={18} /></button>
      <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-slate-950 p-5 text-white"><span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-100"><Sparkles size={12} />Agent Mirror · tuần từ {week}</span><h2 className="mt-3 text-2xl font-black">Hành Trình Của Tôi</h2><p className="mt-2 text-sm leading-6 text-violet-100">Nhìn lại các tín hiệu phát triển thật của bạn; không có chấm điểm cảm tính hay dữ liệu khách hàng.</p></div>
      {loading ? <div className="flex items-center justify-center gap-2 py-12 text-sm font-medium text-slate-500"><Loader2 size={18} className="animate-spin" />Đang soi chiếu hành trình…</div> : error ? <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><p>{error}</p><button type="button" onClick={() => { setLoading(true); setError(""); void fetchMyAgentMirror().then(setMirror).catch((reason) => setError(reason instanceof Error ? reason.message : "Chưa thể tải hành trình tuần này.")).finally(() => setLoading(false)); }} className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm">Thử lại</button></div> : <>
        <div className="mt-5 grid grid-cols-2 gap-3"><article className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><Zap size={18} className="text-amber-600" /><strong className="mt-3 block text-2xl font-black text-amber-700">+{mirror.xpEarned} XP</strong><p className="mt-1 text-[11px] font-medium text-amber-800">Năng lượng tích lũy tuần này</p></article><article className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><BookOpen size={18} className="text-indigo-600" /><strong className="mt-3 block text-2xl font-black text-indigo-700">{mirror.learningToolsUsed}</strong><p className="mt-1 text-[11px] font-medium text-indigo-800">Bảo Bối / nhịp học đã dùng</p></article><div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col justify-center items-center text-center"><Users size={20} className="text-blue-500 mb-2"/><h3 className="text-2xl font-black text-blue-700">{mirror.customerMeetings}</h3><p className="text-[10px] text-blue-600 uppercase font-bold mt-1">Cuộc gặp KH tuần này</p></div><article className="rounded-2xl border border-rose-100 bg-rose-50 p-4"><Gift size={18} className="text-rose-600" /><strong className="mt-3 block text-2xl font-black text-rose-700">{mirror.giftsReceived}</strong><p className="mt-1 text-[11px] font-medium text-rose-800">Lần đồng đội động viên</p></article><article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><Award size={18} className="text-emerald-600" /><strong className="mt-3 block text-2xl font-black text-emerald-700">{mirror.recognitionsReceived}</strong><p className="mt-1 text-[11px] font-medium text-emerald-800">Lời ghi nhận từ đội ngũ</p></article></div>
        <section className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Gợi ý cho tuần mới</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{mirror.nextTip}</p><p className="mt-3 text-[11px] text-slate-500">Tổng {moments} tín hiệu ghi nhận trong tuần này.</p></section>
      </>}
    </section>
  </div>;
}
