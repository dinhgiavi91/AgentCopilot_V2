import { useState } from "react";
import { LayoutDashboard, Radar, Users } from "lucide-react";
import type { PilotSession } from "../lib/supabaseContent";
import LeaderCommandCenter from "./LeaderCommandCenter";
import { LeadershipMatrixRadar } from "./LeadershipMatrixRadar";

type DirectorHybridRadarProps = {
  session: PilotSession;
  onToast: (message: string) => void;
  onCreateMoment: (agent: { id: string; displayName: string }) => void;
};

export function DirectorHybridRadar({ session, onToast, onCreateMoment }: DirectorHybridRadarProps) {
  const [viewMode, setViewMode] = useState<"macro" | "micro">("macro");
  return <div className="screen-enter overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <div className="mb-1 flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-indigo-600"><Radar size={14} />RADAR GIÁM ĐỐC GA</div>
        <h1 className="text-xl font-black text-slate-900">Quản trị vĩ mô & trực tiếp</h1>
        <p className="mt-1 text-xs text-slate-500">Chuyển giữa Team con cấp Agency và TVV thuộc GA Team trực tiếp của bạn.</p>
      </div>
      <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1" role="tablist" aria-label="Góc nhìn Radar Giám đốc">
        <button role="tab" aria-selected={viewMode === "macro"} onClick={() => setViewMode("macro")} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${viewMode === "macro" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><LayoutDashboard size={15} />Quản trị vĩ mô</button>
        <button role="tab" aria-selected={viewMode === "micro"} onClick={() => setViewMode("micro")} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${viewMode === "micro" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><Users size={15} />Quân trực tiếp</button>
      </div>
    </header>
    <div className="min-h-[540px] p-3 sm:p-5">
      {viewMode === "macro" ? <LeadershipMatrixRadar role="director" /> : <div className="gated-radar-wrap"><LeaderCommandCenter session={session} onToast={onToast} onCreateMoment={onCreateMoment} /></div>}
    </div>
  </div>;
}
