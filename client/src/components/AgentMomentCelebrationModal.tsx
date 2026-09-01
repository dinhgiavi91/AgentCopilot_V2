import React, { useEffect, useState } from "react";
import { CheckCircle2, PartyPopper, Sparkles, Star } from "lucide-react";
import { AgentMomentCard, type AgentMomentCardProps } from "./AgentMomentCard";
import leaderHeartImg from '../assets/images/leader-heart.png';
import openChimeSound from '../assets/sounds/celebration-open-chime_b1969992.mp3';
import claimCoinSound from '../assets/sounds/celebration-claim-coin_04b021b1.mp3';
const BRIGHT_HEART_ASSET = leaderHeartImg;
const CELEBRATION_OPEN_CHIME = openChimeSound;
const CELEBRATION_CLAIM_COIN = claimCoinSound;

function playCelebrationSound(src: string, volume: number) {
  if (typeof Audio === "undefined") return;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    const playback = audio.play();
    if (playback && typeof playback.catch === "function") void playback.catch(() => undefined);
  } catch {
    // Audio can be blocked by autoplay preferences or unavailable network audio.
  }
}

export type AgentMomentCelebrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Parent callback updates XP/coins or opens the recipient's Trophy Case. */
  onClaimReward?: (rewardName: string | null) => void | Promise<void>;
  onClaimError?: (error: unknown) => void;
  cardData?: Partial<AgentMomentCardProps>;
};

const fallbackCardData: AgentMomentCardProps = {
  bgAssetUrl: BRIGHT_HEART_ASSET,
  agentName: "TVV Pilot",
  recognitionType: "leader",
  cardType: "recognition",
  rewardName: "Bùa Cứu Chuỗi",
  leaderMessage: "Cảm ơn bạn đã kiên trì. Cả Team đang ghi nhận từng nỗ lực của bạn.",
};

export function AgentMomentCelebrationModal({
  isOpen,
  onClose,
  onClaimReward,
  onClaimError,
  cardData,
}: AgentMomentCelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const data: AgentMomentCardProps = { ...fallbackCardData, ...cardData, cardType: "recognition" };

  useEffect(() => {
    if (!isOpen) {
      setShowConfetti(false);
      setIsClaiming(false);
      return;
    }

    const confettiTimer = window.setTimeout(() => setShowConfetti(true), 100);
    playCelebrationSound(CELEBRATION_OPEN_CHIME, 0.6);
    return () => window.clearTimeout(confettiTimer);
  }, [isOpen]);

  const handleClaim = async () => {
    if (isClaiming) return;

    setIsClaiming(true);
    playCelebrationSound(CELEBRATION_CLAIM_COIN, 0.8);
    try {
      await Promise.resolve(onClaimReward?.(data.rewardName ?? null));
    } catch (error) {
      setIsClaiming(false);
      onClaimError?.(error);
      return;
    }

    window.setTimeout(() => {
      setIsClaiming(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="agent-moment-celebration-title">
      <div className="absolute inset-0 bg-[#0B1431]/95 backdrop-blur-md" aria-hidden="true" />

      <div className={`pointer-events-none absolute inset-0 transition-all duration-1000 ${showConfetti ? "scale-100 opacity-100" : "scale-95 opacity-0"}`} aria-hidden="true">
        <Sparkles size={40} className="absolute left-[12%] top-[16%] text-emerald-400 animate-ping" />
        <Star size={48} fill="currentColor" className="absolute right-[12%] top-[24%] text-amber-400 animate-pulse" />
        <PartyPopper size={40} className="absolute bottom-[18%] left-[16%] text-rose-400 animate-bounce" />
        <Sparkles size={32} className="absolute bottom-[28%] right-[16%] text-cyan-400 animate-ping [animation-delay:300ms]" />
        <Star size={24} fill="currentColor" className="absolute right-[40%] top-[10%] text-yellow-300 animate-bounce [animation-delay:150ms]" />
      </div>

      <div className={`relative z-10 flex w-full max-w-[460px] flex-col items-center transition-all duration-500 ${showConfetti && !isClaiming ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-90 opacity-0"} ${isClaiming ? "translate-y-10 scale-90 opacity-0" : ""}`}>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-full bg-emerald-500/20 p-3 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
            <PartyPopper size={32} aria-hidden="true" />
          </div>
          <h2 id="agent-moment-celebration-title" className="text-[26px] font-black uppercase tracking-tight text-white drop-shadow-lg sm:text-[30px]">Ting Ting! Món quà từ Sếp</h2>
          <p className="mt-1 text-[12px] font-bold uppercase tracking-widest text-emerald-300">Vinh danh đặc biệt dành cho bạn</p>
        </div>

        <div className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform sm:scale-105">
          <AgentMomentCard {...data} />
        </div>

        <button
          type="button"
          onClick={() => void handleClaim()}
          disabled={isClaiming}
          className="mt-10 flex w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-[16px] font-black uppercase tracking-widest text-white shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-1 hover:from-emerald-400 hover:to-teal-500 active:translate-y-1 disabled:cursor-wait disabled:opacity-50 sm:mt-12"
        >
          <CheckCircle2 size={22} aria-hidden="true" />
          {isClaiming ? "Đang nhận quà..." : "Tuyệt vời! Cảm ơn Sếp!"}
        </button>
      </div>
    </div>
  );
}

export default AgentMomentCelebrationModal;
