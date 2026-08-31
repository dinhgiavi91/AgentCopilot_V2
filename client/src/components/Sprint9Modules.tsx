import React, { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, CalendarClock, CheckCircle2, Heart, HeartHandshake, MessageCircle, Plus, Send, ShieldCheck, Smile, Sparkles, Trophy, Users, X, Zap } from "lucide-react";
import { buildDirectorSummary, customerStages, getEmpathySuggestion, getNurtureSuggestion, nextNurtureStreak, nurtureContexts, validateCustomerJournalEntry, validateJournalEntry, type CustomerStage, type NurtureContext, type RadarSignal } from "../lib/sprint9Logic";
import { buildGoalVsActual, mockSelfReportedSales } from "../lib/leaderSalesPicture";
import { AdvancedDirectorReport } from "./AdvancedDirectorReport";

export type CommunityPost = {
  id: string;
  author: string;
  rank: string;
  message: string;
  createdAt: string;
  reactions: { heart: number; smile: number };
  comments: string[];
  isOwn?: boolean;
};

export const seedCommunityPosts: CommunityPost[] = [
  { id: "seed-1", author: "Thu Hà", rank: "Chuyên viên 1 năm", message: "Hôm nay mình kiên nhẫn hỏi thêm về điều khách thực sự lo lắng. Cuộc hẹn chưa chốt, nhưng khách chủ động xin một lịch follow-up rõ ràng.", createdAt: "10 phút trước", reactions: { heart: 12, smile: 4 }, comments: ["Cách bạn giữ nhịp rất tốt. Cùng xem lại phần mở đầu ở buổi coaching nhé!" ] },
  { id: "seed-2", author: "Minh Tuấn", rank: "Newbie 1 tháng", message: "Mình thử dùng ba câu hỏi Socratic từ Bảo Bối. Lần đầu khách chịu nói nhiều hơn về kế hoạch dài hạn.", createdAt: "42 phút trước", reactions: { heart: 8, smile: 6 }, comments: ["Tuyệt vời, tiếp tục ghi lại câu hỏi khách phản hồi tốt nhất nhé."] },
];

export function JournalFields({ value, onChange, isPublic, onVisibilityChange }: { value: string; onChange: (value: string) => void; isPublic: boolean; onVisibilityChange: (value: boolean) => void }) {
  return <section className="journal-fields"><div className="journal-title"><MessageCircle size={17} /><div><strong>Nhật Ký hành trình</strong><span>Chỉ kể trải nghiệm không định danh khách hàng</span></div></div><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="Kể lại trải nghiệm của bạn với Khách hàng hôm nay..." maxLength={700} /><label className="visibility-toggle"><input type="checkbox" checked={isPublic} onChange={(event) => onVisibilityChange(event.target.checked)} /><span aria-hidden="true" /><b>{isPublic ? "Công Khai với đồng đội" : "Chỉ Mình Tôi"}</b></label></section>;
}

