import React, { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Flame, Gift, ShieldCheck, Target, X, Zap } from "lucide-react";

type StreakMilestone = {
  day: number;
  name: string;
  xp: string;
  Icon: LucideIcon;
};

export type AgentStreakDetailsModalProps = {
  isOpen?: boolean;
  onClose: () => void;
  currentStreak?: number;
  milestones?: Array<{ id: string; milestoneDay: number; title: string; rewardLabel: string; xpReward: number; sortOrder: number }>;
  claimedMilestoneIds?: string[];
  claimingMilestoneId?: string | null;
  onClaimMilestone?: (milestoneId: string) => void;
};

const milestones: StreakMilestone[] = [
  { day: 7, name: "Khởi Động Hoàn Hảo", xp: "+50 XP", Icon: Target },
  { day: 14, name: "Giữ Vững Phong Độ", xp: "+150 XP", Icon: Zap },
  { day: 21, name: "Thói Quen Chiến Thắng", xp: "+300 XP & Bùa", Icon: ShieldCheck },
  { day: 30, name: "Kỷ Luật Thép", xp: "+500 XP", Icon: Gift },
];

export default function AgentStreakDetailsModal({
  isOpen = false,
  onClose,
  currentStreak = 0,
  milestones: dynamicMilestones = [],
  claimedMilestoneIds = [],
  claimingMilestoneId = null,
  onClaimMilestone,
}: AgentStreakDetailsModalProps) {
  const normalizedStreak = Math.max(0, Math.floor(Number(currentStreak) || 0));
  const renderedMilestones = dynamicMilestones.length ? dynamicMilestones.map((milestone, index) => ({ id: milestone.id, day: milestone.milestoneDay, name: milestone.title, xp: milestone.rewardLabel, xpReward: milestone.xpReward, Icon: [Target, Zap, ShieldCheck, Gift][index % 4] })) : milestones.map((milestone) => ({ ...milestone, id: `legacy-${milestone.day}`, xpReward: Number(milestone.xp.match(/\d+/)?.[0] ?? 0) }));
  const nextMilestone = renderedMilestones.find(milestone => normalizedStreak < milestone.day) ?? renderedMilestones[renderedMilestones.length - 1];
  const allMilestonesReached = normalizedStreak >= renderedMilestones[renderedMilestones.length - 1].day;
  const daysUntilNext = Math.max(0, nextMilestone.day - normalizedStreak);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        backgroundColor: "rgba(11, 20, 49, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
      role="presentation"
    >
      <section
        data-streak-details-modal
        className="flex min-h-0 w-full max-w-[420px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
        style={{
          position: "relative",
          zIndex: 99999,
          maxHeight: "90vh",
          animation: "streak-details-enter 220ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-details-title"
      >
        <style>{`
          @keyframes streak-details-enter {
            from { opacity: 0; transform: translateY(10px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-streak-details-modal] { animation: none !important; }
          }
        `}</style>
        <div data-testid="streak-details-header" className="relative flex shrink-0 flex-col items-center overflow-hidden bg-gradient-to-b from-orange-50 to-white px-6 pb-6 pt-10 text-center">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Đóng chi tiết chuỗi"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 blur-3xl" />
            <Flame size={80} strokeWidth={1} className="relative z-10 animate-pulse text-orange-500 drop-shadow-xl motion-reduce:animate-none" fill="#F97316" aria-hidden="true" />
          </div>
          <h2 id="streak-details-title" className="mt-2 text-[54px] font-black leading-none tracking-tighter text-[#0B1431]">
            {normalizedStreak}
          </h2>
          <p className="mt-1 text-[14px] font-bold uppercase tracking-widest text-orange-600">Ngày liên tiếp</p>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-100/50 px-4 py-2.5 text-left text-orange-800">
            <CalendarDays size={16} className="shrink-0 text-orange-500" aria-hidden="true" />
            <p className="text-[13px] font-medium leading-snug">
              {allMilestonesReached ? (
                <>Bạn đã chạm mọi cột mốc của <strong className="font-black text-orange-600">Kỷ luật thép</strong>. Hãy tiếp tục giữ nhịp!</>
              ) : (
                <>Bạn sẽ đạt cột mốc <strong className="font-black text-orange-600">{nextMilestone.name}</strong> sau <strong className="font-black text-orange-600">{daysUntilNext} ngày</strong> nữa!</>
              )}
            </p>
          </div>
        </div>

        <div className="w-full shrink-0 border-t border-dashed border-slate-200" />

        <div data-testid="streak-details-roadmap" className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 px-6 py-5">
          <h3 className="mb-4 text-[12px] font-black uppercase tracking-widest text-slate-400">Hành Trình Kỷ Luật</h3>
          <div className="relative flex flex-col gap-3">
            <div className="absolute bottom-4 left-[21px] top-4 z-0 w-[2px] bg-slate-200" />
            {renderedMilestones.map(milestone => {
              const isReached = normalizedStreak >= milestone.day;
              const isClaimed = claimedMilestoneIds.includes(milestone.id);
              const isNext = !allMilestonesReached && milestone.day === nextMilestone.day;
              const Icon = milestone.Icon;

              return (
                <article
                  key={milestone.day}
                  data-testid={`streak-milestone-${milestone.day}`}
                  data-status={isReached ? "reached" : isNext ? "next" : "upcoming"}
                  className={`relative z-10 flex items-center gap-4 rounded-2xl p-3 transition-all ${
                    isNext ? "border-2 border-orange-400 bg-white shadow-[0_4px_20px_rgba(249,115,22,0.15)]" : "border-2 border-transparent bg-transparent"
                  }`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 ${
                    isReached
                      ? "border-orange-100 bg-orange-500 text-white"
                      : isNext
                        ? "border-orange-200 bg-orange-50 text-orange-600"
                        : "border-white bg-slate-100 text-slate-400"
                  }`}>
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-[15px] font-black leading-tight ${isReached || isNext ? "text-[#0B1431]" : "text-slate-400"}`}>{milestone.name}</h4>
                    <p className={`mt-0.5 text-[12px] font-medium ${isReached ? "text-slate-500" : "text-slate-400"}`}>Mốc {milestone.day} ngày</p>
                  </div>
                  {isReached && !isClaimed && onClaimMilestone ? (
                    <button type="button" disabled={claimingMilestoneId === milestone.id} onClick={() => onClaimMilestone(milestone.id)} className="shrink-0 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 px-2.5 py-1.5 text-[11px] font-black tracking-wide text-white shadow-md transition hover:from-orange-500 hover:to-amber-600 disabled:cursor-wait disabled:opacity-60">{claimingMilestoneId === milestone.id ? "ĐANG NHẬN" : `NHẬN +${milestone.xpReward}`}</button>
                  ) : <div className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-black tracking-wide ${
                    isClaimed
                      ? "bg-emerald-100 text-emerald-700"
                      : isNext
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-slate-200 text-slate-500"
                  }`}>
                    {isClaimed ? "ĐÃ NHẬN" : milestone.xp}
                  </div>}
                </article>
              );
            })}
          </div>
        </div>

        <footer data-testid="streak-details-footer" className="shrink-0 border-t border-slate-100 bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-3.5 text-[14px] font-black uppercase tracking-widest text-[#0B1431] transition-all hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            Đóng
          </button>
        </footer>
      </section>
    </div>
  );
}
