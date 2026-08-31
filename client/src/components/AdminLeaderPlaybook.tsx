import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ChevronLeft, Loader2, Pencil, Plus, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  fetchAdminLeaderPlaybook,
  saveAdminLeaderPlaybook,
  type AdminLeaderPlaybookInput,
  type AdminLeaderPlaybookItem,
  type LeadershipLearningSituation,
} from "../lib/supabaseContent";

type EditorState = {
  id?: string;
  type: "principle" | "coaching_script";
  prefix: string;
  title: string;
  description: string;
  situations: LeadershipLearningSituation[];
  summary: { title: string; content: string; homework: string };
  tags: string;
  actionText: string;
  roleplayPrompt: string;
};

const blankSituation = (): LeadershipLearningSituation => ({ question: "", options: ["", ""], correct_index: 0, correct_explanation: "", wrong_explanation: "" });
const blankEditor = (type: EditorState["type"] = "principle"): EditorState => ({
  type,
  prefix: type === "principle" ? "01" : "CHẠM 01",
  title: "",
  description: "",
  situations: type === "principle" ? [blankSituation()] : [],
  summary: { title: "TỔNG KẾT & NEO KIẾN THỨC", content: "", homework: "" },
  tags: "",
  actionText: "",
  roleplayPrompt: "",
});

const mapItemToEditor = (item: AdminLeaderPlaybookItem): EditorState => ({
  id: item.id,
  type: item.type,
  prefix: item.prefix,
  title: item.title,
  description: item.content,
  situations: item.learning_carousel?.situations ?? [blankSituation()],
  summary: item.learning_carousel?.summary ?? { title: "TỔNG KẾT & NEO KIẾN THỨC", content: "", homework: "" },
  tags: item.tags.join(", "),
  actionText: item.note ?? "",
  roleplayPrompt: item.roleplay_prompt ?? "",
});

