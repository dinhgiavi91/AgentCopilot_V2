import { useCallback, useEffect, useMemo, useState } from "react";
import { BookHeart, ClipboardList, FilePlus2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteUwDictionary, fetchUwDictionary, saveUwDictionary, type UwDictionaryEntry, type UwDictionaryInput } from "../lib/supabaseContent";
import { useWorkspaceAssignmentTeams, WorkspaceAssignmentField } from "./WorkspaceAssignmentField";

const emptyForm: UwDictionaryInput = { team_id: null, condition: "", layman: "", decision: "", docs: "", tips: "", icd_code: "", category: "Chung", company_tag: "Áp dụng chung", reference_link: "", is_active: true };

type TroLyThamDinhCMSProps = { onDictionaryChanged?: () => Promise<void> | void };

/** Super Admin surface. Database RLS and helpers independently enforce this boundary. */
export function TroLyThamDinhCMS({ onDictionaryChanged }: TroLyThamDinhCMSProps) {
  const [entries, setEntries] = useState<UwDictionaryEntry[]>([]);
  const [form, setForm] = useState<UwDictionaryInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const workspaceTeams = useWorkspaceAssignmentTeams();

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await fetchUwDictionary(true));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải Từ điển Thẩm định.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEntries(); }, [loadEntries]);

  const editingEntry = useMemo(() => entries.find((entry) => entry.id === editingId) ?? null, [editingId, entries]);
  const updateField = (key: keyof UwDictionaryInput, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const startCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); };
  const startEdit = (entry: UwDictionaryEntry) => {
    setEditingId(entry.id);
    setForm({ id: entry.id, team_id: entry.team_id, condition: entry.condition, layman: entry.layman, decision: entry.decision, docs: entry.docs, tips: entry.tips, icd_code: entry.icd_code ?? "", category: entry.category, company_tag: entry.company_tag, reference_link: entry.reference_link ?? "", is_active: entry.is_active });
    setError("");
  };

  const persist = async () => {
    if (!form.condition.trim() || !form.decision.trim()) {
      toast.error("Hãy điền Bệnh lý/Tình huống và Định hướng UW.");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveUwDictionary(form);
      setEntries((current) => {
        const exists = current.some((entry) => entry.id === saved.id);
        const next = exists ? current.map((entry) => entry.id === saved.id ? saved : entry) : [saved, ...current];
        return [...next].sort((left, right) => left.condition.localeCompare(right.condition, "vi-VN"));
      });
      setEditingId(saved.id);
      setForm({ id: saved.id, team_id: saved.team_id, condition: saved.condition, layman: saved.layman, decision: saved.decision, docs: saved.docs, tips: saved.tips, icd_code: saved.icd_code ?? "", category: saved.category, company_tag: saved.company_tag, reference_link: saved.reference_link ?? "", is_active: saved.is_active });
      await onDictionaryChanged?.();
      toast.success(editingEntry ? "Đã cập nhật mục thẩm định." : "Đã thêm mục thẩm định mới.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể lưu mục thẩm định.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editingId || !editingEntry || !window.confirm(`Xóa “${editingEntry.condition}” khỏi Từ điển Thẩm định?`)) return;
    setSaving(true);
    try {
      await deleteUwDictionary(editingId);
      setEntries((current) => current.filter((entry) => entry.id !== editingId));
      startCreate();
      await onDictionaryChanged?.();
      toast.success("Đã xóa mục thẩm định.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể xóa mục thẩm định.");
    } finally {
      setSaving(false);
    }
  };

  return <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
    <header className="bg-slate-950 px-5 py-6 text-white sm:px-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300"><BookHeart size={14} />Contextual Admin · Supabase uw_dictionary</span><h2 className="mt-2 text-2xl font-black tracking-tight">Quản lý Từ điển Thẩm định</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Tạo, cập nhật hoặc xóa kiến thức nội bộ về bệnh lý, chứng từ và định hướng hồ sơ. Nội dung cần được đối chiếu theo quy tắc UW hiện hành trước khi dùng.</p></div>
        <button type="button" onClick={startCreate} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-400"><Plus size={17} />Mục mới</button>
      </div>
    </header>
    <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
        <div className="mb-3 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-slate-500">{loading ? "Đang tải…" : `${entries.length} mục kiến thức`}</span><button type="button" onClick={() => void loadEntries()} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Tải lại</button></div>
        {error && <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
        <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
          {entries.map((entry) => <button key={entry.id} type="button" onClick={() => startEdit(entry)} className={`w-full rounded-2xl border p-4 text-left transition ${editingId === entry.id ? "border-emerald-400 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"}`}><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">THẨM ĐỊNH UW</span><strong className="line-clamp-2 block text-sm leading-5 text-slate-800">{entry.condition}</strong><span className="mt-2 line-clamp-2 block text-xs leading-5 text-slate-500">{entry.decision || "Chưa có định hướng UW"}</span></button>)}
          {!loading && !entries.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Chưa có mục nào. Hãy tạo mục kiến thức đầu tiên.</div>}
        </div>
      </aside>
      <form onSubmit={(event) => { event.preventDefault(); void persist(); }} className="p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600"><ClipboardList size={14} />{editingId ? "Cập nhật mục" : "Tạo mục"}</span><h3 className="mt-1 text-xl font-black text-slate-900">{editingEntry ? editingEntry.condition : "Mục thẩm định mới"}</h3></div>{editingId && <button type="button" onClick={startCreate} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Đóng chỉnh sửa"><X size={18} /></button>}</div>
        <div className="grid gap-4">
          <WorkspaceAssignmentField teamId={form.team_id} onTeamIdChange={(teamId) => setForm((current) => ({ ...current, team_id: teamId }))} teams={workspaceTeams.teams} loading={workspaceTeams.loading} error={workspaceTeams.error} />
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Bệnh lý / Tình huống *</span><input value={form.condition} onChange={(event) => updateField("condition", event.target.value)} placeholder="Ví dụ: Nang thận (N28.1)" className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Mã ICD</span><input value={form.icd_code ?? ""} onChange={(event) => updateField("icd_code", event.target.value)} placeholder="Ví dụ: N28.1" className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500" /></label><label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Phân loại</span><input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="Ví dụ: Tiền sử bệnh" className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500" /></label><label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Hãng áp dụng</span><input value={form.company_tag} onChange={(event) => updateField("company_tag", event.target.value)} placeholder="Áp dụng chung" className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500" /></label><label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Liên kết tham chiếu</span><input value={form.reference_link ?? ""} onChange={(event) => updateField("reference_link", event.target.value)} placeholder="URL quy tắc/sổ tay nội bộ" className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500" /></label></div>
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Giải thích gần gũi</span><textarea value={form.layman} onChange={(event) => updateField("layman", event.target.value)} placeholder="Giải thích bản chất tình trạng bằng ngôn ngữ dễ hiểu…" className="min-h-20 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-500" /></label>
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Định hướng UW *</span><textarea value={form.decision} onChange={(event) => updateField("decision", event.target.value)} placeholder="Quy tắc hoặc định hướng cần đối chiếu…" className="min-h-20 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition focus:border-indigo-500" /></label>
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Chứng từ cần có</span><textarea value={form.docs} onChange={(event) => updateField("docs", event.target.value)} placeholder="Hồ sơ y tế, kết quả xét nghiệm, văn bản xác nhận…" className="min-h-20 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-500" /></label>
          <label className="grid gap-1.5"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Mẹo tuyến đầu</span><textarea value={form.tips} onChange={(event) => updateField("tips", event.target.value)} placeholder="Nhắc nhở kiểm tra trước khi nộp hồ sơ…" className="min-h-20 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-500" /></label>
          <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />Hiển thị mục này trong Từ điển Thẩm định</label>
        </div>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Không nhập tên, số điện thoại, email, số hợp đồng hoặc bệnh án nhận diện được của khách hàng vào CMS.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"><div>{editingId && <button type="button" disabled={saving} onClick={() => void remove()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"><Trash2 size={17} />Xóa mục</button>}</div><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={startCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><FilePlus2 size={17} />Bản nháp mới</button><button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"><Save size={17} />{saving ? "Đang lưu…" : editingId ? "Lưu cập nhật" : "Lưu mục mới"}</button></div></div>
      </form>
    </div>
  </section>;
}