export function CommunityHub({ posts, onPost, onToast, onGiftXp }: { posts: CommunityPost[]; onPost: (post: CommunityPost) => void; onToast: (message: string) => void; onGiftXp: (recipient: string) => void }) {
  const [draft, setDraft] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [reactionState, setReactionState] = useState<Record<string, "heart" | "smile" | null>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [localPosts, setLocalPosts] = useState(posts);

  const displayedPosts = useMemo(() => [...localPosts].sort((a, b) => Number(Boolean(b.isOwn)) - Number(Boolean(a.isOwn))), [localPosts]);
  const publish = () => {
    const error = validateJournalEntry(draft);
    if (error) return onToast(error);
    if (!isPublic) return onToast("Nhật Ký đã lưu ở chế độ Chỉ Mình Tôi. Không hiển thị vào Feed.");
    const post: CommunityPost = { id: `post-${Date.now()}`, author: "Bạn", rank: "TVV", message: draft.trim(), createdAt: "Vừa xong", reactions: { heart: 0, smile: 0 }, comments: [], isOwn: true };
    setLocalPosts((current) => [post, ...current]); onPost(post); setDraft(""); onToast("Nhật Ký công khai đã vào Feed Cộng Đồng.");
  };
  const react = (postId: string, type: "heart" | "smile") => {
    setReactionState((current) => ({ ...current, [postId]: current[postId] === type ? null : type }));
    setLocalPosts((current) => current.map((post) => post.id !== postId ? post : { ...post, reactions: { ...post.reactions, [type]: post.reactions[type] + (reactionState[postId] === type ? -1 : 1) } }));
  };
  const comment = (postId: string) => {
    const text = commentDraft[postId]?.trim(); if (!text) return;
    setLocalPosts((current) => current.map((post) => post.id !== postId ? post : { ...post, comments: [...post.comments, text] }));
    setCommentDraft((current) => ({ ...current, [postId]: "" })); onToast("Đã gửi một lời động viên tới đồng đội.");
  };

  return <div className="community-page screen-enter"><section className="community-hero"><div><span><Users size={15} />CỘNG ĐỒNG · DEMO SOCIAL</span><h1>Nhìn thấy nỗ lực.<br /><em>Giữ nhau ở lại.</em></h1><p>Chia sẻ trải nghiệm Zero-PII, phản hồi nhanh và biến từng hành động nhỏ thành động lực chung.</p></div><div className="community-orbit"><Heart size={44} /><small>TEAM PULSE</small></div></section><section className="community-composer lift-card"><div className="composer-head"><div className="community-avatar own">B</div><div><strong>Chia sẻ một điều bạn vừa học</strong><span>Không nhập tên, số điện thoại hoặc thông tin nhận diện khách hàng.</span></div></div><JournalFields value={draft} onChange={setDraft} isPublic={isPublic} onVisibilityChange={setIsPublic} /><button className="community-publish cta-glow" onClick={publish}><Send size={16} />Đăng vào Cộng Đồng</button></section><div className="community-feed">{displayedPosts.map((post) => <article className="community-post lift-card" key={post.id}><header><div className="community-avatar">{post.author.slice(0, 1)}</div><div><strong>{post.author}</strong><span>{post.rank} · {post.createdAt}</span></div><i>{post.isOwn ? "MỚI" : "NHỊP ĐỒNG ĐỘI"}</i></header><p>{post.message}</p><div className="reaction-row"><button className={reactionState[post.id] === "heart" ? "is-active heart" : ""} onClick={() => react(post.id, "heart")}><Heart size={16} />{post.reactions.heart}</button><button className={reactionState[post.id] === "smile" ? "is-active smile" : ""} onClick={() => react(post.id, "smile")}><Smile size={16} />{post.reactions.smile}</button><button className="community-gift" onClick={() => onGiftXp(post.author)}><HeartHandshake size={15} />Tặng XP</button><span>{post.comments.length} lời động viên</span></div><div className="comment-stack">{post.comments.map((entry, index) => <p key={`${post.id}-${index}`}><b>Đồng đội</b>{entry}</p>)}</div><div className="comment-input"><input value={commentDraft[post.id] ?? ""} onChange={(event) => setCommentDraft((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Gửi lời động viên…" maxLength={240} /><button onClick={() => comment(post.id)} aria-label="Gửi bình luận"><Send size={15} /></button></div></article>)}</div></div>;
}

type CustomerJournalRecord = { id: string; alias: string; stage: CustomerStage; context: NurtureContext; note: string; streak: number; nextTouch: string };

const seedCustomerJournal: CustomerJournalRecord[] = [
  { id: "nurture-01", alias: "Hồ sơ nuôi dưỡng #01", stage: "pre_sale", context: "expecting", note: "Đã hỏi thăm hành trình chuẩn bị, khách mong nhận tài liệu dễ đọc cho gia đình.", streak: 3, nextTouch: "Ngày mai" },
  { id: "nurture-02", alias: "Hồ sơ nuôi dưỡng #02", stage: "post_sale", context: "renewal", note: "Đã nhắc khách tự rà soát quyền lợi và ghi lại câu hỏi trước kỳ cập nhật.", streak: 5, nextTouch: "Sau 4 ngày" },
];

export function CustomerJournalHub({ onToast }: { onToast: (message: string) => void }) {
  const [records, setRecords] = useState<CustomerJournalRecord[]>(seedCustomerJournal);
  const [stage, setStage] = useState<CustomerStage>("pre_sale");
  const [context, setContext] = useState<NurtureContext>("expecting");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<CustomerStage | "all">("all");
  const suggestion = getNurtureSuggestion(stage, context);
  const visibleRecords = records.filter((record) => filter === "all" || record.stage === filter);
  const create = () => {
    const error = validateCustomerJournalEntry(note);
    if (error) return onToast(error);
    setRecords((current) => [{ id: `nurture-${Date.now()}`, alias: `Hồ sơ nuôi dưỡng #${String(current.length + 1).padStart(2, "0")}`, stage, context, note: note.trim(), streak: 1, nextTouch: suggestion.cadence.replace("Gợi ý chạm lại ", "") }, ...current]);
    setNote(""); onToast("Đã tạo Nhật Ký Khách Hàng Zero-PII và gợi ý hành động tiếp theo.");
  };
  const completeTouch = (id: string) => {
    setRecords((current) => current.map((record) => record.id === id ? { ...record, streak: nextNurtureStreak(record.streak, true), nextTouch: "Đã giữ nhịp hôm nay" } : record));
    onToast("Đã ghi nhận một chạm nuôi dưỡng. Chuỗi chăm sóc được giữ tiếp.");
  };
  return <div className="customer-journal-page screen-enter"><section className="customer-journal-hero"><div><span><CalendarClock size={15} />CRM NUÔI DƯỠNG · ZERO-PII</span><h1>Chăm đúng lúc.<br /><em>Đồng hành đủ lâu.</em></h1><p>Chỉ lưu giai đoạn, bối cảnh và hành động. Không nhập tên, số điện thoại, email hay định danh khách hàng.</p></div><div className="customer-journal-orbit"><ShieldCheck size={42} /><small>NO CLIENT PII</small></div></section><section className="nurture-workbench lift-card"><div className="nurture-form"><div className="form-heading"><div><span>TẠO NHẬT KÝ NUÔI DƯỠNG</span><h2>Một hành động nhỏ,<em> một mối quan hệ dài.</em></h2></div><small>State demo · chưa lưu dữ liệu khách hàng thật</small></div><div className="nurture-grid"><label>Giai đoạn<select value={stage} onChange={(event) => setStage(event.target.value as CustomerStage)}>{Object.entries(customerStages).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label><label>Bối cảnh chăm sóc<select value={context} onChange={(event) => setContext(event.target.value as NurtureContext)}>{Object.entries(nurtureContexts).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div><label>Hành động hoặc quan sát không định danh<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="VD: Đã gửi checklist chuẩn bị tài chính gia đình, không đề cập tên hay thông tin liên lạc." maxLength={500} /></label><button className="cta-glow" onClick={create}><Plus size={16} />Tạo Nhật Ký chăm sóc</button></div><aside className="nurture-suggestion"><div className="suggestion-icon"><HeartHandshake size={20} /></div><span>GỢI Ý THẤU CẢM · {suggestion.stageLabel.toUpperCase()}</span><h3>{suggestion.title}</h3><p>{suggestion.action}</p><footer><CalendarClock size={15} />{suggestion.cadence}</footer></aside></section><div className="customer-journal-toolbar"><div><span>HỒ SƠ ĐANG NUÔI DƯỠNG</span><h2>Nhìn theo hành động,<em> không theo áp lực bán.</em></h2></div><div className="nurture-filter" aria-label="Lọc giai đoạn nuôi dưỡng"><button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>Tất cả</button>{Object.entries(customerStages).map(([key, item]) => <button key={key} className={filter === key ? "is-active" : ""} onClick={() => setFilter(key as CustomerStage)}>{item.label}</button>)}</div></div><div className="customer-journal-list">{visibleRecords.map((record) => { const recordSuggestion = getNurtureSuggestion(record.stage, record.context); return <article className="customer-journal-card lift-card" key={record.id}><header><div><span>{record.alias}</span><h3>{customerStages[record.stage].label} · {nurtureContexts[record.context]}</h3></div><div className="nurture-streak"><FlameBadge /><strong>{record.streak}</strong><small>chạm liên tiếp</small></div></header><p>{record.note}</p><div className="record-suggestion"><HeartHandshake size={16} /><div><strong>{recordSuggestion.title}</strong><span>{recordSuggestion.action}</span></div></div><footer><span><CalendarClock size={15} />{record.nextTouch}</span><button onClick={() => completeTouch(record.id)}><CheckCircle2 size={15} />Đã hoàn thành chạm</button></footer></article>; })}</div></div>;
}

function FlameBadge() { return <Sparkles size={16} aria-label="Chuỗi nuôi dưỡng" />; }

export type TeamContest = { id: string; title: string; xp: number; createdAt: string };
const EMPTY_CONTESTS: TeamContest[] = [];

type ContestPanelProps = {
  managerMode: boolean;
  onToast: (message: string) => void;
  initialContests?: TeamContest[];
  onPersistContest?: (draft: Pick<TeamContest, "title" | "xp">) => Promise<TeamContest>;
  onContestCreated?: (contest: TeamContest) => void;
};

export function ContestPanel({ managerMode, onToast, initialContests = EMPTY_CONTESTS, onPersistContest, onContestCreated }: ContestPanelProps) {
  const [open, setOpen] = useState(false); const [title, setTitle] = useState(""); const [xp, setXp] = useState("1000"); const [contests, setContests] = useState<TeamContest[]>(initialContests); const [saving, setSaving] = useState(false);
  useEffect(() => { setContests(initialContests); }, [initialContests]);
  const latestContest = contests[0] ?? null;
  if (!managerMode) return <p className="contest-role-note"><Award size={15} />Leader PRO có thể tạo Contest cho đội ngay tại đây.</p>;
  const create = async () => { const amount = Number(xp); if (!title.trim() || !Number.isFinite(amount) || amount < 20) return onToast("Nhập tên Contest và tối thiểu 20 XP."); setSaving(true); try { const draft = { title: title.trim(), xp: amount }; const created = onPersistContest ? await onPersistContest(draft) : { id: `contest-${Date.now()}`, ...draft, createdAt: new Date().toISOString() }; setContests((current) => current.some((item) => item.id === created.id) ? current : [created, ...current]); onContestCreated?.(created); setOpen(false); setTitle(""); onToast("Contest đã lưu thành công và xuất hiện ngay trong danh sách đội."); } catch (error) { onToast(error instanceof Error ? error.message : "Không thể lưu Contest lúc này."); } finally { setSaving(false); } };
  return <section className="contest-panel"><div><span>LEADER CONTEST</span><h3>{latestContest ? latestContest.title : "Thưởng đúng lúc, lan tỏa đúng hành động."}</h3><p>{latestContest ? `${latestContest.xp} XP · Đang chờ người hoàn thành thử thách.` : "Tạo thử thách như thưởng XP cho người chốt HĐ đầu tiên."}</p></div><button className="contest-create cta-hover" onClick={() => setOpen(true)}><Plus size={16} />Tạo Contest Mới</button><div className="contest-list" aria-live="polite" aria-label="Danh sách Contest đang hoạt động">{contests.slice(0, 3).map((contest) => <article key={contest.id}><Trophy size={15} /><div><strong>{contest.title}</strong><span>{contest.xp} XP · Vừa tạo</span></div><CheckCircle2 size={16} /></article>)}{!contests.length && <p>Chưa có Contest mới. Tạo thử thách để đội cùng giữ nhịp.</p>}</div>{open && <div className="contest-form"><button className="contest-close" onClick={() => setOpen(false)} aria-label="Đóng tạo contest"><X size={16} /></button><label>Tên Contest<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="VD: Chốt HĐ đầu tiên tuần" /></label><label>Thưởng XP<input inputMode="numeric" value={xp} onChange={(event) => setXp(event.target.value.replace(/[^0-9]/g, ""))} /></label><button className="cta-glow" onClick={() => void create()} disabled={saving}><Trophy size={15} />{saving ? "Đang lưu…" : "Tạo thử thách"}</button></div>}</section>;
}

export function DirectorRadar({ onToast, autoOpenReport = false }: { onToast: (message: string) => void; autoOpenReport?: boolean }) {
  const signals: Array<{ name: string; metric: string; type: RadarSignal }> = [{ name: "Thu Hà", metric: "5 cuộc gặp · 100% từ chối", type: "rejection" }, { name: "Minh Tuấn", metric: "Mất chuỗi 5 ngày", type: "streak" }, { name: "Ngân", metric: "Dời lịch 3 lần", type: "reschedule" }];
  const [reportOpen, setReportOpen] = useState(autoOpenReport); const summary = buildDirectorSummary(signals); const salesPicture = buildGoalVsActual(620_000_000, mockSelfReportedSales); const formatMillions = (amount: number) => `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(amount / 1_000_000)} triệu`;
  if (reportOpen) return <AdvancedDirectorReport onClose={() => setReportOpen(false)} onToast={onToast} />;
  return <><section className="empathy-radar"><div className="radar-section-head"><div><span>RADAR THẤU CẢM · DEMO</span><h2>Đọc tín hiệu, <em>chọn đúng cách chạm.</em></h2></div><button className="report-trigger cta-glow" onClick={() => setReportOpen(true)}><BarChart3 size={16} />Xuất Báo Cáo GĐ</button></div>{signals.map((signal) => { const guide = getEmpathySuggestion(signal.type); return <article className={`empathy-signal ${guide.tone}`} key={signal.name}><div><strong>{signal.name}</strong><span>{signal.metric}</span></div><p><b>{guide.message}</b>{guide.action}</p><button onClick={() => onToast(`Đã tạo hành động coaching cho ${signal.name}.`)}>Lên lịch chạm</button></article>; })}</section>{reportOpen && <div className="director-report-backdrop"><section className="director-report storytelling-report"><button className="report-close" onClick={() => setReportOpen(false)} aria-label="Đóng báo cáo"><X size={18} /></button><header><span>BÁO CÁO GIÁM ĐỐC · DEMO PRO</span><h2>Đội đang ở đâu<br /><em>và đi tiếp thế nào?</em></h2><p>Chuyển dữ liệu hành động thành một câu chuyện lãnh đạo: nhìn đúng điểm nghẽn, ghi nhận nỗ lực và chọn một ưu tiên rõ ràng.</p></header><section className="report-story-section report-overview"><div className="report-section-label"><i>01</i><div><span>TỔNG QUAN</span><h3>Nhịp đội vẫn đang chạy.</h3></div></div><div className="report-kpis"><article><strong>12</strong><span>TVV hoạt động</span></article><article><strong>3</strong><span>Tín hiệu cần chạm</span></article><article><strong>74%</strong><span>Nhịp follow-up</span></article></div><div className="report-analysis"><b>Điểm nghẽn tuần này</b><p>{summary}</p></div></section><section className="report-story-section report-goal-vs-actual"><div className="report-section-label"><i>01A</i><div><span>TIẾN ĐỘ MỤC TIÊU · GOAL VS. ACTUAL</span><h3>Bức tranh Doanh số tự khai báo.</h3></div></div><div className="goal-actual-values"><article><span>MỤC TIÊU TEAM</span><strong>{formatMillions(salesPicture.teamGoal)}</strong><small>Tổng mục tiêu TVV đã đặt đầu tháng</small></article><article><span>THỰC ĐẠT</span><strong>{formatMillions(salesPicture.actualRevenue)}</strong><small>{salesPicture.successfulTouches} Nhịp Đập Ký Hợp Đồng/Thành công</small></article></div><div className="goal-progress-card"><header><span>TỶ LỆ HOÀN THÀNH</span><strong>{salesPicture.completionRate}%</strong></header><div className="goal-progress-track" role="progressbar" aria-label="Tiến độ Mục tiêu Team" aria-valuemin={0} aria-valuemax={100} aria-valuenow={salesPicture.completionRate}><i style={{ width: `${salesPicture.progressWidth}%` }} /></div><footer><span>{formatMillions(salesPicture.actualRevenue)} thực đạt</span><span>{formatMillions(salesPicture.teamGoal)} mục tiêu</span></footer></div><p className="self-report-note">Số liệu tự khai báo từ Nhịp Đập có trạng thái Ký Hợp Đồng hoặc Thành công; chỉ dùng để nhìn xu hướng nội bộ, không liên kết dữ liệu công ty BH.</p></section><section className="report-story-section report-effort"><div className="report-section-label"><i>02</i><div><span>ĐÁNH GIÁ NỖ LỰC TEAM</span><h3>Không chỉ nhìn vào hợp đồng.</h3></div></div><div className="effort-grid"><article><Trophy size={18} /><strong>8/12 TVV</strong><span>giữ nhịp hoạt động tối thiểu 3 ngày</span></article><article><HeartHandshake size={18} /><strong>19 chạm</strong><span>follow-up và động viên đã được ghi nhận</span></article><article><Sparkles size={18} /><strong>1 điểm sáng</strong><span>một TVV mới đã luyện Bảo Bối trước cuộc hẹn</span></article></div></section><section className="report-story-section report-plan"><div className="report-section-label"><i>03</i><div><span>ĐỀ XUẤT KẾ HOẠCH TUẦN</span><h3>Chọn ít việc, làm thật sâu.</h3></div></div><ol><li><b>Thứ Hai:</b> Leader roleplay 15 phút với nhóm có tỷ lệ từ chối cao.</li><li><b>Giữa tuần:</b> Mỗi TVV hoàn tất 3 chạm follow-up có ngày hẹn rõ ràng.</li><li><b>Thứ Sáu:</b> Vinh danh một hành động chăm sóc tốt, không chỉ người chốt HĐ.</li></ol></section><button className="cta-glow" onClick={() => { setReportOpen(false); onToast("Báo cáo GĐ storytelling đã sẵn sàng để trình bày trong phiên demo."); }}><Sparkles size={16} />Xác nhận báo cáo</button></section></div>}</>;
}
