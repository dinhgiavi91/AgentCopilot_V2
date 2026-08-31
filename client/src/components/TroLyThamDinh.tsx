import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, CheckCircle2, ClipboardCopy, FileText, Info, ListChecks, Loader2, Search, ShieldCheck, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";
import { type PilotSession, fetchUwDictionary, fetchUwTemplates, type UwDictionaryEntry, type UwTemplate, type UwTemplatePhase } from "../lib/supabaseContent";
import { canViewTeamScopedContent, filterTeamScopedContent, type ContentDataViewMode } from "../lib/contentScope";
import { TroLyThamDinhCMS } from "./TroLyThamDinhCMS";
import { UwTemplatesCMS } from "./UwTemplatesCMS";

type TroLyThamDinhProps = { session: PilotSession | null };
export type UwLetterType = string;
export type UwLetterInput = {
  letterType: UwLetterType;
  company: string;
  reference: string;
  issueName: string;
  time: string;
  statusOrHistory: string;
  documents: string;
};

export function hasPotentialUnderwritingPii(value: string) {
  const compact = value.replace(/[.\s()-]/g, "");
  return /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(value) || /(?:\+?84|0)\d{8,10}\b/.test(compact);
}

export function getUwGuideText(letterType: UwLetterType, templates: UwTemplate[] = []) {
  return templates.find((template) => template.template_code === letterType)?.guide_text || "Chọn template đang hoạt động để xem hướng dẫn nghiệp vụ.";
}

export function getUwDocumentChecklist(letterType: UwLetterType, dictionaryDocs?: string | null, templates: UwTemplate[] = []) {
  const selectedDocs = dictionaryDocs?.trim() ? [dictionaryDocs.trim()] : [];
  const templateChecklist = templates.find((template) => template.template_code === letterType)?.checklist ?? [];
  return [...selectedDocs, ...templateChecklist].filter((item, index, list) => list.indexOf(item) === index);
}

export function buildUwLetter(entry: UwDictionaryEntry, input: UwLetterInput, template?: UwTemplate) {
  const company = input.company.trim() || "[Tên Công ty Bảo hiểm]";
  const reference = input.reference.trim() || "[Mã tham chiếu không định danh]";
  const issue = input.issueName.trim() || entry.condition;
  const time = input.time.trim() || "[Thời điểm cần đối chiếu]";
  const history = input.statusOrHistory.trim() || "[Diễn giải cần bổ sung theo chứng từ]";
  const documents = input.documents.trim() || entry.docs || "[Chứng từ cần đối chiếu]";
  const header = "BẢN NHÁP NGHIỆP VỤ — CẦN UW/CHUYÊN MÔN RÀ SOÁT\nKhông chứa thông tin định danh khách hàng; không tự động gửi hoặc lưu. Cần đối chiếu quy tắc sản phẩm và sổ tay nghiệp vụ của công ty.";
  if (!template) return `${header}\n\nChưa tìm thấy template đang hoạt động. Vui lòng chọn mẫu thư từ CMS.`;
  if (/\{patient(?:_name)?\}/i.test(template.letter_body)) return `${header}\n\nTemplate đang chứa placeholder định danh không hợp lệ. Vui lòng dùng {reference} trong CMS.`;
  const variables: Record<string, string> = { company, reference, issue_name: issue, time, treatment: history, docs: documents };
  const body = template.letter_body.replace(/\{(company|reference|issue_name|time|treatment|docs)\}/g, (_placeholder, key: string) => variables[key] ?? "");
  return `${header}\n\n${body}`;
}

