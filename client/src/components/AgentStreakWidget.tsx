import React from "react";
import { ChevronRight, Flame, Gift } from "lucide-react";
import { calculateStreakProgress } from "../lib/streakProgress";

export type AgentStreakMilestone = {
  id: string;
  milestoneDay: number;
  title: string;
  rewardLabel: string;
  xpReward: number;
  sortOrder: number;
};

export type AgentStreakWidgetProps = {
  currentStreak?: number;
  milestones?: AgentStreakMilestone[];
  unclaimedMilestone?: AgentStreakMilestone | null;
  isClaiming?: boolean;
  onClaimMilestone?: (milestone: AgentStreakMilestone) => void;
  onDetails?: () => void;
  dailyQuizPending?: boolean;
};

export default function AgentStreakWidget({
  currentStreak = 0,
  milestones = [],
  unclaimedMilestone = null,
  isClaiming = false,
  onClaimMilestone,
  onDetails,
  dailyQuizPending = false,
}: AgentStreakWidgetProps) {
  const orderedMilestones = [...milestones].sort((left, right) => left.milestoneDay - right.milestoneDay);
  const hasMilestones = orderedMilestones.length > 0;
  const progress = calculateStreakProgress(currentStreak, orderedMilestones);
  const nextMilestone = orderedMilestones.find((milestone) => milestone.milestoneDay === progress.nextMilestoneDay) ?? null;
  const rewardText = unclaimedMilestone?.xpReward ?? (unclaimedMilestone?.rewardLabel.match(/\d+/)?.[0] ? Number(unclaimedMilestone.rewardLabel.match(/\d+/)?.[0]) : 0);

  return (
    <section className="mt-4 w-full overflow-hidden rounded-[24px] border-2 border-orange-100 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-md" aria-label="Theo dõi chuỗi bền bỉ động">
      <div className="relative z-10 mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-base font-black tracking-tight text-slate-800 sm:text-lg">
            <Flame size={25} className="shrink-0 fill-orange-500 text-orange-500" aria-hidden="true" />
            CHUỖI BỀN BỈ <span className="text-orange-500">{progress.currentStreak} NGÀY</span>
          </h3>
          <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500 sm:text-sm">
            {!hasMilestones ? <>Đang tải cột mốc Chuỗi Bền Bỉ từ hệ thống…</> : nextMilestone ? <>Chỉ còn <strong className="text-orange-600">{progress.daysLeft} ngày</strong> để chạm mốc <strong className="text-slate-700">{nextMilestone.title}</strong>!</> : <>Bạn đã vượt qua mọi cột mốc hiện tại. Super Admin có thể mở thêm hành trình mới.</>}
          </p>
          {dailyQuizPending && (
            <p className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-2 text-[11px] font-bold leading-4 text-orange-700">
              <span aria-hidden="true">🔥</span>
              <span>Bạn đang có chuỗi {progress.currentStreak} ngày! Hãy hoàn thành Nạp não hôm nay để không bị đứt chuỗi nhé.</span>
            </p>
          )}
        </div>
        <button type="button" onClick={onDetails} className="flex shrink-0 items-center gap-0.5 pt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2" aria-label="Xem chi tiết Chuỗi Bền Bỉ">
          Chi tiết <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      {unclaimedMilestone && (
        <button type="button" disabled={isClaiming} onClick={() => onClaimMilestone?.(unclaimedMilestone)} className="relative z-10 mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:from-orange-500 hover:to-amber-600 disabled:cursor-wait disabled:opacity-60 motion-safe:animate-pulse motion-reduce:animate-none">
          <Gift size={18} aria-hidden="true" /> {isClaiming ? "Đang nhận thưởng…" : `Nhận ${rewardText} XP`}
        </button>
      )}

      {!hasMilestones ? (
        <div className="relative z-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-[12px] font-bold text-slate-500" role="status">Chưa có dữ liệu cột mốc trong phiên hiện tại.</div>
      ) : nextMilestone ? (
        <div className="relative z-10 pt-1">
          <div className="h-4 overflow-hidden rounded-full bg-slate-100 shadow-inner" role="progressbar" aria-label={`Tiến độ tới mốc ${nextMilestone.milestoneDay} ngày`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.progressPercent}>
            <div className="relative h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-[width] duration-1000 motion-reduce:transition-none" style={{ width: `${progress.progressPercent}%` }}>
              <span className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3 text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-[11px]">
            <span>{progress.previousMilestoneDay === 0 ? "Bắt đầu" : `Mốc ${progress.previousMilestoneDay}`}</span>
            <span className="flex items-center gap-1 text-right text-orange-500">
              Mốc {nextMilestone.milestoneDay}
              <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-orange-600">+{nextMilestone.xpReward ?? nextMilestone.rewardLabel} XP</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="relative z-10 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-center text-[12px] font-bold text-orange-700">Chưa có mốc kế tiếp. Hành trình sẽ tiếp tục khi có cột mốc mới được cấu hình.</div>
      )}

      <div className="relative z-10 mt-4 rounded-xl border border-orange-100/50 bg-orange-50/50 px-4 py-2.5 text-center">
        <p className="text-[12px] font-bold italic text-orange-700">“Giữ lửa liên tục là chìa khóa của sự vĩ đại. Cố lên nhé!”</p>
      </div>
    </section>
  );
}
