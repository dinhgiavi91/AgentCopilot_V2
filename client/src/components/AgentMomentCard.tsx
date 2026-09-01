import React from "react";
import { Gift, Heart, MessageSquareQuote, Quote, ShieldCheck, Sparkles } from "lucide-react";
import { AGENT_MOMENT_ASSETS } from "./agentMomentAssets";
import logoImg from '../assets/logo.png';
import leaderAvatarImg from '../assets/images/leader-avatar.png';

const OFFICIAL_LOGO = logoImg;
const LAUREL_WREATH_IMAGE = leaderAvatarImg;

export type MomentTheme = "default" | "recovery" | "consistency" | "leader";
export type RecognitionType = "personal" | "team" | "leader";
export type AgentMomentCardType = "reward" | "recognition";

export interface AgentMomentCardProps {
  cardType?: AgentMomentCardType;
  theme?: MomentTheme;
  bgAssetUrl?: string;
  momentBadgeText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroTitleTop?: string;
  heroTitleGold?: string;
  heroTitleBottom?: string;
  heroDescription?: string;
  agentName: string;
  agentAvatar?: string;
  recognitionType?: RecognitionType;
  teamName?: string;
  rewardName?: string | null;
  rewardValueText?: string;
  rewardImage?: string;
  leaderMessage?: string;
  rewardDescription?: string;
  expiryText?: string;
  quoteText?: string;
  onShare?: () => void;
  cardId?: string;
  ctaColor?: string;
}

const themeAssetMap: Record<MomentTheme, string> = {
  default: AGENT_MOMENT_ASSETS.trophyMoment,
  recovery: AGENT_MOMENT_ASSETS.growthMoment,
  consistency: AGENT_MOMENT_ASSETS.consistency,
  leader: AGENT_MOMENT_ASSETS.heartMoment,
};