function GeneratorCard({ entry, dataViewMode, teamId }: { entry: UwDictionaryEntry; dataViewMode: ContentDataViewMode; teamId: string | null | undefined }) {
  const [letterType, setLetterType] = useState<UwLetterType>("MEDICAL");
  const [templates, setTemplates] = useState<UwTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState("");
  const [company, setCompany] = useState("");
  const [reference, setReference] = useState("");
  const [issueName, setIssueName] = useState(entry.condition);
  const [time, setTime] = useState("");
  const [history, setHistory] = useState("");
  const [documents, setDocuments] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const scopedTemplates = useMemo(() => filterTeamScopedContent(templates, dataViewMode, teamId), [dataViewMode, teamId, templates]);
  const preUwTemplates = scopedTemplates.filter((template) => template.phase === "PRE_UW");
  const claimTemplates = scopedTemplates.filter((template) => template.phase === "CLAIM");
  const activeTemplate = scopedTemplates.find((template) => template.template_code === letterType) ?? null;

  useEffect(() => {
    let mounted = true;
    void fetchUwTemplates().then((next) => {
      if (!mounted) return;
      setTemplates(next);
      setLetterType((current) => next.some((template) => template.template_code === current) ? current : (next[0]?.template_code ?? ""));
    }).catch((cause: unknown) => {
      if (mounted) setTemplatesError(cause instanceof Error ? cause.message : "Không thể tải templates từ CMS.");
    }).finally(() => { if (mounted) setTemplatesLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setLetterType((current) => scopedTemplates.some((template) => template.template_code === current) ? current : (scopedTemplates[0]?.template_code ?? ""));
  }, [scopedTemplates]);

  useEffect(() => {
    setIssueName(entry.condition);
    setDocuments(entry.docs ?? "");
    setGeneratedLetter("");
  }, [entry.id, entry.condition, entry.docs]);

  const generate = () => {
    const allInput = [company, reference, issueName, time, history, documents].join("\n");
    if (hasPotentialUnderwritingPii(allInput)) {
      toast.error("Không nhập email hoặc số điện thoại. Chỉ dùng mô tả hồ sơ không định danh.");
      return;
    }
    if (!activeTemplate) {
      toast.error("Chưa có template đang hoạt động. Vui lòng liên hệ quản trị viên.");
      return;
    }
    if (activeTemplate.template_code === "ACCIDENT" && !documents.trim()) {
      toast.error("Tường trình tai nạn cần liệt kê chứng từ hiện có; chỉ giải thích thiếu chứng từ khi có nguyên nhân khách quan, kiểm chứng được.");
      return;
    }
    setGeneratedLetter(buildUwLetter(entry, { letterType, company, reference, issueName, time, statusOrHistory: history, documents }, activeTemplate));
  };

  const copyLetter = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      toast.success("Đã copy bản nháp giải trình.");
    } catch {
      toast.error("Không thể copy tự động. Hãy chọn và copy nội dung thủ công.");
    }
  };
  return <article className="relative overflow-hidden rounded-[24px] border-2 border-slate-800 bg-slate-900 p-5 text-white shadow-xl sm:p-6">
    <FileText size={130} className="absolute -right-8 -top-8 text-white/[0.05]" />
    <div className="relative"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Smart Generator V6.1 · Local draft</span><h3 className="mt-1 text-xl font-black">Soạn Tường trình Nâng cao</h3><p className="mt-2 text-sm leading-6 text-slate-300">Chọn đúng tình huống, dùng dữ kiện không định danh và tạo bản nháp để UW/Claim rà soát. Bản nháp không tự gửi hoặc lưu.</p>
      <div className="relative z-10 mt-5 flex flex-col gap-4">{templatesLoading && <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-300"><Loader2 size={15} className="animate-spin" />Đang tải templates từ CMS…</div>}{templatesError && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-100">{templatesError}</p>}{([['PRE_UW', 'Giai đoạn 1: Thẩm định Cấp Hợp Đồng (Pre-UW)', preUwTemplates], ['CLAIM', 'Giai đoạn 2: Thẩm định Bồi Thường (Claim)', claimTemplates]] as Array<[UwTemplatePhase, string, UwTemplate[]]>).map(([phase, label, phaseTemplates]) => <div key={phase} className={`rounded-xl border bg-slate-800/50 p-3 ${phase === 'CLAIM' ? 'border-rose-500/30' : 'border-indigo-500/30'}`}><span className={`mb-2 block text-[10px] font-black uppercase tracking-widest ${phase === 'CLAIM' ? 'text-rose-400' : 'text-indigo-400'}`}>{label}</span><div className="flex flex-wrap gap-2">{phaseTemplates.map((template) => <button key={template.id} type="button" onClick={() => setLetterType(template.template_code)} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${letterType === template.template_code ? (phase === 'CLAIM' ? 'bg-rose-500 text-white shadow-md' : 'bg-indigo-500 text-white shadow-md') : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'}`}>{template.template_name}</button>)}</div></div>)}</div>
      <p className={`mt-3 rounded-xl border p-3 text-xs font-medium leading-5 ${activeTemplate?.phase === "CLAIM" ? "border-orange-300/50 bg-orange-400/10 text-orange-100" : "border-indigo-300/30 bg-indigo-400/10 text-indigo-100"}`}><strong>Hướng dẫn:</strong> {getUwGuideText(letterType, scopedTemplates)}</p>
      <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-200"><Info size={14} />Checklist chứng từ theo loại thư</div><ul className="mt-2 space-y-1.5">{getUwDocumentChecklist(letterType, entry.docs, scopedTemplates).map((document) => <li key={document} className="flex items-start gap-2 text-xs leading-5 text-emerald-50"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-300" />{document}</li>)}</ul></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kính gửi Công ty Bảo hiểm</span><input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ví dụ: Sun Life, Hanwha…" className="h-11 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition focus:border-emerald-500" /></label><label className="grid gap-1.5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã tham chiếu không định danh</span><input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Ví dụ: Hồ sơ A-17 (không tên/số HĐ)" className="h-11 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition focus:border-emerald-500" /></label><label className="grid gap-1.5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tên bệnh lý / Vấn đề</span><input value={issueName} onChange={(event) => setIssueName(event.target.value)} className="h-11 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition focus:border-emerald-500" /></label><label className="grid gap-1.5"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời điểm sự kiện</span><input value={time} onChange={(event) => setTime(event.target.value)} placeholder="Ví dụ: Tháng 5/2026" className="h-11 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition focus:border-emerald-500" /></label><label className="grid gap-1.5 sm:col-span-2"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diễn giải điều trị / bằng chứng y khoa</span><textarea value={history} onChange={(event) => setHistory(event.target.value)} placeholder="Nêu dữ kiện có thể đối chiếu từ toa thuốc, kết quả hoặc quá trình điều trị; không nhập PII…" className="min-h-[76px] rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500" /></label><label className="grid gap-1.5 sm:col-span-2"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giấy tờ đính kèm</span><input value={documents} onChange={(event) => setDocuments(event.target.value)} placeholder="Ví dụ: toa thuốc, siêu âm, xác nhận cơ sở KCB…" className="h-11 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none transition focus:border-emerald-500" /></label></div>
      <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">Không nhập tên khách hàng, số điện thoại, email, số hợp đồng hoặc lịch sử có thể nhận diện. Hệ thống không lưu các trường nhập này.</p><button type="button" onClick={generate} className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-500">Tạo Thư Giải Trình</button>
      {generatedLetter && <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4"><div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-black uppercase text-emerald-400">Bản thảo hoàn thiện</span><button type="button" onClick={() => void copyLetter()} className="flex items-center gap-1 text-xs font-bold text-slate-400 transition hover:text-white"><ClipboardCopy size={14} />Copy</button></div><p className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-300">{generatedLetter}</p></div>}
    </div>
  </article>;
}

function UnderwritingStudio({ session }: { session: PilotSession | null }) {
  const [entries, setEntries] = useState<UwDictionaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [dataViewMode, setDataViewMode] = useState<ContentDataViewMode>("GLOBAL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadDictionary = useCallback(async () => {
    setLoading(true); setError("");
    try { const next = await fetchUwDictionary(); setEntries(next); setSelectedId((current) => next.some((entry) => entry.id === current) ? current : (next[0]?.id ?? null)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tải Từ điển Thẩm định."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadDictionary(); }, [loadDictionary]);
  const canViewEndUserContent = canViewTeamScopedContent(session?.profile.role);
  const currentTeamId = session?.profile.primary_team_id;
  const effectiveDataViewMode: ContentDataViewMode = canViewEndUserContent ? dataViewMode : "GLOBAL";
  const scopedEntries = useMemo(() => filterTeamScopedContent(entries, effectiveDataViewMode, currentTeamId), [currentTeamId, effectiveDataViewMode, entries]);
  const filteredEntries = useMemo(() => { const normalized = searchTerm.trim().toLocaleLowerCase("vi-VN"); return normalized ? scopedEntries.filter((entry) => [entry.condition, entry.layman, entry.decision, entry.docs].some((value) => value.toLocaleLowerCase("vi-VN").includes(normalized))) : scopedEntries; }, [scopedEntries, searchTerm]);
  const selectedEntry = scopedEntries.find((entry) => entry.id === selectedId) ?? filteredEntries[0] ?? null;

  useEffect(() => {
    setSelectedId((current) => scopedEntries.some((entry) => entry.id === current) ? current : (scopedEntries[0]?.id ?? null));
  }, [scopedEntries]);

  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-xl"><div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300"><Stethoscope size={15} />Từ điển Y khoa &amp; UW · Supabase</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Tra cứu đúng. <span className="text-emerald-400">Giải trình rõ.</span></h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Thư viện nội bộ hỗ trợ tra cứu bệnh lý, chứng từ và soạn khung giải trình. Không thay thế kết luận y khoa, quyết định UW hoặc quy tắc sản phẩm.</p></div><ShieldCheck size={74} className="hidden text-emerald-400/80 lg:block" /></div></section>
    <section className="rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-4 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-indigo-900"><ListChecks size={17} />SOP Thẩm định &amp; Bồi thường Chuẩn mực</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border-l-4 border-indigo-300 bg-white p-3"><span className="text-[10px] font-black text-indigo-500">BƯỚC 1</span><p className="mt-1 text-xs font-bold leading-5 text-slate-800">Đánh giá và đối chiếu chẩn đoán với quyền lợi, điều khoản hợp đồng.</p></div><div className="rounded-xl border-l-4 border-indigo-400 bg-white p-3"><span className="text-[10px] font-black text-indigo-600">BƯỚC 2</span><p className="mt-1 text-xs font-bold leading-5 text-slate-800">Thu thập, kiểm tra và nộp chứng từ đầy đủ theo yêu cầu hồ sơ.</p></div><div className="rounded-xl border-l-4 border-emerald-400 bg-white p-3"><span className="text-[10px] font-black text-emerald-600">BƯỚC 3</span><p className="mt-1 text-xs font-bold leading-5 text-slate-800">Lập tường trình theo timeline, dữ kiện khách quan và chứng từ.</p></div><div className="rounded-xl border-l-4 border-indigo-600 bg-white p-3"><span className="text-[10px] font-black text-indigo-700">BƯỚC 4</span><p className="mt-1 text-xs font-bold leading-5 text-slate-800">Theo dõi phản hồi, phối hợp bộ phận chuyên môn theo quy trình.</p></div></div></section>
    <aside className="flex items-start gap-3 rounded-r-xl border-l-4 border-amber-500 bg-amber-50 p-4 shadow-sm"><AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} /><div><h3 className="text-sm font-black uppercase tracking-wide text-amber-800">Tuyên bố miễn trừ trách nhiệm &amp; Quản trị kỳ vọng</h3><p className="mt-1 text-xs font-medium leading-relaxed text-amber-800">Các mẫu thư và hướng dẫn là khung hỗ trợ nghiệp vụ chung. Mỗi công ty BHNT có sổ tay thẩm định, quy tắc sản phẩm và quy trình Claim riêng; TVV cần đối chiếu tài liệu nội bộ của công ty mình. Công cụ không thay thế kết luận y khoa, quyết định UW/Claim hoặc tư vấn pháp lý chính thức.</p></div></aside>
    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><strong>Nguyên tắc Zero-PII:</strong> không nhập tên đầy đủ, số điện thoại, email, số hợp đồng hoặc ảnh bệnh án nhận diện được. Nội dung chỉ là bản nháp nghiệp vụ để chuyên môn/UW rà soát.</p>
    {canViewEndUserContent && <div className="flex bg-slate-800 p-1 rounded-xl mb-4" aria-label="Phạm vi kiến thức"><button type="button" onClick={() => setDataViewMode("GLOBAL")} aria-pressed={dataViewMode === "GLOBAL"} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${dataViewMode === "GLOBAL" ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}>Kiến thức Hệ thống (Global)</button><button type="button" onClick={() => setDataViewMode("LOCAL")} aria-pressed={dataViewMode === "LOCAL"} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${dataViewMode === "LOCAL" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}>Nội bộ Team của bạn (Local)</button></div>}
    <div className="dictionary-master-detail flex flex-col gap-6 lg:flex-row">
      <section className="flex min-h-[420px] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm lg:min-h-[580px] lg:w-[42%]"><div className="border-b border-slate-200 bg-slate-50 p-5"><div className="mb-4 flex items-center justify-between"><div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medical Dictionary</span><h3 className="mt-1 text-xl font-black text-slate-900">Từ điển Thẩm định</h3></div><button type="button" onClick={() => void loadDictionary()} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Tải lại</button></div><label className="relative block"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm bệnh lý, mã ICD, chứng từ…" className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500" /></label></div><div className="min-h-0 flex-1 overflow-y-auto p-4"><div className="space-y-3">{loading && <div className="flex items-center justify-center gap-2 py-12 text-sm font-medium text-slate-500"><Loader2 size={18} className="animate-spin" />Đang tải dữ liệu y khoa…</div>}{error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}{!loading && !error && !filteredEntries.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm text-slate-500">Không tìm thấy mục phù hợp.</div>}{filteredEntries.map((entry) => <button key={entry.id} type="button" onClick={() => { setSelectedId(entry.id); if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) setMobileDetailOpen(true); }} className={`w-full rounded-2xl border-2 p-4 text-left transition ${selectedEntry?.id === entry.id ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"}`}><h4 className="font-black leading-5 text-slate-900">{entry.condition}</h4><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{entry.layman || "Chưa có diễn giải dễ hiểu."}</p></button>)}</div></div></section>
      <section className="w-full space-y-6 lg:w-[58%]">{selectedEntry ? <><article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><BookOpenCheck size={22} /></div><div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chi tiết tham chiếu</span><h3 className="mt-1 text-xl font-black leading-tight text-slate-900">{selectedEntry.condition}</h3></div></div><p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedEntry.layman || "Chưa có diễn giải dễ hiểu."}</p><div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Định hướng UW (tham chiếu)</span><p className="mt-2 text-sm font-bold leading-6 text-indigo-950">{selectedEntry.decision || "Cần UW đánh giá theo quy tắc hiện hành."}</p></div><div className="rounded-2xl border border-rose-100 bg-rose-50 p-4"><span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Mẹo tuyến đầu</span><p className="mt-2 text-sm font-medium leading-6 text-rose-950">{selectedEntry.tips || "Chưa có ghi chú."}</p></div></div><div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-emerald-700">Chứng từ cần có</span><p className="flex items-start gap-2 text-sm font-medium leading-6 text-emerald-950"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />{selectedEntry.docs || "Cần đối chiếu danh mục chứng từ."}</p></div></article><GeneratorCard key={`${selectedEntry.id}-${effectiveDataViewMode}`} entry={selectedEntry} dataViewMode={effectiveDataViewMode} teamId={currentTeamId} /></> : <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">Chọn một mục từ điển để xem chi tiết.</div>}</section>
    </div>
    {mobileDetailOpen && selectedEntry && <div className="fixed inset-0 z-50 flex items-end bg-slate-950/65 p-3 backdrop-blur-sm lg:hidden" role="presentation" onMouseDown={() => setMobileDetailOpen(false)}><section className="max-h-[88vh] w-full overflow-y-auto rounded-[28px] bg-slate-50 shadow-2xl" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selectedEntry.condition}`} onMouseDown={(event) => event.stopPropagation()}><header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4"><div><span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Chi tiết tham chiếu</span><h3 className="mt-1 text-base font-black text-slate-900">{selectedEntry.condition}</h3></div><button type="button" onClick={() => setMobileDetailOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100" aria-label="Đóng chi tiết Từ điển"><X size={19} /></button></header><div className="space-y-5 p-4"><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedEntry.layman || "Chưa có diễn giải dễ hiểu."}</p><div className="mt-4 grid grid-cols-1 gap-4"><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Định hướng UW (tham chiếu)</span><p className="mt-2 text-sm font-bold leading-6 text-indigo-950">{selectedEntry.decision || "Cần UW đánh giá theo quy tắc hiện hành."}</p></div><div className="rounded-2xl border border-rose-100 bg-rose-50 p-4"><span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Mẹo tuyến đầu</span><p className="mt-2 text-sm font-medium leading-6 text-rose-950">{selectedEntry.tips || "Chưa có ghi chú."}</p></div></div><div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-emerald-700">Chứng từ cần có</span><p className="flex items-start gap-2 text-sm font-medium leading-6 text-emerald-950"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />{selectedEntry.docs || "Cần đối chiếu danh mục chứng từ."}</p></div></article><GeneratorCard key={`mobile-${selectedEntry.id}-${effectiveDataViewMode}`} entry={selectedEntry} dataViewMode={effectiveDataViewMode} teamId={currentTeamId} /></div></section></div>}
  </div>;
}

/** Contextual Admin keeps only one active subview mounted to avoid background fetches. */
export function TroLyThamDinh({ session }: TroLyThamDinhProps) {
  const isSuperAdmin = session?.profile.role === "super_admin";
  const [viewMode, setViewMode] = useState<"studio" | "cms">("studio");
  return <div className="screen-enter module-page space-y-6">{isSuperAdmin && <div className="flex justify-center"><div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1 shadow-inner"><button type="button" onClick={() => setViewMode("studio")} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition sm:px-6 ${viewMode === "studio" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Tra cứu &amp; Soạn thư</button><button type="button" onClick={() => setViewMode("cms")} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition sm:px-6 ${viewMode === "cms" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Quản lý Từ điển &amp; Templates</button></div></div>}{viewMode === "studio" && <UnderwritingStudio session={session} />}{isSuperAdmin && viewMode === "cms" && <><TroLyThamDinhCMS /><UwTemplatesCMS /></>}</div>;
}
