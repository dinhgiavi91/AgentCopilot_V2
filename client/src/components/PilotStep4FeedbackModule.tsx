import React, { useEffect, useState } from "react";
import { HeartHandshake, Loader2, Send, Trophy } from "lucide-react";
import { fetchFeedbackConfig, type FeedbackConfig } from "../lib/supabaseContent";

export function PilotStep4FeedbackModule({ rating, feature, suggestion, saving, onRatingChange, onFeatureChange, onSuggestionChange, onSubmit }: {
  rating: number;
  feature: string;
  suggestion: string;
  saving: boolean;
  onRatingChange: (rating: number) => void;
  onFeatureChange: (feature: string) => void;
  onSuggestionChange: (suggestion: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const [config, setConfig] = useState<FeedbackConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    let active = true;
    fetchFeedbackConfig().then((nextConfig) => active && setConfig(nextConfig)).catch((error: unknown) => active && setConfigError(error instanceof Error ? error.message : "Không thể tải cấu hình khảo sát.")).finally(() => active && setLoadingConfig(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (config && feature && !config.dropdown_options.includes(feature)) onFeatureChange("");
  }, [config, feature, onFeatureChange]);

  if (loadingConfig) return <div className="screen-enter module-page"><section className="feedback-hero pilot-feedback-hero"><div><span>GÓC LẮNG NGHE · SUPABASE</span><h1>Đang tải.<br /><em>Khảo sát.</em></h1></div><HeartHandshake size={48} /></section><div className="flex min-h-52 items-center justify-center gap-3 text-sm font-bold text-slate-500"><Loader2 size={20} className="animate-spin text-indigo-600" />Đang tải cấu hình khảo sát...</div></div>;
  if (configError || !config) return <div className="screen-enter module-page"><section className="feedback-hero pilot-feedback-hero"><div><span>GÓC LẮNG NGHE · SUPABASE</span><h1>Khảo sát.<br /><em>Tạm nghỉ.</em></h1></div><HeartHandshake size={48} /></section><p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{configError || "Không tìm thấy cấu hình khảo sát."}</p></div>;

  return <div className="screen-enter module-page" data-feedback-survey="dynamic"><section className="feedback-hero pilot-feedback-hero"><div><span>GÓC LẮNG NGHE · SUPABASE</span><h1>{config.headline}</h1><p>Góp ý được ghi an toàn. Đừng nhập tên, số điện thoại hoặc thông tin nhận diện của khách hàng.</p></div><HeartHandshake size={48} /></section><form className="feedback-form lift-card" onSubmit={onSubmit}><div><span>ĐÁNH GIÁ TRẢI NGHIỆM</span><div className="rating-row">{[1, 2, 3, 4, 5].map((item) => <button type="button" className={item <= rating ? "is-active" : ""} onClick={() => onRatingChange(item)} key={item}><Trophy size={19} /><small>{item}</small></button>)}</div></div><label>Tính năng bạn thích nhất<select value={feature} onChange={(event) => onFeatureChange(event.target.value)} required><option value="">Chọn một tính năng</option>{config.dropdown_options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>{config.question_label} <small>Không nhập PII khách hàng</small><textarea value={suggestion} onChange={(event) => onSuggestionChange(event.target.value)} placeholder="Nhập góp ý giúp đội ngũ làm tốt hơn…" maxLength={1000} required /></label><button className="feedback-submit cta-glow" disabled={saving}>{saving ? "Đang gửi…" : "Gửi góp ý an toàn"}<Send size={17} /></button></form></div>;
}
