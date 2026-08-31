import React, { useEffect, useState } from "react";
import { Loader2, Plus, Save, Edit, Trash2 } from "lucide-react";
import { hasSupabaseContentConfig } from "../lib/supabaseContent";
import { createClient } from "@supabase/supabase-js";
import { useWorkspaceAssignmentTeams, WorkspaceAssignmentField } from "./WorkspaceAssignmentField";

const CONTENT_SCHEMAS = {
  playbooks: {
    tabName: "Bảo Bối Thực Chiến",
    tableName: "playbook_cards",
    fields: [
      { key: "code", label: "Mã (VD: PB01)", type: "text", required: true },
      { key: "skill_system", label: "Hệ Kỹ Năng", type: "text", required: true },
      { key: "required_level", label: "Cấp độ", type: "text" },
      { key: "situation", label: "Tình huống Khách hàng", type: "textarea", required: true },
      { key: "customer_insight", label: "Sự thật / Customer Insight", type: "textarea" },
      { key: "mindset", label: "Góc nhìn định tâm", type: "textarea", required: true },
      { key: "core_logic", label: "Logic Cốt lõi & Dẫn chứng (The Why)", type: "textarea" },
      { key: "coaching_prompts", label: "Kịch bản khai vấn", type: "textarea" },
      { key: "sort_order", label: "Thứ tự hiển thị", type: "number", required: true },
    ],
    renderPreview: (data: any) => (
      <article className="mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-indigo-700 p-4 text-white">
          <div className="mb-1 text-xs font-bold opacity-80">{data.skill_system || "Hệ kỹ năng..."} · {data.required_level || "Rookie"}</div>
          <h3 className="text-lg font-bold leading-tight">{data.situation || "Tình huống khách hàng..."}</h3>
        </div>
        <div className="flex-1 bg-slate-50 p-4">
          <p className="mb-3 whitespace-pre-wrap rounded-lg border border-cyan-100 bg-cyan-50/70 p-3 text-sm font-medium text-cyan-950">{data.customer_insight || "Sự thật / Customer Insight..."}</p>
          <p className="mb-3 whitespace-pre-wrap text-sm text-slate-700">{data.mindset || "Góc nhìn định tâm..."}</p>
          <p className="mb-3 whitespace-pre-wrap rounded-lg border border-rose-100 bg-rose-50/70 p-3 text-sm font-medium text-rose-900">{data.core_logic || "Logic cốt lõi & dẫn chứng..."}</p>
          <p className="whitespace-pre-wrap text-sm font-semibold text-indigo-800">{data.coaching_prompts || "Kịch bản khai vấn..."}</p>
        </div>
        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button className="pointer-events-none flex-1 rounded-lg bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700">Mở Bảo Bối</button>
          <button className="pointer-events-none flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700">Luyện Roleplay</button>
        </div>
      </article>
    ),
  },
  marketing: {
    tabName: "Marketing 1-Chạm",
    tableName: "marketing_templates",
    fields: [
      { key: "code", label: "Mã Mẫu", type: "text", required: true },
      { key: "category", label: "Phân loại (VD: Chăm sóc KH)", type: "text" },
      { key: "occasion", label: "Chủ đề / Dịp", type: "text", required: true },
      { key: "image_url", label: "Link Hình Ảnh (URL)", type: "text" },
      { key: "message_template", label: "Thông điệp", type: "textarea" },
      { key: "sort_order", label: "Thứ tự hiển thị", type: "number", required: true },
    ],
    renderPreview: (data: any = {}) => (
      <article className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[22px] bg-slate-200 shadow-xl">
        {data?.image_url && <img src={String(data?.image_url || "")} alt="Mẫu Marketing" className="absolute inset-0 h-full w-full bg-slate-200 object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
        {!data?.image_url && <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-xs font-bold text-amber-700">Nhập Link URL để hiển thị hình ảnh</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 right-4 top-[24%] rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur-sm">
          <div className="mb-2 text-[9px] font-black uppercase tracking-[0.15em] text-amber-700">{data?.category || "PHÂN LOẠI"}</div>
          <h3 className="mb-2 text-lg font-black text-slate-900">{data?.occasion || "Chủ đề..."}</h3>
          <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{data?.message_template || "Nội dung thông điệp mẫu..."}</p>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl border border-white/50 bg-white/75 p-3 backdrop-blur-sm"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">A</span><div><strong className="block text-xs text-slate-900">Đội ngũ Agent Copilot</strong><span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Chữ ký mô phỏng Zero-PII</span></div></div>
      </article>
    ),
  },
  leadership: {
    tabName: "La Bàn Lãnh Đạo",
    tableName: "leadership_compass",
    fields: [
      { key: "code", label: "Mã (VD: LB01)", type: "text", required: true },
      { key: "topic", label: "Chủ đề / Chạm", type: "text", required: true },
      { key: "core_thinking", label: "Tư duy cốt lõi", type: "textarea", required: true },
      { key: "sort_order", label: "Thứ tự hiển thị", type: "number", required: true },
    ],
    renderPreview: (data: any) => (
      <article className="mx-auto w-full max-w-sm rounded-xl border-l-4 border-l-blue-600 bg-white p-5 shadow-sm">
        <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-400">CHẠM {data.code || "01"}</span>
        <h2 className="mb-2 text-lg font-bold text-slate-900">{data.topic || "Chủ đề coaching"}</h2>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{data.core_thinking || "Tư duy cốt lõi..."}</p>
      </article>
    ),
  },
};

const DEFAULT_MARKETING_CATEGORY = "Dành cho khách hàng";
const DEFAULT_PLAYBOOK_CATEGORY = "Kỹ năng tư vấn";

function getDynamicCategory(category: unknown, fallback: string) {
  return String(category ?? "").trim() || fallback;
}

type ContentKey = keyof typeof CONTENT_SCHEMAS;
type FormData = Record<string, string | number | null>;
type ContentRecord = FormData & { code: string };
type PilotAdminCMSProps = {
  allowedSchemas?: readonly ContentKey[];
  defaultSchema?: ContentKey;
  title?: string;
  description?: string;
  initialRecords?: ContentRecord[];
  onContentChanged?: () => Promise<void> | void;
};

function createBlankForm(schemaKey: ContentKey, sortOrder = 1): FormData {
  const form = CONTENT_SCHEMAS[schemaKey].fields.reduce<FormData>((draft, field) => ({
    ...draft,
    [field.key]: field.type === "number"
      ? sortOrder
      : schemaKey === "marketing" && field.key === "category"
        ? DEFAULT_MARKETING_CATEGORY
        : schemaKey === "playbooks" && field.key === "skill_system"
          ? DEFAULT_PLAYBOOK_CATEGORY
        : "",
  }), {});
  if (schemaKey === "playbooks") form.team_id = null;
  return form;
}

export function PilotAdminCMS({
  allowedSchemas,
  defaultSchema,
  title = "Pilot Admin CMS",
  description = "Quản trị nội dung theo schema, chỉnh sửa không cần code và xem trước ngay bằng UI sản phẩm.",
  initialRecords,
  onContentChanged,
}: PilotAdminCMSProps) {
  const schemaKeys = React.useMemo<ContentKey[]>(() => {
    const allSchemas = Object.keys(CONTENT_SCHEMAS) as ContentKey[];
    const permitted = allowedSchemas?.filter((key) => allSchemas.includes(key));
    return permitted?.length ? [...permitted] : allSchemas;
  }, [allowedSchemas]);
  const initialSchema = schemaKeys.includes(defaultSchema as ContentKey)
    ? (defaultSchema as ContentKey)
    : schemaKeys[0] ?? "playbooks";
  const [selectedSchema, setSelectedSchema] = useState<ContentKey>(initialSchema);
  const [records, setRecords] = useState<ContentRecord[]>(() => initialRecords ?? []);
  const [formData, setFormData] = useState<FormData>(() => createBlankForm(initialSchema));
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => initialRecords === undefined);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isCustomMarketingCategory, setIsCustomMarketingCategory] = useState(false);
  const [isCustomPlaybookCategory, setIsCustomPlaybookCategory] = useState(false);
  const usedInitialRecords = React.useRef(false);
  const workspaceTeams = useWorkspaceAssignmentTeams();

  const supabase = React.useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    return hasSupabaseContentConfig && url && anonKey ? createClient(url, anonKey) : null;
  }, []);
  const schema = CONTENT_SCHEMAS[selectedSchema];
  const marketingCategoryOptions = React.useMemo(() => {
    const categories = new Map<string, string>();
    records.forEach((record) => {
      const category = getDynamicCategory(record.category, DEFAULT_MARKETING_CATEGORY);
      const categoryKey = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi-VN");
      if (!categories.has(categoryKey)) categories.set(categoryKey, category);
    });
    const defaultKey = DEFAULT_MARKETING_CATEGORY.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi-VN");
    if (!categories.has(defaultKey)) categories.set(defaultKey, DEFAULT_MARKETING_CATEGORY);
    return Array.from(categories.values());
  }, [records]);
  const playbookCategoryOptions = React.useMemo(() => {
    const categories = new Map<string, string>();
    records.forEach((record) => {
      const category = getDynamicCategory(record.skill_system, DEFAULT_PLAYBOOK_CATEGORY);
      const categoryKey = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi-VN");
      if (!categories.has(categoryKey)) categories.set(categoryKey, category);
    });
    const defaultKey = DEFAULT_PLAYBOOK_CATEGORY.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi-VN");
    if (!categories.has(defaultKey)) categories.set(defaultKey, DEFAULT_PLAYBOOK_CATEGORY);
    return Array.from(categories.values());
  }, [records]);

  useEffect(() => {
    if (!schemaKeys.includes(selectedSchema)) setSelectedSchema(initialSchema);
  }, [initialSchema, schemaKeys, selectedSchema]);

  const loadRecords = async () => {
    if (!supabase) {
      setLoading(false);
      setError("Supabase Content chưa được cấu hình cho CMS.");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase.from(schema.tableName).select("*").order("sort_order");
    if (queryError) setError(queryError.message);
    setRecords((data ?? []) as ContentRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    setEditingCode(null);
    setFormData(createBlankForm(selectedSchema));
    setIsCustomMarketingCategory(false);
    setIsCustomPlaybookCategory(false);
    setNotice("");
    if (selectedSchema === "marketing" && initialRecords !== undefined && !usedInitialRecords.current) {
      usedInitialRecords.current = true;
      setRecords(initialRecords);
      setLoading(false);
      return;
    }
    void loadRecords();
    // schema.tableName is derived from selectedSchema and intentionally refetches each tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchema, supabase]);

  const startCreate = () => {
    setEditingCode(null);
    setFormData(createBlankForm(selectedSchema, records.length + 1));
    setIsCustomMarketingCategory(false);
    setIsCustomPlaybookCategory(false);
    setNotice("Đang tạo nội dung mới. Preview sẽ cập nhật theo từng ký tự.");
  };

  const startEdit = (record: ContentRecord) => {
    const nextForm = schema.fields.reduce<FormData>((draft, field) => ({ ...draft, [field.key]: record[field.key] ?? (field.type === "number" ? 1 : "") }), {});
    if (selectedSchema === "marketing") {
      nextForm.category = getDynamicCategory(record.category, DEFAULT_MARKETING_CATEGORY);
    }
    if (selectedSchema === "playbooks") {
      nextForm.skill_system = getDynamicCategory(record.skill_system, DEFAULT_PLAYBOOK_CATEGORY);
      nextForm.team_id = typeof record.team_id === "string" ? record.team_id : null;
    }
    setEditingCode(record.code);
    setFormData(nextForm);
    setIsCustomMarketingCategory(false);
    setIsCustomPlaybookCategory(false);
    setNotice(`Đang chỉnh sửa ${record.code}.`);
  };

  const updateField = (key: string, value: string, type: string) => {
    setFormData((current) => ({ ...current, [key]: type === "number" ? Number(value || 0) : value }));
  };

  const saveRecord = async () => {
    if (!supabase) return setError("Supabase Content chưa được cấu hình cho CMS.");
    const missingField = schema.fields.find((field) => field.required && String(formData[field.key] ?? "").trim() === "");
    if (missingField) return setError(`Vui lòng nhập ${missingField.label}.`);
    setSaving(true);
    setError("");
    const payload = { ...formData, sort_order: Number(formData.sort_order ?? 0) };
    const { error: saveError } = await supabase.from(schema.tableName).upsert(payload, { onConflict: "code" });
    setSaving(false);
    if (saveError) return setError(saveError.message);
    setNotice(editingCode ? `Đã cập nhật ${editingCode}.` : `Đã lưu ${String(formData.code)}.`);
    setEditingCode(String(formData.code));
    await loadRecords();
    await onContentChanged?.();
  };

  const deleteRecord = async (record: ContentRecord) => {
    if (!supabase || !window.confirm(`Xóa ${record.code} khỏi ${schema.tabName}?`)) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from(schema.tableName).delete().eq("code", record.code);
    setSaving(false);
    if (deleteError) return setError(deleteError.message);
    if (editingCode === record.code) startCreate();
    setNotice(`Đã xóa ${record.code}.`);
    await loadRecords();
    await onContentChanged?.();
  };

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]" aria-labelledby="pilot-admin-cms-title">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-5 py-5 text-white sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-200">Schema-Driven Content Operations</span>
          <h2 id="pilot-admin-cms-title" className="mt-1 text-2xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
          {selectedSchema === "playbooks" && <p className="mt-3 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">CRUD trực tiếp · Supabase playbook_cards</p>}
        </div>
        <button type="button" onClick={startCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white/80"><Plus size={17} />Thêm nội dung</button>
      </header>

      <div className={`grid h-auto min-h-0 grid-cols-1 lg:h-[calc(100vh-100px)] ${schemaKeys.length > 1 ? "lg:grid-cols-[220px_minmax(0,1fr)_minmax(360px,.9fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)]"}`}>
        {schemaKeys.length > 1 && <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Content modules</p>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Chọn loại nội dung">
            {schemaKeys.map((key) => (
              <button key={key} type="button" onClick={() => setSelectedSchema(key)} className={`min-w-[175px] rounded-xl border px-3 py-3 text-left text-sm font-bold transition lg:min-w-0 ${selectedSchema === key ? "border-indigo-200 bg-indigo-600 text-white shadow-sm" : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:text-slate-950"}`}>
                {CONTENT_SCHEMAS[key].tabName}
              </button>
            ))}
          </nav>
        </aside>}

        <section className="flex min-h-0 flex-col border-b border-slate-200 lg:overflow-y-auto lg:border-b-0 lg:border-r" aria-label="Content editor">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600">Editor</p><h3 className="mt-1 font-bold text-slate-900">{editingCode ? `Chỉnh sửa ${editingCode}` : "Bản nháp mới"}</h3></div>
            {loading && <Loader2 className="animate-spin text-indigo-600" size={20} aria-label="Đang tải nội dung" />}
          </div>

          <div className="grid min-h-0 flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(180px,.85fr)]">
            <div className="space-y-4">
              {selectedSchema === "playbooks" && <WorkspaceAssignmentField teamId={typeof formData.team_id === "string" ? formData.team_id : null} onTeamIdChange={(teamId) => setFormData((current) => ({ ...current, team_id: teamId }))} teams={workspaceTeams.teams} loading={workspaceTeams.loading} error={workspaceTeams.error} />}
              {schema.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 flex items-center gap-1 text-sm font-bold text-slate-700">{field.label}{field.required && <span className="text-rose-500">*</span>}</span>
                  {selectedSchema === "marketing" && field.key === "category" ? (
                    isCustomMarketingCategory ? <div className="space-y-2"><input value={String(formData[field.key] ?? "")} onChange={(event) => updateField(field.key, event.target.value, field.type)} placeholder="Nhập tên tab / danh mục mới" className="h-11 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" autoFocus /><button type="button" onClick={() => { setIsCustomMarketingCategory(false); updateField(field.key, marketingCategoryOptions[0] ?? DEFAULT_MARKETING_CATEGORY, field.type); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Chọn danh mục có sẵn</button></div> : <select value={String(formData[field.key] ?? DEFAULT_MARKETING_CATEGORY)} onChange={(event) => { if (event.target.value === "__new_category__") { setIsCustomMarketingCategory(true); updateField(field.key, "", field.type); return; } updateField(field.key, event.target.value, field.type); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                      {marketingCategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      <option value="__new_category__">+ Thêm Tab (Danh mục) mới</option>
                    </select>
                  ) : selectedSchema === "playbooks" && field.key === "skill_system" ? (
                    isCustomPlaybookCategory ? <div className="space-y-2"><input value={String(formData[field.key] ?? "")} onChange={(event) => updateField(field.key, event.target.value, field.type)} placeholder="Nhập Hệ Kỹ Năng mới" className="h-11 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" autoFocus /><button type="button" onClick={() => { setIsCustomPlaybookCategory(false); updateField(field.key, playbookCategoryOptions[0] ?? DEFAULT_PLAYBOOK_CATEGORY, field.type); }} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">Chọn Hệ Kỹ Năng có sẵn</button></div> : <select value={String(formData[field.key] ?? DEFAULT_PLAYBOOK_CATEGORY)} onChange={(event) => { if (event.target.value === "__new_playbook_category__") { setIsCustomPlaybookCategory(true); updateField(field.key, "", field.type); return; } updateField(field.key, event.target.value, field.type); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                      {playbookCategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      <option value="__new_playbook_category__">+ Thêm mới Hệ Kỹ Năng</option>
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea value={String(formData[field.key] ?? "")} onChange={(event) => updateField(field.key, event.target.value, field.type)} rows={4} className="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  ) : (
                    <input type={field.type} value={formData[field.key] ?? ""} min={field.type === "number" ? 0 : undefined} onChange={(event) => updateField(field.key, event.target.value, field.type)} readOnly={selectedSchema === "playbooks" && field.key === "code" && Boolean(editingCode)} aria-describedby={selectedSchema === "playbooks" && field.key === "code" && editingCode ? "playbook-code-locked" : undefined} className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${selectedSchema === "playbooks" && field.key === "code" && editingCode ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`} />
                  )}
                  {selectedSchema === "playbooks" && field.key === "code" && editingCode && <span id="playbook-code-locked" className="mt-1 block text-xs font-medium text-slate-500">Mã Bảo Bối được khóa khi cập nhật để bảo toàn định danh bản ghi.</span>}
                </label>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" disabled={saving} onClick={() => void saveRecord()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><Save size={17} />{saving ? "Đang lưu..." : "Lưu nội dung"}</button>
                <button type="button" disabled={saving} onClick={startCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><Plus size={17} />Bản nháp mới</button>
                {selectedSchema === "playbooks" && editingCode && <button type="button" disabled={saving} onClick={() => void deleteRecord({ ...formData, code: editingCode })} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 size={17} />Xóa Bảo Bối</button>}
              </div>
              {error && <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">{error}</p>}
              {notice && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">{notice}</p>}
            </div>

            <div className="min-h-[230px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between px-1"><span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Bản ghi hiện có</span><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{records.length}</span></div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
                {loading ? <div className="flex items-center gap-2 px-2 py-3 text-sm text-slate-500"><Loader2 className="animate-spin" size={15} />Đang tải...</div> : records.length ? records.map((record) => (
                  <article key={record.code} className={`rounded-xl border p-3 transition ${editingCode === record.code ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-start justify-between gap-2"><div><strong className="text-sm text-slate-800">{record.code}</strong><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{String(record.situation ?? record.topic ?? record.message_template ?? record.category ?? "Nội dung chưa đặt tên")}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => startEdit(record)} aria-label={`Sửa ${record.code}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"><Edit size={15} /></button><button type="button" onClick={() => void deleteRecord(record)} aria-label={`Xóa ${record.code}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div></div>
                  </article>
                )) : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-sm text-slate-500">Chưa có bản ghi cho module này.</div>}
              </div>
            </div>
          </div>
        </section>

        <aside className="bg-slate-50 p-4 lg:overflow-y-auto" aria-label="Live preview">
          <div className="sticky top-4 h-auto min-h-[420px] overflow-y-auto rounded-3xl border-[8px] border-slate-800 bg-slate-100 p-4 shadow-2xl lg:h-[calc(100vh-2rem)]">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-indigo-600">MÔ PHỎNG HIỂN THỊ TRÊN APP TVV</p><h3 className="mt-1 text-sm font-extrabold text-slate-900">{schema.tabName}</h3></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" aria-label="Preview đang đồng bộ" /></div>
            <div className="overflow-hidden rounded-2xl bg-white">{schema.renderPreview(formData)}</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