export function AdminLeaderPlaybook({ onChanged }: { onChanged: () => Promise<void> | void }) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<AdminLeaderPlaybookItem[]>([]);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRecords(await fetchAdminLeaderPlaybook());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải Leader Playbook.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  const editorTitle = useMemo(() => editor?.id ? "Chỉnh sửa nội dung La Bàn" : "Thêm nội dung La Bàn", [editor?.id]);
  const updateSituation = (index: number, patch: Partial<LeadershipLearningSituation>) => setEditor((current) => current ? {
    ...current,
    situations: current.situations.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
  } : current);
  const changeEditorType = (type: EditorState["type"]) => setEditor((current) => current ? {
    ...current,
    type,
    prefix: type === "principle" ? (current.prefix.match(/^\d{2}$/) ? current.prefix : "01") : (current.prefix.match(/^CHẠM \d{2}$/) ? current.prefix : "CHẠM 01"),
    situations: type === "principle" && !current.situations.length ? [blankSituation()] : current.situations,
  } : current);

  const save = async () => {
    if (!editor) return;
    setSaving(true);
    setError("");
    try {
      const payload: AdminLeaderPlaybookInput = editor.type === "principle"
        ? { id: editor.id, type: editor.type, prefix: editor.prefix, title: editor.title, description: editor.description, situations: editor.situations, summary: editor.summary }
        : { id: editor.id, type: editor.type, prefix: editor.prefix, title: editor.title, description: editor.description, tags: editor.tags.split(",").map((tag) => tag.trim()).filter(Boolean), action_text: editor.actionText, roleplay_prompt: editor.roleplayPrompt };
      await saveAdminLeaderPlaybook(payload);
      setNotice("Đã lưu Leader Playbook.");
      setEditor(null);
      await Promise.all([load(), onChanged()]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu nội dung.");
    } finally {
      setSaving(false);
    }
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-800 active:scale-[0.97]" data-admin-control="leader-playbook-manager">
      <BookOpenCheck size={17} />Quản lý La Bàn
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[92vh] w-[95vw] !max-w-7xl min-h-[85vh] overflow-hidden rounded-3xl border-slate-200 bg-slate-50 p-0">
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
            <div>
              <DialogTitle className="text-xl font-black text-slate-950">Leader Playbook Manager</DialogTitle>
              <DialogDescription className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Quản lý nguyên tắc Learning Carousel và kịch bản coaching trực tiếp từ giao diện; nội dung luôn được kiểm tra Zero-PII trước khi lưu.</DialogDescription>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Đóng quản lý La Bàn"><X size={20} /></button>
          </header>
          {notice && <p role="status" className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 sm:mx-6">{notice}</p>}
          {error && <p role="alert" className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:mx-6">{error}</p>}

          <div className="grid w-full h-full min-h-0 flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:gap-6">
            <section className="order-2 min-h-0 overflow-y-auto lg:order-1 lg:col-span-4 lg:max-h-[80vh] lg:border-r lg:border-slate-200 lg:pr-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-950">Nội dung hiện có</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{records.length} bản ghi trong Leader Playbook</p>
                </div>
                <button type="button" onClick={() => void load()} className="rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 hover:text-indigo-900">Làm mới</button>
              </div>
              {loading ? <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><Loader2 size={16} className="animate-spin" />Đang tải nội dung...</div> : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-[520px] w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-black uppercase tracking-wide text-slate-600"><tr><th className="px-3 py-3">Mã</th><th className="px-3 py-3">Nội dung</th><th className="px-3 py-3">Loại</th><th className="px-3 py-3"><span className="sr-only">Sửa</span></th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{records.map((record) => <tr key={record.id} onClick={() => { setEditor(mapItemToEditor(record)); setNotice(""); setError(""); }} className="align-top cursor-pointer transition hover:bg-indigo-50/40"><td className="whitespace-nowrap px-3 py-3 font-black text-indigo-700">{record.prefix}</td><td className="min-w-72 px-3 py-3"><p className="font-bold leading-5 text-slate-900">{record.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{record.content}</p></td><td className="whitespace-nowrap px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${record.type === "principle" ? "bg-amber-50 text-amber-800" : "bg-indigo-50 text-indigo-700"}`}>{record.type === "principle" ? "Nguyên tắc" : "Coaching"}</span></td><td className="px-3 py-3"><button type="button" onClick={() => { setEditor(mapItemToEditor(record)); setNotice(""); setError(""); }} className="inline-flex rounded-lg p-2 text-indigo-700 transition hover:bg-indigo-50" aria-label={`Chỉnh sửa ${record.title}`}><Pencil size={16} /></button></td></tr>)}</tbody>
                </table>
                {!records.length && <p className="p-5 text-sm text-slate-500">Chưa có nội dung La Bàn.</p>}
              </div>}
            </section>

            {editor ? <section className="order-1 flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:order-2 lg:col-span-8 lg:max-h-[80vh] lg:pl-2">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div><h2 className="text-base font-black text-slate-950">{editorTitle}</h2><p className="mt-0.5 text-xs text-slate-500">Các trường thay đổi theo loại nội dung.</p></div>
                <button type="button" onClick={() => { setEditor(null); setError(""); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"><ChevronLeft size={16} />Danh sách</button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="space-y-4">
                  <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Loại nội dung</span><select value={editor.type} onChange={(event) => changeEditorType(event.target.value === "coaching_script" ? "coaching_script" : "principle")} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="principle">Nguyên tắc</option><option value="coaching_script">Kịch bản Coaching</option></select></label>
                  <div className="grid gap-4 sm:grid-cols-[0.34fr_0.66fr]"><Field label="Prefix" value={editor.prefix} onChange={(value) => setEditor({ ...editor, prefix: value })} placeholder={editor.type === "principle" ? "01" : "CHẠM 01"} /><Field label="Tiêu đề" value={editor.title} onChange={(value) => setEditor({ ...editor, title: value })} /></div>
                  <Area label="Mô tả" value={editor.description} onChange={(value) => setEditor({ ...editor, description: value })} rows={4} />

                  {editor.type === "principle" ? <>
                    <div className="pt-2"><h3 className="text-base font-black text-slate-950">Tình huống Learning Carousel</h3><p className="mt-1 text-xs text-slate-500">Mỗi tình huống có đúng hai lựa chọn và một đáp án đúng.</p></div>
                    <div className="space-y-4">
                      {editor.situations.map((situation, index) => <section key={`situation-${index}`} className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-3"><h4 className="text-sm font-black text-slate-900">Tình huống {index + 1}</h4>{editor.situations.length > 1 && <button type="button" onClick={() => setEditor({ ...editor, situations: editor.situations.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg px-2 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700">Xóa</button>}</div>
                        <Area label="Câu hỏi" value={situation.question} onChange={(value) => updateSituation(index, { question: value })} rows={3} />
                        <div className="grid gap-3 sm:grid-cols-2"><Field label="Lựa chọn A" value={situation.options[0] ?? ""} onChange={(value) => updateSituation(index, { options: [value, situation.options[1] ?? ""] })} /><Field label="Lựa chọn B" value={situation.options[1] ?? ""} onChange={(value) => updateSituation(index, { options: [situation.options[0] ?? "", value] })} /></div>
                        <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Đáp án đúng</span><select value={situation.correct_index} onChange={(event) => updateSituation(index, { correct_index: Number(event.target.value) === 1 ? 1 : 0 })} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"><option value={0}>Lựa chọn A</option><option value={1}>Lựa chọn B</option></select></label>
                        <Area label="Giải thích khi đúng" value={situation.correct_explanation} onChange={(value) => updateSituation(index, { correct_explanation: value })} rows={3} />
                        <Area label="Giải thích khi sai" value={situation.wrong_explanation} onChange={(value) => updateSituation(index, { wrong_explanation: value })} rows={3} />
                      </section>)}
                    </div>
                    <button type="button" onClick={() => setEditor({ ...editor, situations: [...editor.situations, blankSituation()] })} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100 active:scale-[0.97]"><Plus size={16} />Thêm tình huống</button>
                    <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div><h3 className="text-base font-black text-slate-950">Tổng kết</h3><p className="mt-1 text-xs text-amber-800">Hiển thị khi Leader hoàn tất toàn bộ tình huống.</p></div><Field label="Tiêu đề tổng kết" value={editor.summary.title} onChange={(value) => setEditor({ ...editor, summary: { ...editor.summary, title: value } })} /><Area label="Nội dung tổng kết" value={editor.summary.content} onChange={(value) => setEditor({ ...editor, summary: { ...editor.summary, content: value } })} rows={3} /><Area label="Bài tập" value={editor.summary.homework} onChange={(value) => setEditor({ ...editor, summary: { ...editor.summary, homework: value } })} rows={3} /></section>
                  </> : <section className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"><h3 className="text-base font-black text-slate-950">Thiết lập Coaching</h3><Field label="Tags (ngăn cách bằng dấu phẩy)" value={editor.tags} onChange={(value) => setEditor({ ...editor, tags: value })} placeholder="Mất động lực, Áp lực chỉ tiêu" /><Area label="Action text" value={editor.actionText} onChange={(value) => setEditor({ ...editor, actionText: value })} rows={3} /><Area label="Roleplay prompt" value={editor.roleplayPrompt} onChange={(value) => setEditor({ ...editor, roleplayPrompt: value })} rows={6} /></section>}
                </div>
              </div>
              <footer className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-white px-5 py-4"><button type="button" disabled={saving} onClick={() => void save()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-800 disabled:opacity-60"><Save size={16} />{saving ? "Đang lưu..." : "Lưu nội dung"}</button></footer>
            </section> : <section className="order-1 flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm lg:order-2 lg:col-span-8 lg:max-h-[80vh] lg:pl-2"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-base font-black text-slate-950">Chọn nội dung cần chỉnh sửa</h2><p className="mt-0.5 text-xs text-slate-500">Hoặc tạo một nguyên tắc/kịch bản mới.</p></div><button type="button" onClick={() => { setEditor(blankEditor()); setNotice(""); setError(""); }} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-3 py-2 text-sm font-black text-white transition hover:bg-indigo-800"><Plus size={16} />Thêm mới</button></div><div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">Chọn “Chỉnh sửa” từ danh sách hoặc thêm nội dung mới để mở form động.</div></section>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}

function Field({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block w-full"><span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>;
}

function Area({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return <label className="block w-full"><span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>;
}
