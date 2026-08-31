import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlignLeft, CheckCircle2, ChevronRight, Loader2, LockKeyhole, Mic, RotateCcw, Sparkles, User } from "lucide-react";
import { type ActiveLearningChallenge, type PilotSession, type PlaybookCard } from "../lib/supabaseContent";
import { canViewTeamScopedContent, filterTeamScopedContent, type ContentDataViewMode } from "../lib/contentScope";

type UserRole = "FREE" | "PRO";
type RoleplayStage = "preparation" | "customer_playing" | "idle" | "recording" | "analyzing" | "result";
type AiRoleplayResult = { score: number; transcript: string; praise: string; blindSpot: string; advice: string };
export type AiRoleplayPayload = {
  system_prompt: string;
  context: { situation: string; customer_insight: string | null; mindset: string; core_logic: string | null; standard_script: string | null };
  user_transcript: string;
};

type BaoBoiStudioProps = {
  session: PilotSession | null;
  playbooks: PlaybookCard[];
  userRole: UserRole;
  onRoleplayCompleted?: () => Promise<void> | void;
  activeChallenge?: ActiveLearningChallenge | null;
  onAcceptChallenge?: (playbook: PlaybookCard) => Promise<void> | void;
  learningRequest?: { playbookCode: string; openRoleplay: boolean } | null;
  onLearningRequestHandled?: () => void;
};

/** Client-side defense in depth; Supabase RLS remains the authoritative gate for Leader-only cards. */
export function canAccessPlaybookLevel(requiredLevel: string | null | undefined, role: string | null | undefined) {
  return (requiredLevel || "Rookie").trim().toLocaleLowerCase("en-US") !== "leader" || role === "leader" || role === "super_admin";
}

/** Groups granular skill-system labels into readable macro pillars for the Studio tabs. */
export function getPillar(category: string | null | undefined) {
  const lower = (category || "").toLocaleLowerCase("vi-VN");
  if (["y khoa", "thẩm định", "boi thuong", "bồi thường", "pháp lý", "phap ly", "tuân thủ", "tuan thu"].some((term) => lower.includes(term))) return "Kiến thức Y Khoa & Pháp lý";
  if (["khai vấn", "khai van", "spin", "socratic", "phễu", "pheu", "storytelling"].some((term) => lower.includes(term))) return "Nghệ thuật Khai vấn";
  if (["từ chối", "tu choi", "funnel", "deal", "ngại", "ngai", "chốt", "chot"].some((term) => lower.includes(term))) return "Xử lý Từ chối & Chốt Sales";
  if (["cskh", "tiêu chuẩn", "tieu chuan", "dịch vụ", "dich vu"].some((term) => lower.includes(term))) return "Tiêu chuẩn CSKH";
  return "Kỹ năng Thực chiến";
}

function containsPotentialPii(value: string) {
  return /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(value) || /(?:\+?84|0)\d{8,10}\b/.test(value.replace(/[.\s()-]/g, ""));
}

/** Builds the server-ready contract without transmitting or persisting roleplay text from the browser. */
export function buildAiRoleplayPayload(playbook: PlaybookCard, userScript: string): AiRoleplayPayload {
	const suppliedRoleplayPrompt = playbook.ai_evaluation_rules?.roleplay_prompt?.trim();
  return {
		// The CMS-owned roleplay prompt defines the persona and evaluation objective per scenario.
    system_prompt: suppliedRoleplayPrompt
			? `${suppliedRoleplayPrompt}\n\nAn toàn: Chỉ đánh giá văn bản được cung cấp; không suy luận, yêu cầu hoặc lưu dữ liệu định danh khách hàng.`
			: "Bạn là Master Consultant và chuyên gia thẩm định. Đánh giá câu trả lời của TVV theo ba tiêu chí: thấu cảm, logic y khoa/pháp lý, và sự rõ ràng của ngôn ngữ. Chỉ đánh giá văn bản được cung cấp; không suy luận hoặc yêu cầu dữ liệu định danh khách hàng.",
    context: {
      situation: playbook.situation,
      customer_insight: playbook.customer_insight,
      mindset: playbook.mindset,
      core_logic: playbook.core_logic,
      standard_script: playbook.coaching_prompts,
    },
    user_transcript: userScript.trim(),
  };
}

