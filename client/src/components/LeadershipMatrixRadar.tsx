import React, { useEffect, useState } from "react";
import { Loader2, Radar, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { fetchAdminLeadershipRadar, type AdminLeadershipRadar } from "../lib/supabaseContent";
import { TeamOperationalRadarDrilldown } from "./TeamOperationalRadarDrilldown";

type Props = { role: "super_admin" | "director" };

const emptyRadar: AdminLeadershipRadar = { windowDays: 30, scope: "global", teams: [] };
const clamp = (value: number) => Math.max(6, Math.min(94, value));

/**
 * The data RPC determines the scope from auth.uid(); this component never sends
 * an agency/team identifier and therefore cannot broaden Director visibility.
 */
export function LeadershipMatrixRadar({ role }: Props) {
  const [radar, setRadar] = useState(emptyRadar);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRadar(await fetchAdminLeadershipRadar());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải Leadership Matrix.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const isAgency = radar.scope === "agency" || role === "director";
  const scopeTitle = isAgency ? "Radar Lãnh Đạo Cấp GA" : "Leadership Matrix Toàn Hệ Thống";
  const scopeDescription = isAgency
    ? "Chỉ tổng hợp trực tiếp các Team con thuộc GA của bạn. Phạm vi được áp tại tầng dữ liệu."
    : "Tổng hợp theo Team active trên toàn hệ thống; không hiển thị dữ liệu khách hàng.";

  return (
    <section className="screen-enter flex flex-col gap-6 pb-10" aria-label={scopeTitle}>
      <header className="relative overflow-hidden rounded-[28px] bg-slate-950 p-7 text-white shadow-2xl sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/30 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-[80px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={13} className="text-emerald-300" />
            {isAgency ? "Agency scope · Director" : "Global scope · Super Admin"}
          </span>
          <h1 className="mt-4 text-3xl font-black text-white drop-shadow-md sm:text-4xl">{scopeTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">{scopeDescription}</p>
        </div>
      </header>

      <section className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Leadership Radar · {radar.windowDays} ngày</p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-black text-slate-900"><Radar size={19} className="text-indigo-600" />Radar Đánh Giá Lãnh Đạo</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">X: TVV được hỗ trợ hoặc ghi nhận. Y: nhịp chốt bình quân trên TVV active, chuẩn hóa tối đa 100.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:border-indigo-300 disabled:cursor-wait">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Làm mới
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            <strong>Không thể tải Matrix.</strong> {error}
          </div>
        ) : loading ? (
          <div className="mt-6 flex min-h-64 items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-white text-sm text-slate-500"><Loader2 size={18} className="animate-spin text-indigo-500" />Đang tổng hợp tín hiệu Team…</div>
        ) : (
          <>
            <div className="relative mt-6 h-[360px] overflow-hidden rounded-2xl border-b-2 border-l-2 border-indigo-200 bg-white">
              <span className="absolute -left-11 top-1/2 -rotate-90 text-[10px] font-black uppercase text-slate-400">Hiệu suất</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-slate-400">Độ thấu cảm</span>
              <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-200" />
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200" />
              <span className="absolute left-3 top-3 text-[10px] font-bold text-emerald-600">Dẫn dắt & hiệu quả</span>
              <span className="absolute bottom-8 left-3 text-[10px] font-bold text-rose-500">Cần quan tâm</span>
              {radar.teams.map((team) => {
                const positive = team.empathyScore >= 50 && team.performanceScore >= 50;
                const attention = team.empathyScore < 50 && team.performanceScore < 50;
                return <button key={team.teamId} type="button" aria-label={`${team.teamName}: thấu cảm ${team.empathyScore}%, hiệu suất ${team.performanceScore}%`} title={`${team.leaderName} · ${team.supportedAdvisors}/${team.activeAdvisors} TVV được hỗ trợ · ${team.closedPolicies} nhịp chốt`} className={`group absolute flex -translate-x-1/2 translate-y-1/2 flex-col items-center ${positive ? "text-emerald-600" : attention ? "text-rose-600" : "text-amber-600"}`} style={{ left: `${clamp(team.empathyScore)}%`, bottom: `${clamp(team.performanceScore)}%` }}><i className={`h-4 w-4 rounded-full bg-current ring-4 transition-transform group-hover:scale-125 ${positive ? "ring-emerald-100" : attention ? "ring-rose-100" : "ring-amber-100"}`} /><span className="mt-1 max-w-28 truncate rounded border bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm">{team.teamName}</span></button>;
              })}
              {!radar.teams.length && <p className="absolute inset-0 m-auto flex items-center justify-center text-sm text-slate-400">{isAgency ? "GA này chưa có Team con active." : "Chưa có Team active."}</p>}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {radar.teams.map((team) => <div key={`${team.teamId}-label`} className="rounded-xl border border-slate-100 bg-white p-3 text-xs"><strong className="text-slate-800">{team.teamName}</strong><span className="ml-1 text-slate-400">· {team.leaderName}</span><p className="mt-1 text-slate-500">Thấu cảm {team.empathyScore}% · Hiệu suất {team.performanceScore}% · {team.activeAdvisors} TVV active</p></div>)}
            </div>
          </>
        )}
      </section>

      {role === "super_admin" && <section className="rounded-[24px] bg-slate-950 p-5 text-white shadow-xl sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-amber-300">God Mode drill-down · Read only</p><h2 className="mt-1 text-xl font-black text-white">Radar Cấp Đội Nhóm</h2><p className="mt-1 text-xs leading-5 text-slate-300">Chọn Team để xem tín hiệu và can thiệp ở chế độ chỉ đọc.</p></div><label className="text-[10px] font-black uppercase tracking-wide text-slate-300">Team<select value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)} className="mt-1 block w-full min-w-60 rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm font-bold text-white"><option value="">-- Chọn Team để soi --</option>{radar.teams.map((team) => <option key={team.teamId} value={team.teamId}>{team.teamName}</option>)}</select></label></div><div className="mt-5 overflow-hidden rounded-2xl bg-slate-50 text-slate-900">{selectedTeamId ? <TeamOperationalRadarDrilldown teamId={selectedTeamId} teamName={radar.teams.find((team) => team.teamId === selectedTeamId)?.teamName ?? "Team"} /> : <p className="p-10 text-center text-sm text-slate-500">Vui lòng chọn một Team để xem Radar chi tiết.</p>}</div></section>}

      <aside className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
        <Users size={18} className="mt-0.5 shrink-0 text-indigo-500" />
        <p><strong className="text-slate-800">Quy ước scope:</strong> Matrix chỉ dùng tín hiệu đội ngũ ở cấp tổng hợp. Director không gửi scope từ trình duyệt; phạm vi Team con được kiểm soát trong RPC theo tài khoản đăng nhập.</p>
      </aside>
    </section>
  );
}
