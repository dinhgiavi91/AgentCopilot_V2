import { Copy, Download, MessageCircleHeart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AgentMomentCard, type AgentMomentCardProps } from "./AgentMomentCard";

export type RewardShareMode = "team" | "leader" | "hidden";

interface MomentShareScreenProps {
  cardProps: AgentMomentCardProps;
  rewardShareMode: RewardShareMode;
  onRewardShareModeChange: (mode: RewardShareMode) => void;
  onDownload: () => void | Promise<void>;
  onCommunityShare?: () => void;
}

const SUGGESTED_CAPTION = "Không phải ngày nào cũng dễ dàng, nhưng có những món quà bất ngờ thế này lại làm mình có thêm 200% năng lượng. Cảm ơn sếp và đội ngũ đã luôn sát cánh cùng hành trình của mình! ✨\n\n#HanhTrinhPhatTrien #TroLyDoiNgu #AgentMoment";

async function copyCaptionToClipboard() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(SUGGESTED_CAPTION);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = SUGGESTED_CAPTION;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!copied) throw new Error("Clipboard unavailable");
    }
    toast.success("Đã copy lời nhắn! Sẵn sàng lan tỏa vào cộng đồng.");
    return true;
  } catch (error) {
    console.error("Caption copy error:", error);
    toast.error("Không thể copy tự động. Vui lòng thử lại.");
    return false;
  }
}

/** Behavioral wrapper for a capture-ready Agent Moment card. */
export function MomentShareScreen({
  cardProps,
  rewardShareMode,
  onRewardShareModeChange,
  onDownload,
  onCommunityShare,
}: MomentShareScreenProps) {
  const handleCopy = async () => {
    await copyCaptionToClipboard();
  };

  const handleCommunityShare = async () => {
    const copied = await copyCaptionToClipboard();
    if (copied) onCommunityShare?.();
  };

  return (
    <section className="flex w-full flex-col items-center px-0 py-2 font-sans" aria-label="Màn hình chia sẻ Agent Moment">
      <header className="mb-6 text-center">
        <h2 className="mb-1 text-[22px] font-black uppercase tracking-tight text-[#0B1431]">Tuyệt vời! Bạn có 1 cột mốc mới</h2>
        <p className="text-[14px] font-medium text-slate-500">Hãy lưu giữ và chia sẻ khoảnh khắc này nhé.</p>
      </header>

      <div className="w-full max-w-[420px] transition-transform duration-300 hover:scale-[1.02]">
        <AgentMomentCard {...cardProps} />
      </div>

      <div className="mt-7 flex w-full max-w-[420px] flex-col gap-4">
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm">
          <legend className="sr-only">Tùy chỉnh hiển thị Share Card</legend>
          <p className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-800">
            <Sparkles size={14} className="text-amber-500" /> Tùy chỉnh hiển thị
          </p>
          <div className="flex flex-col gap-2">
            {([
              ["team", "Đội ngũ", "Hiển thị ghi nhận từ đội ngũ"],
              ["leader", "Leader", "Hiển thị ghi nhận từ Leader"],
              ["hidden", "Không hiển thị", "Chỉ lưu lại cột mốc cá nhân"],
            ] as const).map(([mode, label, description]) => (
              <label key={mode} className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white">
                <input
                  checked={rewardShareMode === mode}
                  className="mt-0.5 h-4 w-4 accent-amber-500"
                  name={`share-mode-${cardProps.cardId}`}
                  onChange={() => onRewardShareModeChange(mode)}
                  type="radio"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-800">{label}</span>
                  <span className="text-xs font-medium text-slate-500">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="relative rounded-2xl border border-amber-200/50 bg-amber-50/50 p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <MessageCircleHeart size={14} className="text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Gợi ý lời nhắn</span>
          </div>
          <p className="pr-8 text-[13px] font-medium italic leading-relaxed text-slate-700 whitespace-pre-wrap">{SUGGESTED_CAPTION}</p>
          <button
            aria-label="Sao chép lời nhắn"
            className="absolute right-3 top-3 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:text-amber-500"
            onClick={() => void handleCopy()}
            title="Copy caption"
            type="button"
          >
            <Copy size={14} />
          </button>
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)] transition-all hover:opacity-90 active:scale-[0.98]"
          onClick={() => void handleCommunityShare()}
          type="button"
        >
          <Sparkles size={18} />
          <span className="text-[15px] font-black uppercase tracking-widest">LAN TỎA VÀO CỘNG ĐỒNG</span>
        </button>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
          onClick={() => void onDownload()}
          type="button"
        >
          <Download size={18} className="text-slate-400" />
          <span className="text-[14px] font-bold uppercase tracking-wide">TẢI ẢNH KHOE THÀNH TÍCH</span>
        </button>
      </div>
    </section>
  );
}

export { SUGGESTED_CAPTION };
