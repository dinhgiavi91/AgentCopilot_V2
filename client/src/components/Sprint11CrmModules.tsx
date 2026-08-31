import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Flame, HeartHandshake, Plus, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { customerStages, getJournalNextSteps, getNurtureSuggestion, nurtureContexts, validateCustomerJournalEntry, type CustomerStage, type NurtureContext } from "../lib/sprint9Logic";
import { fetchCrmNurtureScenario, type CrmNurtureScenario, type PilotCrmJournalRecord } from "../lib/supabaseContent";

const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T12:00:00`));
const stageOptions = Object.entries(customerStages) as Array<[CustomerStage, (typeof customerStages)[CustomerStage]]>;
const contextOptions = Object.entries(nurtureContexts) as Array<[NurtureContext, string]>;
const quickLinkLabels: Record<NonNullable<CrmNurtureScenario["quickLinkView"]>, string> = { marketing: "Tạo thiệp bằng Marketing 1-Chạm", playbook: "Mở Bảo Bối liên quan", empathy: "Mở Ngôn Ngữ Thấu Cảm", cover: "Mở Trợ lý Thẩm định" };
const fallbackFollowUpDays: Record<NurtureContext, number> = { expecting: 7, new_parent: 10, health_recovery: 14, financial_goal: 5, renewal: 7, other: 7 };

export function getCrmDefaultFollowUpDate(days: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + Math.max(1, Math.min(60, days)));
  return date.toISOString().slice(0, 10);
}

export function stripCrmSuggestionPrefix(value: string, label: "emotional" | "action" | "longTerm") {
  const prefixes = {
    emotional: /^\s*chạm cảm xúc\s*:\s*/i,
    action: /^\s*hành động\s*\/\s*thuyết phục\s*:\s*/i,
    longTerm: /^\s*lưu ý dài hạn\s*:\s*/i,
  } as const;
  return value.replace(prefixes[label], "").trim();
}

export function Sprint11CrmHub({ onToast, records: remoteRecords, onCreate, onNavigate }: { onToast: (message: string) => void; records?: PilotCrmJournalRecord[]; onCreate?: (input: Pick<PilotCrmJournalRecord, "stage" | "context" | "note" | "followUpDate">) => Promise<void>; onNavigate?: (view: NonNullable<CrmNurtureScenario["quickLinkView"]>) => void }) {
  const [stage, setStage] = useState<CustomerStage>("pre_sale");
  const [context, setContext] = useState<NurtureContext>("expecting");
  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTouched, setFollowUpTouched] = useState(false);
  const [filter, setFilter] = useState<CustomerStage | "all">("all");
  const [saving, setSaving] = useState(false);
  const [localRecords, setLocalRecords] = useState<PilotCrmJournalRecord[]>([]);
  const [scenario, setScenario] = useState<CrmNurtureScenario | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(true);
  const records = remoteRecords ?? localRecords;
  const suggestion = getNurtureSuggestion(stage, context);
  const nextSteps = getJournalNextSteps(note, stage, context);
  const visibleRecords = useMemo(() => records.filter((record) => filter === "all" || record.stage === filter), [filter, records]);
  const upcoming = useMemo(() => [...records].filter((record) => record.followUpDate).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate)).slice(0, 3), [records]);
  useEffect(() => {
    let active = true;
    setScenarioLoading(true);
    void fetchCrmNurtureScenario(stage, context)
      .then((nextScenario) => {
        if (!active) return;
        setScenario(nextScenario);
        if (!followUpTouched) setFollowUpDate(getCrmDefaultFollowUpDate(nextScenario?.followUpDays ?? fallbackFollowUpDays[context]));
      })
      .catch(() => active && setScenario(null))
      .finally(() => active && setScenarioLoading(false));
    return () => { active = false; };
  }, [context, followUpTouched, stage]);
  const create = async () => {
    const error = validateCustomerJournalEntry(note);
    if (error) return onToast(error);
    setSaving(true);
    try {
      if (onCreate) await onCreate({ stage, context, note: note.trim(), followUpDate });
      else setLocalRecords((current) => [{ id: `legacy-${Date.now()}`, alias: `Hồ sơ nuôi dưỡng #${String(current.length + 1).padStart(2, "0")}`, stage, context, note: note.trim(), streak: 1, followUpDate }, ...current]);
      setNote(""); setFollowUpDate(getCrmDefaultFollowUpDate(scenario?.followUpDays ?? fallbackFollowUpDays[context])); setFollowUpTouched(false); onToast(onCreate ? "Đã lưu Nhật Ký Zero-PII. Lịch Follow-up và hồ sơ nuôi dưỡng đã đồng bộ tức thời." : "Đã tạo Nhật Ký Zero-PII và đưa chạm tiếp theo vào lịch nuôi dưỡng.");
    } catch (cause) { onToast(cause instanceof Error ? cause.message : "Không thể lưu Nhật Ký lúc này."); }
    finally { setSaving(false); }
  };
  const completeTouch = (id: string) => { if (!onCreate) setLocalRecords((current) => current.map((record) => record.id === id ? { ...record, streak: record.streak + 1, followUpDate: "" } : record)); onToast("Đã ghi nhận một chạm nuôi dưỡng. Chuỗi chăm sóc được giữ tiếp."); };
  return <div className="customer-journal-page sprint11-crm-page screen-enter"><section className="customer-journal-hero"><div><span><CalendarClock size={15} />CRM NUÔI DƯỠNG · ZERO-PII</span><h1>Chăm đúng lúc.<br /><em>Đồng hành đủ lâu.</em></h1><p>Chỉ lưu giai đoạn, bối cảnh, ngày chạm và hành động. Không nhập tên, số điện thoại, email hay định danh khách hàng.</p></div><div className="customer-journal-orbit"><ShieldCheck size={42} /><small>NO CLIENT PII</small></div></section><section className="nurture-workbench lift-card"><div className="nurture-form"><div className="form-heading"><div><span>TẠO NHẬT KÝ NUÔI DƯỠNG</span><h2>Một hành động nhỏ,<em> một mối quan hệ dài.</em></h2></div><small>Pilot Live · chỉ lưu dữ liệu Zero-PII</small></div><div className="nurture-grid"><label>Giai đoạn<select value={stage} onChange={(event) => { setStage(event.target.value as CustomerStage); setFollowUpTouched(false); }}>{stageOptions.map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label><label>Bối cảnh chăm sóc<select value={context} onChange={(event) => { setContext(event.target.value as NurtureContext); setFollowUpTouched(false); }}>{contextOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div><label>Hành động hoặc quan sát không định danh <small>Không nhập tên khách hàng, số điện thoại hay email.</small><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="VD: Đã gửi checklist chuẩn bị tài chính gia đình, không đề cập tên hay thông tin liên lạc." maxLength={500} /></label><section className="sprint11-next-steps" aria-live="polite"><header><WandSparkles size={18} /><div><span>{nextSteps.title} · {suggestion.stageLabel}</span><strong>{note.trim().length >= 8 ? "Dựa trên ghi chú không định danh bạn vừa nhập" : "Nhập ghi chú không định danh để tinh chỉnh gợi ý"}</strong></div></header><ol>{nextSteps.steps.map((item) => <li key={item}>{item}</li>)}</ol><footer><CalendarClock size={14} />{nextSteps.cadence}</footer></section><label className="sprint11-followup-input">Ngày Follow-up <small>Tuỳ chọn · chỉ lưu ngày hành động</small><input type="date" value={followUpDate} onChange={(event) => { setFollowUpDate(event.target.value); setFollowUpTouched(true); }} /></label><button className="cta-glow" onClick={() => void create()} disabled={saving}><Plus size={16} />{saving ? "Đang lưu…" : "Tạo Nhật Ký chăm sóc"}</button><p className="pilot-helper-text">Dữ liệu được lưu tự động. Kéo xuống để xem lịch sử.</p></div><aside className="nurture-suggestion"><div className="suggestion-icon"><HeartHandshake size={20} /></div><span>GỢI Ý THẤU CẢM · {customerStages[stage].label.toUpperCase()}</span><h3>{scenarioLoading ? "Đang lấy tình huống phù hợp…" : scenario?.title ?? "Gợi ý thấu cảm đang sẵn sàng"}</h3>{scenario ? <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600"><li><b>Chạm cảm xúc:</b> {stripCrmSuggestionPrefix(scenario.emotionalTouch, "emotional")}</li><li><b>Hành động/Thuyết phục:</b> {stripCrmSuggestionPrefix(scenario.actionPersuasion, "action")}</li><li><b>Lưu ý dài hạn:</b> {stripCrmSuggestionPrefix(scenario.longTermNote, "longTerm")}</li></ul> : <p>Gợi ý sẽ xuất hiện khi tình huống chăm sóc được đồng bộ từ kho nội dung.</p>}{scenario?.quickLinkView && onNavigate && <button type="button" onClick={() => onNavigate(scenario.quickLinkView!)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"><Sparkles size={15} />{quickLinkLabels[scenario.quickLinkView]}</button>}<footer><CalendarClock size={15} />{scenario ? `Gợi ý chạm lại sau ${scenario.followUpDays} ngày` : "Theo dõi ngày follow-up đã chọn"}</footer></aside></section><section className="sprint11-followup-calendar lift-card" aria-label="Lịch Follow-up Zero-PII"><header><div><span><CalendarClock size={15} />LỊCH FOLLOW-UP · ZERO-PII</span><h2>Ngày chạm sắp tới,<em> không cần hồ sơ định danh.</em></h2></div><p>Lịch chỉ hiển thị mã nhật ký, giai đoạn và ngày hành động.</p></header><div className="sprint11-calendar-grid">{upcoming.map((record) => <article key={record.id}><time>{formatDate(record.followUpDate)}</time><div><strong>{record.alias}</strong><span>{customerStages[record.stage].label} · {nurtureContexts[record.context as NurtureContext]}</span></div><Sparkles size={17} /></article>)}{!upcoming.length && <p className="sprint11-calendar-empty">Chưa có follow-up đã hẹn. Chọn ngày khi tạo Nhật Ký để giữ nhịp chăm sóc.</p>}</div></section><div className="customer-journal-toolbar"><div><span>HỒ SƠ ĐANG NUÔI DƯỠNG</span><h2>Nhìn theo hành động,<em> không theo áp lực bán.</em></h2></div><div className="nurture-filter" aria-label="Lọc giai đoạn nuôi dưỡng"><button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>Tất cả</button>{stageOptions.map(([key, item]) => <button key={key} className={filter === key ? "is-active" : ""} onClick={() => setFilter(key)}>{item.label}</button>)}</div></div><div className="customer-journal-list overflow-x-auto"><table className="w-full text-left border-collapse text-sm"><thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 font-black text-slate-700">Ngày chạm</th><th className="px-4 py-3 font-black text-slate-700">Giai đoạn</th><th className="px-4 py-3 font-black text-slate-700">Hành động</th><th className="px-4 py-3 font-black text-slate-700">Follow-up</th></tr></thead><tbody>{visibleRecords.map((record) => { const recordContext = record.context as NurtureContext; return <tr className="border-b border-gray-100 align-top transition hover:bg-gray-50" key={record.id}><td className="whitespace-nowrap px-4 py-4 text-slate-600">{record.followUpDate ? formatDate(record.followUpDate) : "Hôm nay"}<div className="mt-1 text-[11px] text-slate-400">{record.alias}</div></td><td className="whitespace-nowrap px-4 py-4 font-bold text-slate-800">{customerStages[record.stage].label}<div className="mt-1 text-xs font-normal text-slate-500">{nurtureContexts[recordContext]}</div></td><td className="min-w-[240px] px-4 py-4 leading-6 text-slate-700">{record.note}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600"><span>{record.followUpDate ? formatDate(record.followUpDate) : "Đã giữ nhịp hôm nay"}</span><button className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50" onClick={() => completeTouch(record.id)}><CheckCircle2 size={15} />Đã hoàn thành chạm</button></td></tr>; })}</tbody></table>{!visibleRecords.length && <section className="sprint11-crm-empty lift-card"><CalendarClock size={22} /><h3>Chưa có Nhật ký trong phạm vi này.</h3><p>Ghi một hành động Zero-PII để tạo nhịp chăm sóc đầu tiên.</p></section>}</div></div>;
}