export function AgentMomentCard({
  cardType = "reward",
  theme = "default",
  bgAssetUrl,
  momentBadgeText,
  heroTitle,
  heroSubtitle,
  heroTitleTop,
  heroTitleGold,
  heroTitleBottom,
  heroDescription = "Hành trình nhỏ hôm nay, tạo nên bạn tốt hơn ngày mai.",
  agentName,
  agentAvatar,
  recognitionType = "team",
  teamName = "Copilot",
  rewardName,
  rewardValueText = "PHẦN THƯỞNG ĐỘNG LỰC",
  rewardImage,
  leaderMessage,
  rewardDescription: _rewardDescription,
  expiryText: _expiryText,
  quoteText = "",
  onShare: _onShare,
  cardId = "agent-moment-card",
  ctaColor: _ctaColor,
}: AgentMomentCardProps) {
  const isRecognition = cardType === "recognition";
  const heroAssetUrl = bgAssetUrl || themeAssetMap[theme];
  const resolvedBadgeText = momentBadgeText || (isRecognition ? "LEADER VINH DANH" : "ACHIEVEMENT UNLOCKED");
  const resolvedTopTitle = heroTitleTop || (isRecognition ? "CẢM ƠN BẠN" : "BẠN ĐÃ");
  const resolvedGoldTitle = isRecognition ? (heroTitleGold || "VÌ NHỮNG NỖ LỰC") : (heroTitleGold || heroTitle || "MỞ KHÓA");
  const resolvedBottomTitle = heroTitleBottom !== undefined ? heroTitleBottom : (heroSubtitle !== undefined ? heroSubtitle : (isRecognition ? null : "MỘT PHẦN THƯỞNG"));
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const initial = agentName.trim().charAt(0) || "V";
  const showAvatarImage = Boolean(agentAvatar && !avatarFailed);
  const displayTeamName = teamName.trim() || "Copilot";
  const recognitionBadgeText = recognitionType === "personal"
    ? "Hành trình cá nhân"
    : recognitionType === "leader"
      ? "Leader tiếp lửa"
      : `Team ${displayTeamName}`;

  return (
    <div id={cardId} data-export-target="agent-moment" className="relative mx-auto flex min-h-[560px] w-full max-w-[460px] flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white font-sans shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
      <div
        className={`relative flex w-full flex-col justify-center overflow-hidden px-6 sm:px-8 ${isRecognition ? "h-[240px] bg-slate-50 sm:h-[260px]" : "h-[280px] bg-slate-900"}`}
        style={{ backgroundImage: `url(${heroAssetUrl})`, backgroundPosition: isRecognition ? "center right" : "center", backgroundSize: "cover" }}
      >
        <div className={`absolute inset-0 z-0 bg-gradient-to-r ${isRecognition ? "from-white/90 via-white/10 to-transparent" : "from-[#0B1431] via-[#0B1431]/80 to-transparent"}`} />
        <div className={`relative z-10 flex flex-col items-start text-left ${isRecognition ? "w-[65%] sm:w-[60%]" : "w-full"}`}>
          <span className={`mb-3 flex max-w-full items-center gap-1.5 truncate whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-md ${isRecognition ? "border-emerald-100 bg-white/90 text-emerald-700" : "border-amber-500/30 bg-amber-500/20 text-amber-400"}`}>
            {isRecognition ? <Heart size={12} fill="currentColor" /> : <ShieldCheck size={12} />} {resolvedBadgeText}
          </span>
          <h3 className={`mb-0.5 text-[14px] font-black uppercase tracking-widest sm:text-[15px] ${isRecognition ? "text-[#0B1431]" : "text-white/90 drop-shadow-md"}`}>{resolvedTopTitle}</h3>
          <h2 className={`mb-1 whitespace-nowrap pt-2 pb-1 text-[22px] font-black uppercase leading-[1.2] tracking-tight sm:text-[24px] ${isRecognition ? "" : "drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"}`} style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: isRecognition ? "linear-gradient(to bottom right, #047857, #064E3B, #0F766E)" : "linear-gradient(to bottom right, #FDE047, #F59E0B, #D97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>{resolvedGoldTitle}</h2>
          {resolvedBottomTitle && <h3 className="mb-2 text-[16px] font-bold uppercase tracking-wide text-white drop-shadow-md sm:text-[18px]">{resolvedBottomTitle}</h3>}
          <p className={`pr-2 font-bold leading-relaxed ${isRecognition ? "mt-1 line-clamp-3 text-[12px] text-slate-700" : "mt-2 max-w-[80%] text-[13px] text-slate-200/90 drop-shadow-sm"}`}>{heroDescription}</p>
        </div>
      </div>

      {!isRecognition && (
        <div id="gift-icon-overlay" data-export-ignore="true" data-export-decoration="true" className="relative z-20 -mt-10 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 p-[7px] shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/80 shadow-[inset_0_4px_10px_rgba(255,255,255,0.4)]" style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)" }}>
              <Gift size={28} className="text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}

      <div className={`relative z-10 flex flex-col gap-4 bg-white px-4 pb-4 sm:gap-5 sm:px-6 sm:pb-6 ${isRecognition ? "-mt-4 rounded-t-[24px] pt-6" : "pt-3"}`}>
        <div className="mt-1 flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 pr-1 sm:gap-3 sm:pr-2">
            <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-2 border-white text-xl font-black text-white shadow-sm sm:h-12 sm:w-12 sm:rounded-full ${isRecognition ? "bg-gradient-to-br from-emerald-400 to-teal-600" : "bg-gradient-to-br from-amber-400 to-orange-500"}`}>
              {showAvatarImage ? (
                <img src={agentAvatar} alt="Avatar TVV" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
              ) : (
                <span className="relative z-10">{initial}</span>
              )}
              {!showAvatarImage && <Sparkles size={13} className="absolute bottom-0.5 right-0.5 text-amber-100 drop-shadow-sm" aria-hidden="true" />}
            </div>
            <div className="flex min-w-0 flex-col text-left">
              <span className="mb-0.5 truncate whitespace-nowrap text-[10px] font-medium text-slate-500 sm:text-[11px]">Hành trình của</span>
              <span className="truncate text-[14px] font-black leading-none tracking-tight text-[#0B1431] sm:text-[17px]">{agentName}</span>
              <span className="mt-1 flex w-fit items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-600 shadow-sm sm:mt-1.5 sm:text-[9px]">
                <Sparkles size={8} className="text-amber-500 sm:h-2.5 sm:w-2.5" /> TVV
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 border-l border-slate-200 pl-1.5 sm:pl-2.5">
            <img src={LAUREL_WREATH_IMAGE} alt="Recognition Seal" className="h-6 w-6 shrink-0 object-contain mix-blend-multiply contrast-105 sm:h-8 sm:w-8" />
            <span className="max-w-[70px] truncate whitespace-nowrap text-[8.5px] font-bold text-slate-600 sm:max-w-[110px] sm:text-[9.5px]">{recognitionBadgeText}</span>
          </div>
        </div>

        <div className="w-full border-t border-dashed border-slate-200" />

        {rewardName ? <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-3 shadow-[0_8px_20px_rgba(245,158,11,0.08)] sm:gap-4 sm:p-4">
          <div data-export-ignore="true" data-export-decoration="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl" />
          <Gift data-export-ignore="true" data-export-decoration="true" size={120} strokeWidth={0.5} className="pointer-events-none absolute -bottom-6 -right-4 text-amber-500/10" />
          <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-white p-2.5 shadow-[0_4px_12px_rgba(245,158,11,0.15)] sm:h-16 sm:w-16">
            <span className="absolute -right-2 -top-2 rounded-full border-2 border-white bg-gradient-to-br from-amber-400 to-orange-500 p-1 text-white shadow-sm" aria-hidden="true"><Sparkles size={10} /></span>
            {rewardImage ? <img src={rewardImage} alt="Phần thưởng" className="h-full w-full object-contain drop-shadow-sm" /> : <Gift size={26} className="text-amber-500 drop-shadow-sm sm:h-[30px] sm:w-[30px]" />}
          </div>
          <div className="z-10 flex min-w-0 flex-1 flex-col">
            <span className="mb-1 flex items-center gap-1.5 truncate text-[9px] font-black uppercase tracking-widest text-amber-600 sm:text-[10px]"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 animate-pulse" />{rewardValueText}</span>
            <span className="line-clamp-2 text-[15px] font-black leading-tight text-[#0B1431] drop-shadow-sm sm:text-[17px]">{rewardName}</span>
          </div>
        </div> : <div className="relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-4 shadow-[0_8px_20px_rgba(14,165,233,0.08)] sm:p-5"><div className="mb-2 flex items-center gap-2"><MessageSquareQuote size={15} className="text-cyan-600" /><span className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Lời nhắn trực tiếp từ Leader</span></div><p className="text-[14px] font-medium leading-relaxed text-[#0B1431] sm:text-[15px]">{leaderMessage || "Cảm ơn bạn đã kiên trì. Cả Team đang ghi nhận từng nỗ lực của bạn."}</p></div>}

        {quoteText && <div className="mb-1 mt-1 flex items-start gap-1 px-1 sm:mb-2 sm:gap-2">
          <Quote size={16} className="mt-1 shrink-0 rotate-180 text-amber-500/40 sm:h-5 sm:w-5" />
          <p className="flex-1 text-center text-[13px] font-medium italic leading-relaxed text-slate-700 sm:text-[14px]">{quoteText}</p>
          <Quote size={16} className="mt-1 shrink-0 text-amber-500/40 sm:h-5 sm:w-5" />
        </div>}

        <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-3 sm:pt-4">
          <img src={OFFICIAL_LOGO} alt="Agent Copilot" className="h-4 w-4 object-contain grayscale opacity-70 sm:h-5 sm:w-5" />
          <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.15em]">Trợ Lý Đội Ngũ <span className="mx-1 opacity-40">•</span> Your Growth Copilot</span>
        </div>
      </div>
    </div>
  );
}
