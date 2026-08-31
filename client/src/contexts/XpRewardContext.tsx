import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { awardAutomatedXp, type AutoXpAward, type AutoXpSource } from "../lib/supabaseContent";

type FlyReward = { id: string; amount: number };
type XpRewardContextValue = { award: (source: AutoXpSource, sourceKey: string) => Promise<AutoXpAward> };

const fallbackContext: XpRewardContextValue = {
  award: async () => { throw new Error("Reward engine chưa sẵn sàng trong phiên hiện tại."); },
};
const XpRewardContext = createContext<XpRewardContextValue>(fallbackContext);

function XpRewardOverlay({ rewards }: { rewards: FlyReward[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(<>
    <style>{`@keyframes agent-copilot-auto-xp-confetti { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.76); } 14% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); } 100% { opacity: 0; transform: translate(calc(50vw - 5.5rem), calc(-50vh + 4.5rem)) scale(.76); } } @keyframes agent-copilot-confetti-1 { to { opacity: 0; transform: translate(128px,-118px) rotate(280deg) scale(.72); } } @keyframes agent-copilot-confetti-2 { to { opacity: 0; transform: translate(-135px,-104px) rotate(-320deg) scale(.68); } } @keyframes agent-copilot-confetti-3 { to { opacity: 0; transform: translate(146px,54px) rotate(255deg) scale(.7); } } @keyframes agent-copilot-confetti-4 { to { opacity: 0; transform: translate(-144px,62px) rotate(-260deg) scale(.72); } } @keyframes agent-copilot-confetti-5 { to { opacity: 0; transform: translate(14px,-150px) rotate(340deg) scale(.65); } } @keyframes agent-copilot-confetti-6 { to { opacity: 0; transform: translate(2px,142px) rotate(-300deg) scale(.68); } }`}</style>
    {rewards.map((reward) => <div key={reward.id} role="status" aria-live="polite" data-testid="auto-xp-confetti" style={{ position: "fixed", left: "50%", top: "50%", zIndex: 100001, pointerEvents: "none" }}><strong style={{ display: "block", color: "#f59e0b", fontSize: "2rem", fontWeight: 800, textShadow: "0 10px 28px rgba(245, 158, 11, .48)", animation: "agent-copilot-auto-xp-confetti 2s cubic-bezier(.23, 1, .32, 1) both" }}>+{reward.amount} XP</strong>{["🎉", "✨", "💰", "🚀", "🎉", "✨"].map((emoji, index) => <i key={`${reward.id}-${index}`} aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", fontStyle: "normal", fontSize: "1.45rem", animation: `agent-copilot-confetti-${index + 1} 2s cubic-bezier(.23, 1, .32, 1) both` }}>{emoji}</i>)}</div>)}
  </>, document.body);
}

export function XpRewardProvider({ children }: { children: ReactNode }) {
  const [rewards, setRewards] = useState<FlyReward[]>([]);
  const award = useCallback(async (source: AutoXpSource, sourceKey: string) => {
    const result = await awardAutomatedXp(source, sourceKey);
    if (result.awarded && result.xpAmount > 0) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setRewards((current) => [...current, { id, amount: result.xpAmount }]);
      window.setTimeout(() => setRewards((current) => current.filter((reward) => reward.id !== id)), 2000);
    }
    return result;
  }, []);
  const value = useMemo(() => ({ award }), [award]);
  return <XpRewardContext.Provider value={value}>{children}<XpRewardOverlay rewards={rewards} /></XpRewardContext.Provider>;
}

export function useXpReward() {
  return useContext(XpRewardContext);
}
