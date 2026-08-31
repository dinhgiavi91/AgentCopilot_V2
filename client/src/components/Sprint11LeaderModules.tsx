import React, { useState } from "react";
import { BarChart3, CalendarClock, ChevronDown, ChevronUp, Compass, MessageCircle, Radar, Sparkles, Target, Users } from "lucide-react";
import { AdminLeaderPlaybook } from "./AdminLeaderPlaybook";

type LeadershipItem = {
  code: string;
  type: "principle" | "coaching_script";
  prefix?: string | null;
  topic: string;
  core_thinking: string;
  note?: string | null;
  tags?: string[];
  share_text?: string | null;
  roleplay_prompt?: string | null;
  mini_quiz?: { question: string; options: string[]; correct_index: number; correct_explanation: string; wrong_explanation: string } | null;
  learning_carousel?: { situations: Array<{ question: string; options: string[]; correct_index: number; correct_explanation: string; wrong_explanation: string }>; summary: { title: string; content: string; homework: string } } | null;
  sort_order: number;
};
type RadarHistory = { advisor: string; signal: string; tone: "critical" | "warm" | "watch"; history: Array<{ date: string; action: string }>; recommended: string };

const history: RadarHistory[] = [
  { advisor: "Thu Hà", signal: "Tỷ lệ từ chối cần coaching", tone: "critical", history: [{ date: "Thứ Hai", action: "Đã ghi 2 cuộc gặp chưa chốt; vẫn giữ follow-up." }, { date: "Thứ Ba", action: "Đã dùng Bảo Bối xử lý câu hỏi về mức phí." }, { date: "Hôm nay", action: "Chờ Leader đi thực chiến 15 phút." }], recommended: "Đi cùng một cuộc hẹn để quan sát câu mở đầu, sau đó phản hồi bằng một điều cụ thể." },
  { advisor: "Minh Tuấn", signal: "Chuỗi hoạt động đang gián đoạn", tone: "warm", history: [{ date: "Thứ Hai", action: "Đã hoàn tất Daily Quiz và một chạm chăm sóc." }, { date: "Thứ Ba", action: "Không có Nhịp Đập mới." }, { date: "Hôm nay", action: "Tín hiệu cần hỏi thăm sức khỏe/tinh thần." }], recommended: "Hẹn cafe ngắn, hỏi về nhịp làm việc trước khi cùng chốt một hành động nhỏ." },
  { advisor: "Ngân", signal: "Follow-up cần được chốt ngày", tone: "watch", history: [{ date: "Thứ Hai", action: "Dời lịch lần 1." }, { date: "Thứ Tư", action: "Dời lịch lần 2." }, { date: "Hôm nay", action: "Cần xác nhận một ngày follow-up rõ ràng." }], recommended: "Roleplay cách xác nhận cam kết nhỏ và đề nghị một khung giờ cụ thể." },
];

export function RadarHistoryPanel({ onToast }: { onToast: (message: string) => void }) {
  const [selected, setSelected] = useState<string | null>(history[0].advisor);
  return <section className="sprint11-radar-history" aria-label="Radar lịch sử và drill-down"><header><div><span><Radar size={15} />RADAR LỊCH SỬ · DEMO PRO</span><h2>Tín hiệu có <em>bối cảnh.</em></h2><p>Chỉ xem hoạt động đội và đề xuất coaching, không có dữ liệu khách hàng.</p></div><div className="sprint11-radar-mark"><BarChart3 size={21} /><small>3 TÍN HIỆU</small></div></header><div className="sprint11-radar-list">{history.map((item) => { const open = selected === item.advisor; return <article className={`sprint11-radar-drill ${item.tone} ${open ? "is-open" : ""}`} key={item.advisor}><button className="sprint11-radar-trigger" onClick={() => setSelected(open ? null : item.advisor)} aria-expanded={open}><div><span>{item.advisor}</span><strong>{item.signal}</strong></div>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>{open && <div className="sprint11-radar-detail"><div className="sprint11-radar-timeline">{item.history.map((entry) => <div key={`${item.advisor}-${entry.date}`}><time>{entry.date}</time><p>{entry.action}</p></div>)}</div><aside><span>COACHING ƯU TIÊN</span><p>{item.recommended}</p><button onClick={() => onToast(`Đã tạo kế hoạch coaching không định danh cho ${item.advisor}.`)}><MessageCircle size={15} />Tạo kế hoạch chạm</button></aside></div>}</article>; })}</div></section>;
}