function createSimulatedAiResult(payload: AiRoleplayPayload): AiRoleplayResult {
  const isEmpathetic = /hiểu|lắng nghe|chia sẻ|đồng cảm/i.test(payload.user_transcript);
	const promptFocus = payload.system_prompt.split("\n\nAn toàn:")[0].trim().replace(/\s+/g, " ").slice(0, 220);
  return {
    score: isEmpathetic ? 8.5 : 7.5,
    transcript: payload.user_transcript,
    praise: isEmpathetic ? "Bản nháp thể hiện sự thấu cảm và có định hướng bảo vệ quyền lợi khách hàng." : "Bản nháp đã chủ động xử lý tình huống và có điểm tựa từ Bảo Bối.",
    blindSpot: "Hãy gắn rõ hơn một dẫn chứng từ Logic cốt lõi vào câu chốt để tăng tính thuyết phục.",
		advice: `Bám sát yêu cầu của tình huống: ${promptFocus}`,
  };
}

export function AIRoleplayStudio({ playbook, onClose, onCompleted, activeChallenge, onAcceptChallenge }: { playbook: PlaybookCard | null; onClose: () => void; onCompleted?: () => Promise<void> | void; activeChallenge?: ActiveLearningChallenge | null; onAcceptChallenge?: (playbook: PlaybookCard) => Promise<void> | void }) {
  if (!playbook) return null;
  const [stage, setStage] = useState<RoleplayStage>("preparation");
  const [userScript, setUserScript] = useState("");
  const [preparationError, setPreparationError] = useState("");
  const [aiResult, setAiResult] = useState<AiRoleplayResult | null>(null);
  const completedRef = useRef(false);
  const script = playbook.coaching_prompts || "Chưa có kịch bản mẫu cho tình huống này.";
  const customerInsight = playbook.customer_insight || "Chưa có dữ liệu insight; hãy bắt đầu bằng việc lắng nghe nhu cầu và mối bận tâm thực sự của khách hàng.";
  const coreLogic = playbook.core_logic || "Hiểu lý do phía sau phương pháp để linh hoạt ứng dụng vào đúng nhu cầu của khách hàng.";

  const startRoleplay = () => {
    if (!userScript.trim()) {
      setPreparationError("Hãy viết nháp cách xử lý của bạn trước khi thực chiến nhé.");
      return;
    }
    if (containsPotentialPii(userScript)) {
      setPreparationError("Vui lòng bỏ số điện thoại hoặc email khỏi bản nháp trước khi mô phỏng.");
      return;
    }
    setPreparationError("");
    setStage("customer_playing");
  };

  const completeRoleplay = () => {
    const aiPayload = buildAiRoleplayPayload(playbook, userScript);
    setStage("analyzing");
    window.setTimeout(() => {
      setAiResult(createSimulatedAiResult(aiPayload));
      setStage("result");
      if (!completedRef.current) {
        completedRef.current = true;
        void onCompleted?.();
      }
    }, 1800);
  };

  useEffect(() => {
    if (stage !== "customer_playing") return;
    const timer = window.setTimeout(() => {
      setStage("idle");
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={onClose}>
      <section className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl lg:h-[85vh]" role="dialog" aria-modal="true" aria-label="AI Roleplay Studio" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between gap-4 bg-slate-900 p-4 text-white sm:p-6">
          <div><h3 className="mb-1 flex items-center gap-2 text-xl font-black"><Sparkles size={20} className="text-amber-400" />AI Roleplay Studio</h3><p className="text-sm text-slate-400">Trụ cột: {getPillar(playbook.skill_system)} / Cấp độ: {playbook.required_level || "Rookie"}</p></div>
          <button type="button" data-export-ignore="true" onClick={onClose} className="relative z-20 shrink-0 cursor-pointer pointer-events-auto rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 transition-all hover:bg-slate-700 hover:text-white">Đóng phòng</button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50 lg:flex-row lg:overflow-hidden">
          <aside className="min-h-0 w-full overflow-y-auto border-b border-slate-200 bg-white p-5 lg:w-5/12 lg:border-b-0 lg:border-r lg:p-6 xl:p-8">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Iceberg Cognitive Learning Path · 5 bước</span>
            <div className="mb-6 rounded-2xl border-b-2 border-slate-100 bg-slate-50 p-4"><span className="mb-2 inline-block rounded-lg bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">1. Tình huống (Phần nổi)</span><h4 className="text-xl font-black leading-tight text-slate-900">{playbook.situation}</h4></div>
            <div className="mb-6"><span className="mb-2 inline-block rounded-lg bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-800">2. Sự thật / Customer Insight</span><p className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 text-sm font-medium leading-relaxed text-cyan-950">{customerInsight}</p></div>
            <div className="mb-6"><span className="mb-2 inline-block rounded-lg bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-800">3. Góc nhìn định tâm</span><p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-700">{playbook.mindset || "Chưa có dữ liệu định tâm."}</p></div>
            <div className="mb-6"><span className="mb-2 inline-block rounded-lg bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-800">4. Logic & Dẫn chứng (The Why)</span><p className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-sm font-bold leading-relaxed text-rose-950">{coreLogic}</p></div>
            <div><span className="mb-2 inline-block rounded-lg bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-800">5. Kịch bản chuẩn (The How)</span><div className="whitespace-pre-wrap rounded-xl border border-indigo-100/50 bg-indigo-50/30 p-4 text-sm font-bold leading-relaxed text-slate-800">{script}</div></div><div className="mt-8 rounded-b-xl border-t border-slate-200 bg-slate-50 p-5 text-center"><h4 className="mb-2 font-black text-slate-800">Học đi đôi với hành!</h4><p className="mb-4 text-sm text-slate-500">Áp dụng phương pháp vừa học vào một ca thực chiến, rồi ghi Nhịp Đập để nhận thưởng XP. Không nhập dữ liệu nhận diện khách hàng.</p><button type="button" disabled={Boolean(activeChallenge && activeChallenge.playbookCode !== playbook.code)} onClick={() => void onAcceptChallenge?.(playbook)} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400">{activeChallenge?.playbookCode === playbook.code ? "✓ Thử thách đang hoạt động" : activeChallenge ? "Hoàn tất thử thách đang nhận trước" : "⚔ Nhận Thử Thách Ngay"}</button></div>
          </aside>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-slate-50/60 p-5 lg:w-7/12 lg:p-6 xl:p-8">
            {stage === "preparation" && <div className="flex min-h-0 flex-1 flex-col"><div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-600">1</span><div><h3 className="text-lg font-black text-slate-900">Biến kiến thức thành của bạn</h3><p className="text-sm text-slate-500">Dựa vào Logic bên trái, hãy nháp câu trả lời theo văn phong của bạn.</p></div></div><textarea value={userScript} onChange={(event) => { setUserScript(event.target.value); setPreparationError(""); }} placeholder="Không nhập tên, số điện thoại hoặc dữ liệu khách hàng. Ví dụ: Dạ em hiểu anh đang cân nhắc chi phí..." className="mb-3 min-h-[220px] w-full flex-1 resize-none rounded-2xl border-2 border-emerald-100 bg-white p-5 text-base font-medium text-slate-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />{preparationError && <p className="mb-3 text-sm font-bold text-rose-600">{preparationError}</p>}<button type="button" onClick={startRoleplay} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl transition-all hover:scale-[1.01] hover:bg-slate-800 active:scale-[0.99]">Lưu nháp &amp; Bắt đầu Roleplay <Mic size={18} className="text-emerald-400" /></button><p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Mô phỏng tại trình duyệt · Không thu, xử lý hoặc lưu âm thanh/PII</p></div>}
            {(stage === "customer_playing" || stage === "idle" || stage === "recording") && <><div className="mb-8 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-600">2</span><div><h3 className="text-lg font-black text-slate-900">Thực chiến Audio mô phỏng</h3><p className="text-sm text-slate-500">Lắng nghe khách hàng rồi thử phản hồi theo bản nháp của bạn.</p></div></div><div className={`mb-8 flex flex-col items-start transition-all duration-500 ${stage === "customer_playing" ? "opacity-100" : "origin-top-left scale-95 opacity-70"}`}>
              <span className="mb-2 ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng mô phỏng</span>
              <div className="flex max-w-[85%] items-center gap-4 rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stage === "customer_playing" ? "animate-pulse bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}><User size={20} /></div>{stage === "customer_playing" ? <div className="flex items-center gap-1.5"><span className="h-5 w-1.5 animate-pulse rounded-full bg-indigo-400" /><span className="h-3 w-1.5 animate-pulse rounded-full bg-indigo-400" /><span className="h-5 w-1.5 animate-pulse rounded-full bg-indigo-400" /><span className="ml-2 text-sm font-bold text-indigo-600">Đang trình bày tình huống...</span></div> : <p className="text-sm font-medium text-slate-500">Đã xong phần trình bày.</p>}</div>
            </div>
            {(stage === "idle" || stage === "recording") && <div className="mt-auto flex flex-col items-end"><span className="mb-2 mr-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">Tư Vấn Viên (Bạn)</span><div className={`flex w-full max-w-[90%] flex-col items-center rounded-3xl rounded-tr-sm border-2 p-6 shadow-lg ${stage === "recording" ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>{stage === "idle" ? <><p className="mb-2 text-center text-sm font-bold text-slate-700">Đến lượt bạn. Hãy tự tin phản hồi!</p><p className="mb-6 line-clamp-2 text-center text-xs text-slate-500">Bản nháp: “{userScript}”</p><button type="button" onClick={() => setStage("recording")} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-black text-white shadow-lg transition-all hover:bg-emerald-500"><Mic size={18} />Bắt đầu Ghi âm mô phỏng</button></> : <><div className="mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-red-100 text-red-600"><Mic size={28} /></div><p className="mb-6 text-sm font-bold text-red-600">Đang ghi âm mô phỏng...</p><button type="button" onClick={completeRoleplay} className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-black text-white transition-all hover:bg-slate-800">Hoàn thành &amp; nhận góp ý</button></>}<p className="mt-4 text-center text-[9px] font-medium uppercase tracking-widest text-slate-400">Mô phỏng tại trình duyệt · Không thu, xử lý hoặc lưu trữ âm thanh</p></div></div>}</>}
            {stage === "analyzing" && <div className="mt-auto flex flex-1 flex-col items-center justify-center text-center"><Loader2 size={40} className="mb-4 animate-spin text-emerald-600" /><h4 className="text-base font-black text-slate-800">AI Mentor đang tạo góp ý mô phỏng...</h4><p className="mt-2 max-w-xs text-sm text-slate-500">Payload đánh giá đã được cấu trúc theo Situation, Insight, Logic và bản nháp; không gửi hoặc lưu âm thanh/PII trong phiên này.</p></div>}
            {stage === "result" && aiResult && <div className="flex min-h-0 flex-1 flex-col"><div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-600">3</span><div><h3 className="text-lg font-black text-slate-900">Báo cáo Phản tỉnh</h3><p className="text-sm text-slate-500">Góp ý mô phỏng từ AI Mentor · API-ready payload</p></div></div><div className="mb-5 flex items-center gap-4 rounded-2xl border-2 border-emerald-500 bg-white p-5 shadow-lg"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-600">{aiResult.score.toFixed(1)}</div><div><h4 className="text-base font-black text-slate-900">Phản hồi có tính thuyết phục cao!</h4><p className="mt-1 text-xs font-medium text-slate-600">{aiResult.praise}</p></div></div><div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="mb-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400"><Mic size={12} />Bản nháp của bạn (không phải transcript audio)</span><p className="border-l-4 border-slate-200 pl-3 text-sm italic leading-relaxed text-slate-700">“{aiResult.transcript}”</p></div><div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="mb-3 block text-[10px] font-black uppercase tracking-widest text-indigo-500">Phân tích Điểm mù (Blind Spot Analysis)</span><ul className="space-y-3 text-sm leading-relaxed text-slate-700"><li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /><span><strong className="text-emerald-700">Điểm sáng:</strong> {aiResult.praise}</span></li><li>• {aiResult.blindSpot}</li><li>• <strong>Lời khuyên:</strong> {aiResult.advice}</li></ul></div><button type="button" onClick={() => { completedRef.current = false; setAiResult(null); setStage("preparation"); }} className="mt-auto w-full rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-200">Chỉnh nháp &amp; Thử lại</button></div>}
          </div>
        </div>
      </section>
    </div>
  );
}

type PlaybookCardProps = { playbook: PlaybookCard; index: number; userRole: UserRole; onSelect: (playbook: PlaybookCard) => void; };

function isRoleplayPlaybook(playbook: PlaybookCard | null) {
  const roleplayContext = [playbook?.situation, playbook?.skill_system, playbook?.coaching_prompts].filter(Boolean).join(" ");
  return Boolean(playbook?.coaching_prompts?.trim()) || /roleplay|kịch\s*bản/i.test(roleplayContext);
}

function PlaybookCard({ playbook, index, userRole, onSelect }: PlaybookCardProps) {
const locked = userRole === "FREE" && playbook.is_pro;
const openPlaybook = () => {
if (locked) return;
onSelect(playbook);
};
const [isFlipped, setIsFlipped] = useState(false);
const flipOrOpen = () => {
if (locked) return;
if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
onSelect(playbook);
return;
}
setIsFlipped(true);
};
	return <article className={`flashcard-scene group perspective-1000 w-full h-[300px] cursor-pointer card-${(index % 4) + 1} ${locked ? "is-pro-locked" : ""} ${isFlipped ? "is-flipped" : ""}`} onClick={() => { if (!locked) onSelect(playbook); }}>
	    <div className="flashcard relative w-full h-full transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
	      <div className="flashcard-face flashcard-front absolute inset-0 backface-hidden bg-white shadow-md rounded-2xl p-6 flex flex-col overflow-hidden cursor-pointer" role="button" tabIndex={0} onClick={flipOrOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); flipOrOpen(); } }} aria-label={`${playbook.situation}. ${locked ? "Bảo Bối PRO đã khóa" : "Chạm để lật thẻ"}`}>
	        <div className="card-top"><span className="playbook-emoji">{locked ? "🔒" : "⚡"}</span><span className="flip-mark">{locked ? <LockKeyhole size={15} /> : <RotateCcw size={15} />}</span></div><div className="card-content"><small>{getPillar(playbook.skill_system)} · {playbook.required_level || "Rookie"}</small><strong className="line-clamp-3">{playbook.situation}</strong><em className="playbook-mindset">{playbook.mindset}</em></div><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); flipOrOpen(); }} className="card-footer relative z-20 cursor-pointer pointer-events-auto">{locked ? "Mở khóa Gói Tăng Tốc" : "Lật thẻ để xem kịch bản"}<ChevronRight size={16} /></button>{locked && <span className="pro-badge"><LockKeyhole size={12} />PRO</span>}
      </div>
	      <div className="flashcard-face flashcard-back absolute inset-0 backface-hidden rotate-y-180 bg-slate-50 shadow-md rounded-2xl p-6 flex flex-col justify-between overflow-hidden pointer-events-auto">
        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setIsFlipped(false); }} aria-label="Quay lại mặt trước" className="absolute right-4 top-4 z-[60] cursor-pointer rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"><RotateCcw size={14} /></button>
	        <div className="back-top pr-10"><span>{getPillar(playbook.skill_system)}</span><AlignLeft size={16} /></div><div className="questions"><strong>{playbook.situation}</strong><p className="text-xs font-medium leading-relaxed text-slate-600">{playbook.mindset || "Chọn một góc nhìn định tâm trước khi mở kịch bản."}</p><p className="line-clamp-4 mb-4 text-xs font-bold leading-relaxed text-slate-700">{playbook.coaching_prompts || "Chưa có kịch bản mẫu."}</p></div><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setIsFlipped(false); onSelect(playbook); }} className="relative z-[99] pointer-events-auto cursor-pointer mt-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-500"><AlignLeft size={16} />Xem toàn bộ</button>
      </div>
    </div>
  </article>;
}

function DesktopPlaybookDetail({ selectedItem, onPractice }: { selectedItem: PlaybookCard | null; onPractice: (playbook: PlaybookCard) => void }) {
  if (!selectedItem) return null;
  return <aside className="hidden min-h-[520px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex" aria-label="Chi tiết Bảo Bối đang chọn">
    <span className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Bảo Bối đang chọn</span>
    <h3 className="text-2xl font-black leading-tight text-slate-900">{selectedItem?.situation}</h3>
    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{selectedItem?.mindset || "Chọn góc nhìn định tâm trước khi chuyển thành hành động thực chiến."}</p>
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-indigo-600">Kịch bản (Xem trước)</span><p className="line-clamp-6 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-700">{selectedItem?.coaching_prompts || "Chưa có kịch bản mẫu."}</p></div>
    {isRoleplayPlaybook(selectedItem) && <button type="button" onClick={() => onPractice(selectedItem)} className="relative z-20 mt-auto flex w-full cursor-pointer pointer-events-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-emerald-500"><Sparkles size={16} />Bắt đầu AI Roleplay</button>}
  </aside>;
}

function MobilePlaybookDetail({ selectedItem, onClose, onPractice }: { selectedItem: PlaybookCard | null; onClose: () => void; onPractice: (playbook: PlaybookCard) => void }) {
  if (!selectedItem) return null;
  return <div className="lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col w-full h-full" role="dialog" aria-modal="true" aria-label="Chi tiết Bảo Bối" tabIndex={-1}>
    <div className="flex items-center justify-between p-4 border-b bg-slate-50 flex-shrink-0"><h3 className="font-bold text-slate-800 text-base line-clamp-1">{selectedItem?.situation || "Chi tiết"}</h3><button type="button" onClick={onClose} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-full font-bold text-sm">✕ Đóng</button></div>
    <div className="flex-1 overflow-y-auto p-4 pb-28"><div className="mx-auto flex w-full max-w-2xl flex-col"><span className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Bảo Bối thực chiến</span><p className="text-sm font-medium leading-relaxed text-slate-600">{selectedItem?.mindset || "Chọn góc nhìn định tâm trước khi chuyển thành hành động thực chiến."}</p><section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-cyan-800">Sự thật / Customer Insight</span><p className="text-sm leading-relaxed text-cyan-950">{selectedItem?.customer_insight || "Hãy bắt đầu bằng việc lắng nghe nhu cầu và mối bận tâm thực sự."}</p></section><section className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-indigo-700">Kịch bản chuẩn</span><p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-700">{selectedItem?.coaching_prompts || "Chưa có kịch bản mẫu."}</p></section>{isRoleplayPlaybook(selectedItem) && <button type="button" onClick={() => { onPractice(selectedItem); onClose(); }} className="relative z-[60] mt-6 flex w-full cursor-pointer pointer-events-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg transition hover:bg-emerald-500"><Sparkles size={16} />Bắt đầu AI Roleplay</button>}</div></div>
  </div>;
}

export function BaoBoiStudio({ session, playbooks, userRole, onRoleplayCompleted, activeChallenge = null, onAcceptChallenge, learningRequest = null, onLearningRequestHandled }: BaoBoiStudioProps) {
  const [dataViewMode, setDataViewMode] = useState<ContentDataViewMode>("GLOBAL");
  const canViewEndUserContent = canViewTeamScopedContent(session?.profile.role);
  const currentTeamId = session?.profile.primary_team_id;
  const effectiveDataViewMode: ContentDataViewMode = canViewEndUserContent ? dataViewMode : "GLOBAL";
  const displayedPlaybooks = useMemo(
    () => filterTeamScopedContent(playbooks, effectiveDataViewMode, currentTeamId).filter((playbook) => canAccessPlaybookLevel(playbook.required_level, session?.profile.role)),
    [currentTeamId, effectiveDataViewMode, playbooks, session?.profile.role],
  );
  const availableTabs = useMemo(() => Array.from(new Set(displayedPlaybooks.map((playbook) => getPillar(playbook.skill_system)))), [displayedPlaybooks]);
	const [activeTab, setActiveTab] = useState("");
	const [roleplayItem, setRoleplayItem] = useState<PlaybookCard | null>(null);
	const [selectedItem, setSelectedItem] = useState<PlaybookCard | null>(null);
	const pendingLearningSelectionRef = useRef<string | null>(null);
  useEffect(() => { setActiveTab((current) => availableTabs.some((tab) => tab === current) ? current : (availableTabs[0] ?? "")); }, [availableTabs]);
  useEffect(() => { setRoleplayItem((current) => current && displayedPlaybooks.some((playbook) => playbook.code === current.code) ? current : null); }, [displayedPlaybooks]);
	useEffect(() => {
		if (!learningRequest || !playbooks.length) return;
		const requestedPlaybook = displayedPlaybooks.find((playbook) => playbook.code === learningRequest.playbookCode);
		if (requestedPlaybook) {
			pendingLearningSelectionRef.current = requestedPlaybook.code;
			setActiveTab(getPillar(requestedPlaybook.skill_system));
			setSelectedItem(requestedPlaybook);
			if (learningRequest.openRoleplay && isRoleplayPlaybook(requestedPlaybook)) setRoleplayItem(requestedPlaybook);
		}
		onLearningRequestHandled?.();
	}, [displayedPlaybooks, learningRequest, onLearningRequestHandled, playbooks.length]);
		const currentTabPlaybooks = useMemo(() => displayedPlaybooks.filter((playbook) => getPillar(playbook.skill_system) === activeTab), [activeTab, displayedPlaybooks]);
		useEffect(() => { setSelectedItem((current) => {
			if (current && pendingLearningSelectionRef.current === current.code) {
				pendingLearningSelectionRef.current = null;
				return current;
			}
			return current && currentTabPlaybooks.some((playbook) => playbook.code === current.code) ? current : null;
		}); }, [currentTabPlaybooks]);
		const handleSelectPlaybook = (playbook: PlaybookCard) => {
		if (!canAccessPlaybookLevel(playbook.required_level, session?.profile.role)) return;
		setSelectedItem(playbook);
		if (isRoleplayPlaybook(playbook)) setRoleplayItem(playbook);
		};

  return <section className="screen-enter playbook-page" aria-label="La Bàn Kỹ Năng">
    {canViewEndUserContent && <div className="flex bg-slate-800 p-1 rounded-xl mb-4" aria-label="Phạm vi kiến thức"><button type="button" onClick={() => setDataViewMode("GLOBAL")} aria-pressed={dataViewMode === "GLOBAL"} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${dataViewMode === "GLOBAL" ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}>Kiến thức Hệ thống (Global)</button><button type="button" onClick={() => setDataViewMode("LOCAL")} aria-pressed={dataViewMode === "LOCAL"} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${dataViewMode === "LOCAL" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}>Nội bộ Team của bạn (Local)</button></div>}
    <div className="mb-5 flex flex-wrap gap-2 overflow-x-auto border-b border-slate-100 pb-4" role="tablist" aria-label="Trụ cột kỹ năng">{availableTabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === tab ? "bg-emerald-100 text-emerald-700 shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{tab}</button>)}{!availableTabs.length && <p className="text-sm text-slate-400">Chưa có Bảo Bối trong thư viện.</p>}</div>
		<div className="flex flex-col gap-6"><div className="flashcard-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">{currentTabPlaybooks.map((playbook, index) => <PlaybookCard key={playbook.code} playbook={playbook} index={index} userRole={userRole} onSelect={handleSelectPlaybook} />)}</div><div className="hidden lg:block">{selectedItem ? <DesktopPlaybookDetail selectedItem={selectedItem} onPractice={setRoleplayItem} /> : <aside className="min-h-[220px] rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-400">Chọn một Bảo Bối để xem chi tiết.</aside>}</div></div>
	{selectedItem && <MobilePlaybookDetail selectedItem={selectedItem} onClose={() => setSelectedItem(null)} onPractice={setRoleplayItem} />}
	    {roleplayItem && <AIRoleplayStudio playbook={roleplayItem} onClose={() => setRoleplayItem(null)} onCompleted={onRoleplayCompleted} activeChallenge={activeChallenge} onAcceptChallenge={onAcceptChallenge} />}
  </section>;
}
