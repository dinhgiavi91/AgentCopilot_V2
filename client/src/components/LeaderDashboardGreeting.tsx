import React, { useEffect, useState } from "react";
import { Quote } from "lucide-react";

type LeaderGreetingTone = {
  time: string;
  gradient: string;
  iconUrl: string;
  quote: string;
};

const leaderGreetingTones: Record<"morning" | "noon" | "afternoon" | "night", LeaderGreetingTone> = {
  morning: {
    time: "buổi sáng",
    gradient: "from-amber-50 to-orange-100/50",
    iconUrl: "/manus-storage/morning-3d_2b91e70b.png",
    quote: "Một ngày mới để dẫn dắt đội ngũ chinh phục những đỉnh cao mới. Chúc sếp một buổi sáng chiến lược và bứt phá!",
  },
  noon: {
    time: "buổi trưa",
    gradient: "from-cyan-50 to-blue-100/50",
    iconUrl: "/manus-storage/noon-3d_27590f72.png",
    quote: "Người thuyền trưởng vững vàng thì sóng gió cũng hóa êm ru. Sếp nhớ dành chút thời gian ăn trưa và nạp lại năng lượng nhé.",
  },
  afternoon: {
    time: "buổi chiều",
    gradient: "from-orange-50 to-rose-100/50",
    iconUrl: "/manus-storage/afternoon-3d_0720c9df.png",
    quote: "Vài lời động viên, công nhận đúng lúc của sếp lúc này sẽ tiếp thêm ngọn lửa khổng lồ cho cả team đấy. Tiến lên nào!",
  },
  night: {
    time: "buổi tối",
    gradient: "from-indigo-50 to-slate-200/50",
    iconUrl: "/manus-storage/night-3d_e69aa523.png",
    quote: "Dẫn dắt một tập thể chưa bao giờ là điều dễ dàng. Sếp đã vất vả gánh vác hôm nay rồi, gác lại âu lo và nghỉ ngơi thôi!",
  },
};

export function getLeaderGreetingForHour(hour: number): LeaderGreetingTone {
  if (hour >= 5 && hour < 11) return leaderGreetingTones.morning;
  if (hour >= 11 && hour < 14) return leaderGreetingTones.noon;
  if (hour >= 14 && hour < 18) return leaderGreetingTones.afternoon;
  return leaderGreetingTones.night;
}

type LeaderDashboardGreetingProps = {
  userName?: string;
  userAvatar?: string;
  companionName?: string;
};

export default function LeaderDashboardGreeting({
  userName = "Quản Lý",
  userAvatar = "",
  companionName = "Agent Copilot",
}: LeaderDashboardGreetingProps) {
  const [greetingData, setGreetingData] = useState(() => getLeaderGreetingForHour(new Date().getHours()));
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);

  useEffect(() => {
    const refreshGreeting = () => {
      setGreetingData(getLeaderGreetingForHour(new Date().getHours()));
      setIconFailed(false);
    };
    refreshGreeting();
    const intervalId = window.setInterval(refreshGreeting, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const initial = companionName.trim().charAt(0).toUpperCase() || "C";
  const showAvatarImage = Boolean(userAvatar && !avatarFailed);

  return (
    <section
      className={`relative w-full overflow-hidden rounded-[24px] border border-white/40 bg-gradient-to-r ${greetingData.gradient} p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 sm:p-6`}
      aria-label="Lời chào lãnh đạo theo thời gian"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
      <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border-4 border-white bg-[#0B1431] text-xl font-black text-white shadow-sm">
          {showAvatarImage ? (
            <img src={userAvatar} alt={`Người đồng hành ${companionName}`} className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
          ) : (
            <span aria-label={`Avatar dự phòng ${companionName}`}>{initial}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-1.5 flex items-center gap-2">
            {!iconFailed && <div className="flex shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/80 p-2 shadow-sm backdrop-blur-md"><img src={greetingData.iconUrl} alt={`Biểu tượng ${greetingData.time}`} className="h-8 w-8 object-contain" onError={() => setIconFailed(true)} /></div>}
            <h2 className="text-[20px] font-black tracking-tight text-[#0B1431]">
              Chào {greetingData.time}, <span className="text-amber-600">{userName}!</span>
            </h2>
          </div>
          <div className="mt-1 flex w-fit max-w-full items-start gap-2 rounded-2xl rounded-tl-sm border border-white/50 bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
            <Quote size={14} className="mt-0.5 shrink-0 rotate-180 text-amber-500/60" />
            <p className="text-[14px] font-bold italic leading-snug text-slate-700">{greetingData.quote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
