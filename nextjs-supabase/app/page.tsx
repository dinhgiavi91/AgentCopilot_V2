"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Flame, HandHeart, Home, LockKeyhole, Menu, Plus, Radar, ShieldCheck, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { BrandMark } from "../components/brand-mark";
import { getSupabaseClient } from "../lib/supabase/client";
import type { DailyLog, UserProfile } from "../types/sprint1";

type DashboardState = {
  profile: UserProfile;
  logs: DailyLog[];
};

const fallback: DashboardState = {
  profile: { user_id: "preview", role: "Gói Khởi Động", target_income: 30_000_000, required_meetings: 40, current_streak: 7, total_xp: 1240 },
  logs: [
    { log_id: "preview-1", service_level: 6, action_result: "Chốt HĐ", follow_up_date: null, revenue_amount: 15_000_000 },
    { log_id: "preview-2", service_level: 4, action_result: "Dời lịch", follow_up_date: "2026-08-15", revenue_amount: 0 },
  ],
};

const money = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>(fallback);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [result, setResult] = useState<DailyLog["action_result"]>("Dời lịch");
  const [serviceLevel, setServiceLevel] = useState<DailyLog["service_level"]>(6);
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const supabase = getSupabaseClient();
      if (!supabase) { setLoading(false); return; }
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { setLoading(false); return; }
      const [profileResult, logsResult] = await Promise.all([
        supabase.from("users_profile").select("user_id, role, target_income, required_meetings, current_streak, total_xp").eq("user_id", authData.user.id).single(),
        supabase.from("daily_logs").select("log_id, service_level, action_result, follow_up_date, revenue_amount").eq("user_id", authData.user.id).order("created_at", { ascending: false }).limit(6),
      ]);
      if (profileResult.data) setState({ profile: profileResult.data as UserProfile, logs: (logsResult.data ?? []) as DailyLog[] });
      setLoading(false);
    }
    void loadDashboard();
  }, []);

  const earnings = useMemo(() => state.logs.reduce((sum, log) => sum + Number(log.revenue_amount || 0), 0), [state.logs]);
  const meetingsDone = state.logs.length;
  const incomeProgress = Math.min(100, Math.round((earnings / Math.max(state.profile.target_income, 1)) * 100));
  const meetingProgress = Math.min(100, Math.round((meetingsDone / Math.max(state.profile.required_meetings, 1)) * 100));

  async function saveLog() {
    const supabase = getSupabaseClient();
    if (!supabase) { setNotice("Chưa có Supabase env trong runtime này."); return; }
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setNotice("Cần đăng nhập để lưu Nhịp Đập."); return; }
    if ((result === "Dời lịch" || result === "Từ chối") && !followUpDate) { setNotice("Hãy chọn ngày follow-up cho kết quả này."); return; }
    setSaving(true);
    const { error } = await supabase.from("daily_logs").insert({
      user_id: authData.user.id,
      service_level: serviceLevel,
      action_result: result,
      follow_up_date: result === "Chốt HĐ" ? null : followUpDate,
      revenue_amount: 0,
    });
    setSaving(false);
    if (error) { setNotice("Không thể lưu log. Hãy kiểm tra RLS và migration."); return; }
    setIsLogOpen(false);
    setNotice("Đã ghi Nhịp Đập. XP sẽ được trigger Supabase xác nhận.");
  }

  return <div className="min-h-screen bg-[#F9FAFB] text-slate-800">
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#1A365D] px-4 py-5 text-white lg:flex">
      <div className="flex items-center gap-3 px-2"><BrandMark className="h-10 w-10" /><div className="font-bold tracking-[0.14em]"><div className="text-sm">AGENT</div><div className="text-[10px] text-amber-300">COPILOT</div></div></div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-3"><p className="text-xs text-blue-200">TVV đang hoạt động</p><p className="mt-1 font-semibold">Thu Hà</p></div>
      <nav className="mt-7 space-y-2 text-sm"><button className="flex w-full items-center gap-3 rounded-xl bg-[#F59E0B] px-3 py-3 font-bold text-[#1A365D]"><Home size={18} />Hồ Sơ</button><button onClick={() => setIsLogOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10"><HandHeart size={18} />Nhịp Đập</button><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10"><BookOpen size={18} />Bảo Bối</button><button onClick={() => setNotice("Radar chỉ mở cho Leader ở Gói Tăng Tốc.")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10"><Radar size={18} />Radar <LockKeyhole className="ml-auto" size={14} /></button></nav>
      <div className="mt-auto rounded-2xl border border-amber-300/25 bg-amber-400/10 p-3"><p className="text-[10px] font-bold tracking-wider text-amber-200">GÓI KHỞI ĐỘNG</p><p className="mt-1 text-xs text-white">Hồ Sơ & Nhịp Đập</p></div>
    </aside>
    <main className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-9"><div className="flex items-center gap-3"><Menu className="text-[#1A365D] lg:hidden" /><div className="flex items-center gap-2 lg:hidden"><BrandMark className="h-7 w-7" /><span className="text-xs font-bold tracking-wider text-[#1A365D]">AGENT COPILOT</span></div></div><div className="hidden w-full max-w-sm items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-400 md:flex"><span>⌕</span><input className="w-full bg-transparent text-sm outline-none" placeholder="Tìm bảo bối, tình huống..." /></div><div className="flex items-center gap-4"><button className="relative rounded-xl bg-slate-50 p-2 text-[#1A365D]"><Bell size={18} /><i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" /></button><span className="text-sm font-semibold text-[#1A365D]">Thu Hà</span></div></header>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-9"><div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-bold tracking-[0.14em] text-slate-500">● HỒ SƠ CHIẾN BINH · HÔM NAY</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1A365D]">Chào buổi sáng, <span className="text-[#D88200]">Thu Hà.</span></h1><p className="mt-2 text-sm text-slate-500">Chọn <b className="text-[#1A365D]">một cuộc gặp có ý nghĩa</b> cho hôm nay.</p></div><button onClick={() => setIsLogOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#1A365D] shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5"><Plus size={18} />Đi gặp khách & Ghi Nhịp Đập</button></div>
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#112746] to-[#1A365D] text-white shadow-xl shadow-blue-950/15"><div className="grid min-h-[270px] grid-cols-1 lg:grid-cols-[1.3fr_.7fr]"><div className="p-7 lg:p-9"><p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-blue-100"><Target size={15} className="text-[#F59E0B]" />MỤC TIÊU THÁNG NÀY</p><div className="mt-5 flex items-baseline gap-2"><strong className="text-6xl font-extrabold tracking-tighter">{money.format(earnings / 1_000_000)}</strong><span className="text-xl font-bold text-amber-300">triệu</span><span className="text-sm text-blue-200">/ {money.format(state.profile.target_income / 1_000_000)} triệu</span></div><p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">Tiến độ thu nhập được cộng từ hành động thực chiến đã ghi trong Nhịp Đập.</p><div className="mt-7 h-2 rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-amber-300" style={{ width: `${incomeProgress}%` }} /></div><div className="mt-2 flex justify-between text-xs"><b>{incomeProgress}% đã đạt</b><span className="text-blue-200">Cập nhật từ log hợp lệ</span></div></div><div className="relative hidden items-center justify-center overflow-hidden lg:flex"><div className="absolute h-72 w-72 rounded-full border border-white/10" /><div className="absolute h-44 w-44 rounded-full border border-dashed border-amber-300/40" /><div className="relative grid place-items-center"><BrandMark className="h-28 w-28 drop-shadow-2xl" /><span className="-mt-4 text-center text-[9px] font-bold tracking-[0.13em] text-amber-200">THU NHẬP<br />CÓ HƯỚNG ĐI</span></div><div className="absolute right-6 top-9 rounded-xl bg-white/95 px-3 py-2 text-[10px] text-[#1A365D] shadow-lg"><TrendingUp className="mb-1 text-[#F59E0B]" size={15} /><b>+12% so với tuần trước</b></div></div></div></section>
        <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[0.14em] text-slate-500">● PHỄU HÀNH ĐỘNG</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A365D]">Cuộc gặp tạo ra <span className="text-[#D88200]">đường đi.</span></h2></div><button className="text-xs font-bold text-slate-500">Xem báo cáo <ChevronRight className="inline" size={14} /></button></div><div className="grid gap-4 md:grid-cols-4"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-wider text-slate-500">CUỘC GẶP CẦN THỰC HIỆN</p><p className="mt-2 text-4xl font-extrabold tracking-tight text-[#1A365D]">{meetingsDone}<span className="text-lg text-slate-400"> / {state.profile.required_meetings}</span></p></div><div className="grid h-20 w-20 place-items-center rounded-full border-8 border-[#F59E0B] text-sm font-extrabold text-[#1A365D]">{meetingProgress}%</div></div><div className="mt-5 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#1A365D]" style={{ width: `${meetingProgress}%` }} /></div><p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Target size={15} className="text-[#F59E0B]" />Còn {Math.max(0, state.profile.required_meetings - meetingsDone)} cuộc gặp để chạm mục tiêu.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-[#E07023]"><span className="text-[10px] font-bold tracking-wider text-slate-500">NHỊP HIỆN TẠI</span><Flame size={20} /></div><p className="mt-5 text-4xl font-extrabold tracking-tight text-[#1A365D]">{state.profile.current_streak}<span className="text-base text-slate-400"> ngày</span></p><p className="mt-3 text-xs text-slate-500">Chuỗi đã được giữ liên tiếp.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-[#F59E0B]"><span className="text-[10px] font-bold tracking-wider text-slate-500">TỔNG XP</span><Zap size={19} /></div><p className="mt-5 text-4xl font-extrabold tracking-tight text-[#1A365D]">{money.format(state.profile.total_xp)}</p><p className="mt-3 text-xs text-slate-500">Điểm thật từ hành động thật.</p></article></div></section>
        <section className="mt-8 grid gap-4 lg:grid-cols-[1.45fr_.55fr]"><div><p className="text-[10px] font-bold tracking-[0.14em] text-slate-500">● ĐIỂM CHẠM HÔM NAY</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A365D]">Chọn đúng <span className="text-[#D88200]">việc tiếp theo.</span></h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{[{ icon: BookOpen, title: "Bảo bối trước cuộc gặp", copy: "Mở 3 câu SPIN phù hợp." }, { icon: CalendarDays, title: "Hâm nóng follow-up", copy: "Có 4 lịch cần chạm lại." }, { icon: Sparkles, title: "Nhịp 90 giây", copy: "Giữ sự sắc bén hôm nay." }].map((item) => <button key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF4D7] text-[#B96E00]"><item.icon size={19} /></span><span><b className="text-sm text-[#1A365D]">{item.title}</b><small className="mt-1 block text-xs leading-5 text-slate-500">{item.copy}</small></span></button>)}</div></div><aside className="relative overflow-hidden rounded-2xl border border-amber-200 bg-[#FFF8E8] p-5"><ShieldCheck className="text-[#B96E00]" size={22} /><p className="mt-3 text-[10px] font-bold tracking-wider text-[#B96E00]">ZERO-PII BY DEFAULT</p><h3 className="mt-1 text-lg font-extrabold tracking-tight text-[#704A09]">Ghi nhịp, không ghi danh tính.</h3><p className="mt-2 text-xs leading-5 text-[#896A25]">Chỉ lưu hành động, cấp độ dịch vụ và lịch follow-up; không lưu tên, SĐT hay email khách hàng.</p></aside></section>
        <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[0.14em] text-slate-500">● NHỊP ĐẬP GẦN ĐÂY</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A365D]">Việc thật tạo ra <span className="text-[#D88200]">điểm thật.</span></h2></div></div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[650px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold tracking-wider text-slate-500"><tr><th className="px-5 py-4">NHỊP ĐẬP</th><th className="px-5 py-4">CẤP ĐỘ DỊCH VỤ</th><th className="px-5 py-4">KẾT QUẢ</th><th className="px-5 py-4">DOANH THU</th></tr></thead><tbody>{state.logs.map((log) => <tr key={log.log_id} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFF4D7] text-[#B96E00]"><HandHeart size={16} /></span><span><b className="text-sm text-[#1A365D]">Log Nhịp Đập</b><small className="mt-1 block text-xs text-slate-400">{log.log_id.slice(0, 8)}</small></span></div></td><td className="px-5 py-4 text-sm">{["😠", "😕", "😐", "🙂", "😊", "🤩"][log.service_level - 1]} Cấp {log.service_level}</td><td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{log.action_result}</span></td><td className="px-5 py-4 text-sm font-bold text-[#1A365D]">{Number(log.revenue_amount) > 0 ? `${money.format(Number(log.revenue_amount) / 1_000_000)} triệu` : "—"}</td></tr>)}</tbody></table></div></section>
      </div></main>
    {isLogOpen && <div className="fixed inset-0 z-50 grid place-items-end bg-[#112746]/50 p-0 backdrop-blur-sm md:place-items-center md:p-4"><section className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold tracking-wider text-slate-500">NHỊP ĐẬP KHÁCH HÀNG</p><h2 className="mt-1 text-2xl font-extrabold text-[#1A365D]">Ghi nhanh sau cuộc gặp.</h2></div><button onClick={() => setIsLogOpen(false)} className="rounded-xl bg-slate-100 px-3 py-2">×</button></div><div className="mt-5 flex gap-2 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700"><ShieldCheck className="shrink-0" size={17} /><p><b>KHÔNG GHI PII.</b> Không nhập tên, SĐT, email hay số định danh khách hàng.</p></div><div className="mt-5"><p className="text-xs font-bold text-slate-600">Cấp độ dịch vụ</p><div className="mt-2 grid grid-cols-6 gap-2">{[1,2,3,4,5,6].map((level) => <button key={level} onClick={() => setServiceLevel(level as DailyLog["service_level"])} className={`rounded-xl border p-2 text-center ${serviceLevel === level ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-slate-50"}`}><span className="block">{["😠", "😕", "😐", "🙂", "😊", "🤩"][level - 1]}</span><small>{level}</small></button>)}</div></div><div className="mt-5"><p className="text-xs font-bold text-slate-600">Kết quả cuộc gặp</p><div className="mt-2 flex gap-2">{(["Chốt HĐ", "Dời lịch", "Từ chối"] as const).map((value) => <button key={value} onClick={() => setResult(value)} className={`rounded-xl px-3 py-2 text-xs font-bold ${result === value ? "bg-[#1A365D] text-white" : "bg-slate-100 text-slate-600"}`}>{value}</button>)}</div></div>{result !== "Chốt HĐ" && <label className="mt-5 block text-xs font-bold text-slate-600">Ngày follow-up<input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" /></label>}<button disabled={saving} onClick={saveLog} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F59E0B] px-4 py-3 font-bold text-[#1A365D] disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu Nhịp Đập"}<ChevronRight size={17} /></button></section></div>}
    {notice && <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-2 rounded-2xl bg-[#112746] px-4 py-3 text-xs text-white shadow-2xl"><CheckCircle2 className="text-amber-300" size={17} />{notice}</div>}
    {loading && <div className="fixed inset-0 z-[70] grid place-items-center bg-white/70 text-sm font-bold text-[#1A365D] backdrop-blur-sm">Đang đồng bộ Hồ Sơ Chiến Binh...</div>}
  </div>;
}