export function PersistentDirectorReport({ onToast }: { onToast: (message: string) => void }) {
  const [expanded, setExpanded] = useState(true);
  return <section className="sprint11-director-report" aria-label="Báo cáo Giám đốc"><header><div><span><BarChart3 size={15} />BÁO CÁO GIÁM ĐỐC · LEADER VIEW</span><h2>Nhìn nhịp đội,<em> chọn một ưu tiên.</em></h2><p>Tổng hợp cho demo Leader từ hoạt động đội; không hiển thị bất kỳ dữ liệu khách hàng nào.</p></div><button onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>{expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}{expanded ? "Thu gọn" : "Xem báo cáo"}</button></header>{expanded && <><div className="sprint11-director-kpis"><article><strong>12</strong><span>TVV hoạt động</span><small>trong chu kỳ hiện tại</small></article><article><strong>74%</strong><span>Tỷ lệ chạm</span><small>follow-up đúng nhịp</small></article><article><strong>01</strong><span>Điểm sáng</span><small>thói quen cần nhân rộng</small></article><article><strong>03</strong><span>Tín hiệu ưu tiên</span><small>cần coaching tuần này</small></article></div><div className="sprint11-director-insights"><article><span>ĐIỂM SÁNG</span><h3>Nhóm vẫn giữ được 19 chạm nuôi dưỡng.</h3><p>Ưu tiên ghi nhận hành động bền vững, không chỉ nhìn vào hợp đồng đã chốt.</p></article><article><span>ĐỀ XUẤT TUẦN TỚI</span><h3>Roleplay 15 phút theo nhóm tín hiệu.</h3><p>Đi từ câu hỏi mở, xác nhận ngày follow-up, rồi mới review kết quả chuyển đổi.</p></article></div><button className="sprint11-director-action" onClick={() => onToast("Báo cáo GĐ đã sẵn sàng: ưu tiên coaching 15 phút, follow-up có ngày hẹn và vinh danh hành động tốt.")}><Sparkles size={16} />Chốt kế hoạch tuần</button></>}</section>;
}

