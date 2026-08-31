import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Loader2, ShieldCheck, Users } from "lucide-react";
import { fetchTeamOperationalRadar, type TeamOperationalRadar } from "../lib/supabaseContent";

const emptyRadar: TeamOperationalRadar = { teamId: "", teamName: "", activeAdvisors: 0, touches7d: 0, openFollowups: 0, newSignals: 0, interventions7d: 0, signals: [] };

export function TeamOperationalRadarDrilldown({ teamId, teamName }: { teamId: string; teamName: string }) {
  const [radar, setRadar] = useState<TeamOperationalRadar>(emptyRadar);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setLoading(true); setError("");
    void fetchTeamOperationalRadar(teamId).then((next) => { if (alive) setRadar(next); }).catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Không thể tải Radar Team."); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [teamId]);
  if (loading) return <div className="flex min-h-56 items-center justify-center gap-2 p-6 text-sm text-slate-500"><Loader2 size={18} className="animate-spin text-indigo-500" />Đang tổng hợp tín hiệu Team…</div>;
  if (error) return <div className="m-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><strong>Không thể tải Radar Team.</strong> {error}</div>;
  const metrics = [{ label: "TVV active", value: radar.activeAdvisors, icon: Users, tone: "text-indigo-600 bg-indigo-50" }, { label: "Nhịp 7 ngày", value: radar.touches7d, icon: Activity, tone: "text-emerald-600 bg-emerald-50" }, { label: "Follow-up mở", value: radar.openFollowups, icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" }, { label: "Tín hiệu mới", value: radar.newSignals, icon: ShieldCheck, tone: "text-rose-600 bg-rose-50" }];
  return <div className="p-4 sm:p-5" aria-label={`Radar vận hành chỉ đọc của ${teamName}`}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Read-only operational scope</p><h4 className="mt-1 text-lg font-black text-slate-900">{radar.teamName || teamName}</h4></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Chỉ xem · Không tạo can thiệp</span></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map((metric) => { const Icon = metric.icon; return <div key={metric.label} className="rounded-xl border border-slate-100 bg-white p-3"><span className={`inline-flex rounded-lg p-2 ${metric.tone}`}><Icon size={15} /></span><strong className="mt-2 block text-2xl font-black text-slate-900">{metric.value}</strong><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{metric.label}</p></div>; })}</div>
    <section className="mt-4 rounded-xl border border-slate-100 bg-white"><div className="border-b border-slate-100 px-4 py-3"><h5 className="text-sm font-black text-slate-800">Tín hiệu cần theo dõi</h5><p className="mt-0.5 text-[11px] text-slate-500">Tối đa 10 tín hiệu, không hiển thị dữ liệu khách hàng.</p></div><div className="divide-y divide-slate-100">{radar.signals.length ? radar.signals.map((signal) => <div key={signal.id} className="flex items-start justify-between gap-3 px-4 py-3"><div><p className="text-xs font-bold text-slate-800">{signal.memberName} <span className="font-medium text-slate-400">· {signal.signalType}</span></p><p className="mt-1 text-xs leading-5 text-slate-500">{signal.summary}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{signal.severity}</span></div>) : <p className="p-5 text-center text-sm text-slate-400">Chưa có tín hiệu mới trong Team này.</p>}</div></section>
  </div>;
}
