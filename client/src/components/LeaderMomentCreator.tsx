import React, { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { AgentMomentCard } from "./AgentMomentCard";
import { SYSTEM_MESSAGES, type Tone } from "../lib/momentCopyEngine";

const BRIGHT_HEART_ASSET = "/manus-storage/heart-emerald-bright-3d_6d6779c0.png";

export type LeaderMomentDraft = { tone: Tone; message: string; rewardName: string | null };

export function LeaderMomentCreator({
  onClose,
  onSubmit,
  agentName,
}: {
  onClose: () => void;
  onSubmit: (data: LeaderMomentDraft) => void | Promise<void>;
  agentName: string;
}) {
  const [selectedTone, setSelectedTone] = useState<Tone>("encouraging");
  const [humanMessage, setHumanMessage] = useState("");
  const [selectedReward, setSelectedReward] = useState("Bùa Cứu Chuỗi");
  const [submitting, setSubmitting] = useState(false);
  const tones: { id: Tone; label: string }[] = [
    { id: "calm", label: "Bình tĩnh" },
    { id: "warm", label: "Ấm áp" },
    { id: "proud", label: "Tự hào" },
    { id: "encouraging", label: "Khích lệ" },
    { id: "grateful", label: "Biết ơn" },
  ];

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="presentation" onClick={onClose}>
      <section className="relative z-[99999] flex w-full max-w-4xl flex-col overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-2xl max-h-[90vh] max-md:!flex max-md:!flex-col max-md:!overflow-y-auto md:flex-row" role="dialog" aria-modal="true" aria-label="Tạo thẻ vinh danh" onClick={(event) => event.stopPropagation()}>
        <div className="w-full md:w-1/2 p-6 sm:p-8 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="!text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Sparkles size={12} /> AGENT MOMENT™ CREATOR</span>
              <h2 className="!text-slate-800 text-2xl font-black mt-1">Ghi nhận {agentName}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Đóng tạo thẻ" className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors"><X size={18} /></button>
          </div>

          <div className="mb-6">
            <label className="block !text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">1. Chọn Tone giọng (System Voice)</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <button key={tone.id} type="button" onClick={() => setSelectedTone(tone.id)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${selectedTone === tone.id ? "bg-amber-100 border-amber-300 !text-amber-700" : "bg-white border-slate-200 !text-slate-600 hover:bg-slate-100"}`}>
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="leader-moment-reward" className="block !text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">2. Chọn phần thưởng kèm theo</label>
            <select id="leader-moment-reward" value={selectedReward} onChange={(event) => setSelectedReward(event.target.value)} className="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold !text-[#0B1431] shadow-sm outline-none transition-colors focus:border-amber-400">
              <option value="Bùa Cứu Chuỗi">🎁 Bùa Cứu Chuỗi (Khuyên dùng)</option>
              <option value="Thưởng 100 XP">⚡ Thưởng 100 XP</option>
              <option value="Voucher Cà Phê">☕ Voucher Cà Phê (50.000đ)</option>
              <option value="none">💬 Không tặng quà (Chỉ gửi lời nhắn)</option>
            </select>
          </div>

          <div className={`mb-8 flex-1 transition-all duration-300 ${selectedReward !== "none" ? "pointer-events-none opacity-40" : "opacity-100"}`}>
            <label htmlFor="leader-moment-message" className="block !text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">3. Lời nhắn của Leader (Human Voice)</label>
            <textarea id="leader-moment-message" disabled={selectedReward !== "none"} value={humanMessage} onChange={(event) => setHumanMessage(event.target.value)} placeholder={selectedReward !== "none" ? "Hệ thống sẽ tự động hiển thị phần thưởng trên thẻ…" : "VD: Anh biết tuần vừa rồi em hơi đuối. Thấy em quay lại anh rất vui..."} className="h-32 w-full resize-none rounded-xl border-2 border-slate-200 bg-white p-4 text-sm font-medium !text-slate-700 shadow-sm outline-none transition-colors focus:border-amber-400 disabled:cursor-not-allowed disabled:bg-slate-100" />
          </div>

          <button type="button" disabled={submitting} onClick={() => { setSubmitting(true); void Promise.resolve(onSubmit({ tone: selectedTone, message: selectedReward === "none" ? humanMessage.trim() : "", rewardName: selectedReward === "none" ? null : selectedReward })).finally(() => setSubmitting(false)); }} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 !text-white font-black rounded-xl uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60">
            <Send size={18} /> {submitting ? "ĐANG GỬI…" : "GỬI THẺ VINH DANH NÀY"}
          </button>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center justify-center overflow-visible rounded-b-[32px] border-t border-slate-100 bg-slate-50/50 p-6 max-md:!flex max-md:!w-full max-md:!shrink-0 max-md:!overflow-visible sm:p-8 md:w-1/2 md:flex-1 md:overflow-y-auto md:rounded-b-none md:rounded-r-[32px] md:border-l md:border-t-0">
          <div className="w-full flex justify-between items-center mb-6">
            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Live Preview</h3>
          </div>
          <div className="w-full flex justify-center transform scale-[0.85] origin-top transition-all duration-300">
            <AgentMomentCard
              cardType="recognition"
              theme="leader"
              bgAssetUrl={BRIGHT_HEART_ASSET}
              momentBadgeText="LEADER VINH DANH"
              agentName={agentName}
              recognitionType="leader"
              rewardName={selectedReward === "none" ? null : selectedReward}
              leaderMessage={selectedReward === "none" ? humanMessage : ""}
              quoteText={SYSTEM_MESSAGES.recovery.tones[selectedTone]}
              cardId="leader-moment-live-preview"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