export function Sprint11LeaderCompass({ items, loading, error, onOpenRoleplay, isSuperAdmin = false, onContentChanged }: { items: LeadershipItem[]; loading: boolean; error: string; onOpenRoleplay: (item: LeadershipItem) => void; isSuperAdmin?: boolean; onContentChanged?: () => void }) {
  const [tab, setTab] = useState<"principle" | "coaching_script">("principle");
  const [open, setOpen] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState("all");
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const data = items;
  const principlesList = data.filter((item) => item.type === "principle");
  const coachingList = data.filter((item) => item.type === "coaching_script");
  const tags = Array.from(new Set(coachingList.flatMap((item) => item.tags ?? [])));
  const filteredCoachingList = coachingList.filter((item) => selectedTag === "all" || (item.tags ?? []).includes(selectedTag));
  const visibleItems = tab === "principle" ? principlesList : filteredCoachingList;

  return (
    <div className="sprint11-leader-page screen-enter">
      <section className="sprint11-leader-hero">
        <div><span><Compass size={16} />LA BÀN LÃNH ĐẠO · SUPABASE</span><h1>Giữ người bằng<br /><em>một nhịp rõ ràng.</em></h1><p>Nguyên tắc quản trị giúp Leader đi từ tín hiệu đến một cuộc trò chuyện có ích.</p></div>
        <div><Users size={46} /><small>LEADER PLAYBOOK</small></div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="sprint11-leader-tabs" role="tablist" aria-label="La Bàn Lãnh Đạo">
          <button role="tab" aria-selected={tab === "principle"} className={tab === "principle" ? "is-active" : ""} onClick={() => setTab("principle")}><Compass size={16} />Nguyên tắc</button>
          <button role="tab" aria-selected={tab === "coaching_script"} className={tab === "coaching_script" ? "is-active" : ""} onClick={() => setTab("coaching_script")}><Target size={16} />Kịch bản Coaching</button>
        </div>
        {isSuperAdmin && <AdminLeaderPlaybook onChanged={onContentChanged ?? (() => undefined)} />}
      </div>

      {loading ? <p className="sprint11-leader-state">Đang đồng bộ La Bàn Lãnh Đạo…</p> : error ? <p className="sprint11-leader-state is-error">{error}</p> : !visibleItems.length ? <p className="sprint11-leader-state">Chưa có nội dung phù hợp với bộ lọc hiện tại.</p> : tab === "principle" ? (
        <div className="sprint11-compass-list" data-leader-principles="accordion">
          {principlesList.map((item, index) => {
            const active = open === item.code;
            const carousel = item.learning_carousel;
            const situations = carousel?.situations ?? [];
            const summary = carousel?.summary;
            const isSummaryStep = activeStep === situations.length;
            const situation = situations[activeStep];
            const answered = selectedAnswer !== null;
            const correct = answered && selectedAnswer === situation?.correct_index;
            return <article className={active ? "is-open" : ""} key={item.code}><button onClick={() => { setOpen(active ? null : item.code); setActiveStep(0); setSelectedAnswer(null); }} aria-expanded={active}><span>{item.prefix ?? String(index + 1).padStart(2, "0")}</span><strong>{item.topic}</strong>{active ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>{active && <div><p className="whitespace-pre-wrap">{item.core_thinking}</p>{item.note && <small><Sparkles size={14} />{item.note}</small>}{carousel && summary && (isSummaryStep ? <section className="mt-5 rounded-2xl bg-[#1A365D] p-5 !text-white shadow-lg" aria-label={`Tổng kết ${item.topic}`}><span className="text-xs font-black tracking-[0.16em] !text-yellow-400">HOÀN TẤT LEARNING CAROUSEL</span><h3 className="mt-2 text-lg font-black leading-6 !text-yellow-400">{summary.title}</h3><p className="mt-3 text-sm font-medium leading-6 !text-white">{summary.content}</p><div className="mt-4 rounded-xl border border-yellow-400/30 bg-slate-800/80 p-3 text-sm font-bold leading-6 !text-gray-50"><span className="!text-yellow-100">{summary.homework}</span></div></section> : situation ? <section className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm" aria-label={`Learning Carousel ${item.topic}`}><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-black text-white shadow-sm">Tình huống {activeStep + 1}/{situations.length}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-700 transition-[width] duration-200" style={{ width: `${((activeStep + 1) / situations.length) * 100}%` }} /></div></div><p className="mt-4 text-sm font-black leading-6 text-slate-950">{situation.question}</p><div className="mt-4 grid gap-3">{situation.options.map((option, optionIndex) => { const isSelected = selectedAnswer === optionIndex; const stateClass = !answered ? "border-slate-200 bg-white text-slate-800 shadow-md hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg" : isSelected ? correct ? "border-green-500 bg-green-50 text-green-900 shadow-sm" : "border-amber-500 bg-amber-50 text-amber-900 shadow-sm" : "border-slate-200 bg-slate-100 text-slate-400"; return <button key={option} type="button" disabled={answered} onClick={() => setSelectedAnswer(optionIndex)} className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-bold transition disabled:cursor-default ${stateClass}`}>{option}</button>; })}</div>{answered && <div className={`mt-4 rounded-xl border p-4 text-sm font-medium leading-6 shadow-sm ${correct ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}><strong className={correct ? "text-green-900" : "text-amber-900"}>{correct ? "Đúng rồi — bạn đã chọn một hướng xử lý bền vững." : "Chưa đúng — hãy nhìn lại tác động dài hạn với đội ngũ."}</strong><p className="mt-1">{correct ? situation.correct_explanation : situation.wrong_explanation}</p></div>}{answered && <button type="button" onClick={() => { setActiveStep((current) => Math.min(current + 1, situations.length)); setSelectedAnswer(null); }} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 active:scale-[0.97]">Tiếp tục →</button>}</section> : null)}</div>}</article>;
          })}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Lọc tình huống coaching">
            <button type="button" onClick={() => setSelectedTag("all")} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${selectedTag === "all" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>Tất cả</button>
            {tags.map((tag) => <button key={tag} type="button" onClick={() => setSelectedTag(tag)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${selectedTag === tag ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>{tag}</button>)}
          </div>
          <section className="sprint11-coaching-scenarios grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" data-leader-coaching="card-grid">
            {filteredCoachingList.map((item) => <article className="relative flex min-h-[300px] flex-col" key={item.code}><span>{item.prefix ?? "CHẠM"}</span><h2>{item.topic}</h2><p>{item.core_thinking}</p><div className="mt-4 flex flex-wrap gap-1.5">{(item.tags ?? []).map((tag) => <small key={tag} className="rounded-full bg-indigo-50 px-2 py-1 font-bold text-indigo-700">{tag}</small>)}</div><footer className="mt-auto"><CalendarClock size={15} />{item.note}</footer><button type="button" onClick={() => onOpenRoleplay(item)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.97]"><Sparkles size={16} className="text-amber-300" />🎭 Luyện tập với AI</button></article>)}
          </section>
        </>
      )}
    </div>
  );
}
