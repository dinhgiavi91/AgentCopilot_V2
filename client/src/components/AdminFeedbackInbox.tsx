import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Loader2, MessageSquareHeart, Settings2, Star, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { deleteUserFeedback, fetchFeedbackConfig, fetchUserFeedbacks, updateFeedbackConfig, type FeedbackConfig, type UserFeedbackRecord } from "../lib/supabaseContent";

function RatingStars({ rating }: { rating: number }) {
  return <span className="flex items-center gap-1" aria-label={`${rating} trên 5 sao`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} className={index < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}</span>;
}

export function AdminFeedbackInbox() {
  const [feedbacks, setFeedbacks] = useState<UserFeedbackRecord[]>([]);
  const [config, setConfig] = useState<FeedbackConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [featureFilter, setFeatureFilter] = useState("all");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [configOpen, setConfigOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [questionLabel, setQuestionLabel] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextFeedbacks, nextConfig] = await Promise.all([fetchUserFeedbacks(), fetchFeedbackConfig()]);
      setFeedbacks(nextFeedbacks);
      setConfig(nextConfig);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tải inbox phản hồi từ Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const featureOptions = useMemo(() => Array.from(new Set(feedbacks.map((item) => item.feature).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi")), [feedbacks]);
  const visibleFeedbacks = useMemo(() => feedbacks.filter((item) => (ratingFilter === "all" || item.rating === Number(ratingFilter)) && (featureFilter === "all" || item.feature === featureFilter)).sort((a, b) => dateSort === "newest" ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [dateSort, featureFilter, feedbacks, ratingFilter]);

  const openConfig = () => {
    if (!config) return;
    setHeadline(config.headline);
    setOptionsText(config.dropdown_options.join("\n"));
    setQuestionLabel(config.question_label);
    setError("");
    setConfigOpen(true);
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    setError("");
    try {
      await updateFeedbackConfig({ headline, dropdown_options: optionsText.split("\n"), question_label: questionLabel });
      const updated = await fetchFeedbackConfig();
      setConfig(updated);
      setConfigOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu cấu hình khảo sát.");
    } finally {
      setSavingConfig(false);
    }
  };

  const remove = async (feedback: UserFeedbackRecord) => {
    if (!window.confirm("Xóa phản hồi này khỏi inbox? Hành động không thể hoàn tác.")) return;
    setRemovingId(feedback.id);
    setError("");
    try {
      await deleteUserFeedback(feedback.id);
      setFeedbacks((current) => current.filter((item) => item.id !== feedback.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa phản hồi.");
    } finally {
      setRemovingId(null);
    }
  };

  return <div className="screen-enter module-page" data-admin-feedback-inbox="true"><section className="feedback-hero pilot-feedback-hero"><div><span>GÓC LẮNG NGHE · SUPER ADMIN</span><h1>Lắng nghe.<br /><em>Hành động.</em></h1><p>Inbox nội bộ chỉ hiển thị điểm đánh giá, tính năng và góp ý. Không dùng nội dung có thông tin nhận diện khách hàng.</p></div><MessageSquareHeart size={48} /></section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500">{config ? `Cấu hình đang dùng: ${config.headline}` : "Đang tải cấu hình khảo sát..."}</p><button type="button" onClick={openConfig} disabled={!config} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"><Settings2 size={16} />Cấu hình Câu hỏi Khảo sát</button></div>{error && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}{loading ? <div className="flex min-h-60 items-center justify-center gap-3 text-sm font-bold text-slate-500"><Loader2 size={20} className="animate-spin text-indigo-600" />Đang tải inbox Supabase...</div> : <><section className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"><span className="inline-flex items-center gap-2 text-sm font-black text-slate-700"><Filter size={16} className="text-indigo-600" />Bộ lọc phản hồi</span><select aria-label="Lọc theo số sao" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"><option value="all">Tất cả số sao</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}</select><select aria-label="Lọc theo tính năng" value={featureFilter} onChange={(event) => setFeatureFilter(event.target.value)} className="h-10 min-w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"><option value="all">Tất cả tính năng</option>{featureOptions.map((feature) => <option key={feature} value={feature}>{feature}</option>)}</select><select aria-label="Sắp xếp ngày tạo" value={dateSort} onChange={(event) => setDateSort(event.target.value as "newest" | "oldest")} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"><option value="newest">Mới nhất trước</option><option value="oldest">Cũ nhất trước</option></select><span className="text-xs font-semibold text-slate-400 sm:ml-auto">{visibleFeedbacks.length} phản hồi</span></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleFeedbacks.map((feedback) => <article key={feedback.id} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><RatingStars rating={feedback.rating} /><button type="button" disabled={removingId === feedback.id} onClick={() => void remove(feedback)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50" aria-label="Xóa phản hồi spam">{removingId === feedback.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button></div><span className="mt-5 text-[11px] font-black uppercase tracking-widest text-indigo-600">Tính năng được yêu thích</span><h2 className="mt-1 text-base font-black text-slate-800">{feedback.feature}</h2><p className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{feedback.suggestion}</p><time className="mt-5 text-[11px] font-medium text-slate-400">{new Date(feedback.created_at).toLocaleString("vi-VN")}</time></article>)}{!visibleFeedbacks.length && <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center text-sm font-semibold text-slate-500">Không có phản hồi phù hợp bộ lọc.</div>}</section></>}<Dialog open={configOpen} onOpenChange={setConfigOpen}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border-slate-200 bg-white p-0"><div className="border-b border-slate-200 bg-slate-50 px-6 py-5"><DialogTitle className="text-xl font-black text-slate-900">Cấu hình Câu hỏi Khảo sát</DialogTitle><DialogDescription className="mt-1 text-sm leading-6 text-slate-500">Các thay đổi sẽ cập nhật trực tiếp headline, dropdown và nhãn textarea của form TVV/Leader.</DialogDescription></div><div className="space-y-4 p-6"><label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Headline *</span><input value={headline} onChange={(event) => setHeadline(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label><label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Lựa chọn dropdown *</span><textarea value={optionsText} onChange={(event) => setOptionsText(event.target.value)} rows={7} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /><small className="mt-1 block text-xs text-slate-500">Mỗi dòng là một lựa chọn hiển thị cho TVV/Leader.</small></label><label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Nhãn câu hỏi *</span><input value={questionLabel} onChange={(event) => setQuestionLabel(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label></div><div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4"><button type="button" onClick={() => setConfigOpen(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button><button type="button" disabled={savingConfig} onClick={() => void saveConfig()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-60">{savingConfig && <Loader2 className="animate-spin" size={16} />}{savingConfig ? "Đang lưu..." : "Lưu cấu hình"}</button></div></DialogContent></Dialog></div>;
}
