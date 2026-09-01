import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import "../sprint2.css";
import "../sprint3.css";
import "../sprint4.css";
import "../sprint5.css";
import "../sprint6.css";
import "../sprint8.css";
import "../sprint9.css";
import "../sprint10.css";
import "../sprint11.css";
import "../pilot-step2.css";
import logoImg from '../assets/logo.png';
import trophyImg from '../assets/images/trophy.png';
import {
  buildZaloDeepLink,
  calculateTargetPlan,
  shouldShowWelcome,
} from "../lib/sprint4Logic";
import {
  fetchContentLibrary,
  fetchAdvisorProgress,
  fetchXpLedger,
  fetchTeamCommunityFeed,
  fetchWeeklyTeamLeaderboard,
  fetchCurrentTeamGoalDefaults,
  fetchStreakMilestones,
  fetchTodayDailyQuiz,
  claimDailyQuizXp,
  fetchMyStreakMilestoneClaims,
  claimStreakMilestone,
  createTeamCommunityPost,
  toggleTeamCommunityReaction,
  createTeamCommunityComment,
  deleteTeamCommunityPost,
  fetchTeamContests,
  createTeamContest,
  giftTeamXp,
  redeemXpReward,
  fetchMyNotifications,
  markMyNotificationRead,
  subscribeUserNotifications,
  fetchMyRewardRedemptions,
  subscribeMyRewardRedemptions,
  fetchPilotCrmJournals,
  createPilotCrmJournal,
  completeDiscCheckpoint,
  completeLeadershipCheckpoint,
  fetchActiveLeadershipTest,
  hasSupabaseContentConfig,
  submitDiscAssessment,
  submitFeedback,
  persistAdvisorTarget,
  fetchMyPlayerCoachGoal,
  persistPlayerCoachGoal,
  acceptLearningChallenge,
  completeLearningChallengeProof,
  fetchMyActiveLearningChallenge,
  getCurrentPilotSession,
  logPilotActivity,
  recordPilotActivityEvent,
  subscribePilotAuth,
  subscribeXpLedgerNotifications,
  claimRecognition,
  createTeamRecognition,
  fetchLatestPendingRecognition,
  subscribeIncomingRecognitions,
  fetchMyCoachingAdvisors,
  logMyCoachingApplication,
  type OperationalLibrary,
  type DiscProfileType,
  type XpLedgerEntry,
  type PilotSession,
  type TeamCommunityPost,
  type WeeklyLeaderboardEntry,
  type TeamContestRecord,
  type PilotCrmJournalRecord,
  type UserNotification,
  type MyRewardRedemption,
  type RecognitionRecord,
  type StreakMilestone,
  type StreakMilestoneClaim,
  type TeamGoalDefaults,
  type PlayerCoachGoal,
  type ActiveLearningChallenge,
  type LeadershipTest,
  type LeadershipTrait,
  type LeadershipPrinciple,
  type CoachingAdvisor,
  type PlaybookCard,
} from "../lib/supabaseContent";
import { useXpReward } from "../contexts/XpRewardContext";
import {
  calculateDiscResult,
  calculateDiscScores,
  resolveSprint6Route,
  sumXp,
  validateZeroPiiFeedback,
  type DiscResultType,
  type DiscType,
} from "../lib/sprint6Logic";
import { calculateLeadershipTraitResult, getLeadershipPracticePlaybookCode } from "../lib/leadershipTestLogic";
import {
  calculateFlexibleTarget,
  rankProfiles,
  validateJournalEntry,
  type AdvisorRank,
} from "../lib/sprint9Logic";
import { calculateIncomeMeetingPlan } from "../lib/sprint10Logic";
import {
  getMarketingCardsForAudience,
  productIntroductionPoster,
} from "../lib/marketingSegmentation";
import { JournalFields } from "../components/Sprint9Modules";
import { TeamCommunityHub, TeamContestPanel } from "../components/PilotStep4SocialModules";
import { Sprint11CrmHub } from "../components/Sprint11CrmModules";
import { PilotStep4FeedbackModule } from "../components/PilotStep4FeedbackModule";
import { AdvisorQuickGuide, GlobalGiftXpModal, SuperAdminBusinessPanel } from "../components/PilotStep5BusinessModules";
import { UserManagementCMS } from "../components/UserManagementCMS";
import { MarketingManager } from "../components/MarketingManager";
import { BaoBoiPage } from "../components/BaoBoiPage";
import { AIRoleplayStudio } from "../components/BaoBoiStudio";
import { InPlaceContentAdmin } from "../components/InPlaceContentAdmin";
import { AdminFeedbackInbox } from "../components/AdminFeedbackInbox";
import { CapabilityQuestCard, getCapabilityQuest } from "../components/CapabilityQuestCard";
import { TroLyThamDinh } from "../components/TroLyThamDinh";
import { MarketingStudio } from "../components/Sprint10VideoModules";
import {
  Sprint11TargetModal,
  type Sprint11TargetSave,
} from "../components/Sprint11TargetModal";
import { Sprint11LeaderCompass } from "../components/Sprint11LeaderModules";
import { O2OLeaderRewards } from "../components/O2OLeaderRewards";
import { MomentShareScreen } from "../components/MomentShareScreen";
import { resolveRewardMomentAsset } from "../components/agentMomentAssets";
import { AgentProfileSettings, CORE_CAST_AVATARS, type AgentProfilePreference } from "../components/AgentProfileSettings";
import { AdminHomeDashboard } from "../components/AdminHomeDashboard";
import AgentDashboardGreeting from "../components/AgentDashboardGreeting";
import AgentStreakDetailsModal from "../components/AgentStreakDetailsModal";
import AgentStreakWidget from "../components/AgentStreakWidget";
import AgentMomentCelebrationModal from "../components/AgentMomentCelebrationModal";
import AgentMirrorModal from "../components/AgentMirrorModal";
import FloatingGamificationDock from "../components/FloatingGamificationDock";
import LeaderCommandCenter from "../components/LeaderCommandCenter";
import { LeadershipMatrixRadar } from "../components/LeadershipMatrixRadar";
import { DirectorHybridRadar } from "../components/DirectorHybridRadar";
import { HeartbeatHierarchyPanel } from "../components/HeartbeatHierarchyPanel";
import { LeaderMomentCreator } from "../components/LeaderMomentCreator";
import {
  FounderPilotOverview,
  PilotAdvisorDailyStart,
  PilotAuthControl,
} from "../components/PilotStep2Modules";
import {
  calculateAdvisorTargetPlan,
  getDailyMotivation,
  type TargetRole,
} from "../lib/sprint11Logic";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleUserRound,
  ClipboardCheck,
  Compass,
  Copy,
  Download,
  Edit3,
  Flame,
  Gift,
  HandHeart,
  HeartHandshake,
  Home as HomeIcon,
  ImageIcon,
  Landmark,
  Lightbulb,
  LockKeyhole,
  type LucideIcon,
  Menu,
  MessageCircle,
  Newspaper,
  PenLine,
  Plus,
  Radar,
  RotateCcw,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";

type View =
  | "profile"
  | "playbook"
  | "radar"
  | "marketing"
  | "empathy"
  | "leader"
  | "disc"
  | "cover"
  | "news"
  | "feedback"
  | "community"
  | "customer_journal"
  | "heartbeat"
  | "founder";
type UserRole = "FREE" | "PRO";

const OFFICIAL_LOGO = logoImg;

type SidebarNavRole = "superadmin" | "director" | "leader" | "advisor";

const SECONDARY_NAV: {
  id: View;
  label: string;
  icon: LucideIcon;
  open: "view" | "news" | "case" | "leader";
  roles?: SidebarNavRole[];
}[] = [
  { id: "customer_journal", label: "Nhật Ký Khách Hàng", icon: CalendarClock, open: "view" },
  { id: "disc", label: "Trạm Đăng Kiểm", icon: ClipboardCheck, open: "view" },
  { id: "cover", label: "Trợ Lý Thẩm Định", icon: PenLine, open: "view" },
  { id: "news", label: "Bản Tin 90s", icon: Newspaper, open: "news" },
  { id: "news", label: "Case Study Thực Chiến", icon: Landmark, open: "case" },
  { id: "feedback", label: "Góc Lắng Nghe", icon: HeartHandshake, open: "view" },
  { id: "empathy", label: "Ngôn Ngữ Thấu Cảm", icon: MessageCircle, open: "view" },
  { id: "leader", label: "La Bàn Lãnh Đạo", icon: Compass, open: "leader", roles: ["superadmin", "director", "leader"] },
  { id: "marketing", label: "Marketing 1-Chạm", icon: Send, open: "view" },
];

function matchesSidebarRole(role: string | undefined, roles?: SidebarNavRole[]) {
  if (!roles?.length) return true;
  const key = role === "super_admin" ? "superadmin" : role;
  return Boolean(key && roles.includes(key as SidebarNavRole));
}
const money = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const emptyLibrary: OperationalLibrary = {
  playbooks: [],
  empathy: [],
  leadership: [],
  marketing: [],
  discQuestions: [],
  discProfiles: [],
  serviceLevels: [],
  xpRewards: [],
  dailyQuizzes: [],
  coverLetters: [],
  news: [],
  readErrors: {},
};

function arePilotSessionsEquivalent(current: PilotSession | null, next: PilotSession | null) {
  if (current === next) return true;
  if (!current || !next) return false;
  const currentProfile = current.profile;
  const nextProfile = next.profile;
  return current.userId === next.userId
    && currentProfile.id === nextProfile.id
    && currentProfile.email === nextProfile.email
    && currentProfile.display_name === nextProfile.display_name
    && currentProfile.role === nextProfile.role
    && currentProfile.primary_team_id === nextProfile.primary_team_id
    && currentProfile.is_active === nextProfile.is_active
    && currentProfile.xp_balance === nextProfile.xp_balance
    && currentProfile.onboarding_completed_at === nextProfile.onboarding_completed_at
    && currentProfile.disc_result === nextProfile.disc_result
    && currentProfile.leadership_style === nextProfile.leadership_style
    && currentProfile.leadership_style_description === nextProfile.leadership_style_description
    && currentProfile.created_at === nextProfile.created_at;
}

const viewNames: Record<View, string> = {
  profile: "Hồ Sơ",
  playbook: "Bảo Bối",
  radar: "Radar",
  marketing: "Marketing",
  empathy: "Thấu cảm",
  leader: "La Bàn",
  disc: "DISC",
  cover: "Thẩm Định",
  news: "Bản Tin",
  feedback: "Lắng Nghe",
  community: "Cộng Đồng",
  customer_journal: "Nhật Ký KH",
  heartbeat: "Nhịp Đập",
  founder: "Pilot Overview",
};

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img src={OFFICIAL_LOGO} className={className} alt="Agent Copilot BHNT" />
  );
}

function DailyMotivationWidget({ teamName }: { teamName: string }) {
  const day = useMemo(
    () => new Date().getDate() + new Date().getMonth() * 31,
    []
  );
  return (
    <div className="daily-motivation-widget">
      <span>NHỊP ĐỘNG LỰC</span>
      <strong>{getDailyMotivation(teamName, day)}</strong>
    </div>
  );
}

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const duration = 680;
    const start = display;
    let frame = 0;
    const animate = (now: number) => {
      const p = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(start + (value - start) * eased));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <span>
      {money.format(display)}
      {suffix}
    </span>
  );
}

function ContentState({
  loading,
  error,
  empty,
  label,
  onRetry,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  label: string;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <div className="content-state is-loading">
        <Sparkles size={18} />
        <span>Đang đồng bộ {label} từ Supabase…</span>
      </div>
    );
  if (error)
    return (
      <div className="content-state is-error">
        <AlertTriangle size={18} />
        <div>
          <strong>Kho dữ liệu chưa sẵn sàng.</strong>
          <span>{error}</span>
          {onRetry && <button type="button" onClick={onRetry} className="mt-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:border-amber-400 hover:text-amber-800">Thử đồng bộ lại</button>}
        </div>
      </div>
    );
  if (empty)
    return (
      <div className="content-state">
        <BookOpen size={18} />
        <span>Chưa có dữ liệu {label}.</span>
      </div>
    );
  return null;
}

function CaseStudyVideo({ title, videoUrl }: { title: string; videoUrl: string | null | undefined }) {
  const youtubeMatch = videoUrl?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  if (!videoUrl) {
    return <div className="mt-4 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 text-slate-500" aria-label={`Chưa có video cho ${title}`}><div className="text-center"><Video className="mx-auto mb-2 text-indigo-400" size={25} /><span className="text-xs font-bold">Video tình huống sẽ được cập nhật</span></div></div>;
  }
  if (youtubeMatch) {
    return <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`} title={`Video: ${title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
  }
  return <video className="mt-4 aspect-video w-full rounded-2xl border border-slate-200 bg-slate-950 object-contain" controls preload="metadata" aria-label={`Video: ${title}`}><source src={videoUrl} />Trình duyệt này chưa hỗ trợ phát video. <a href={videoUrl} target="_blank" rel="noreferrer">Mở video trong tab mới</a>.</video>;
}

function Confetti() {
  return (
    <span className="confetti-field" aria-hidden="true">
      {Array.from({ length: 24 }, (_, index) => (
        <i key={index} style={{ "--i": index } as React.CSSProperties} />
      ))}
    </span>
  );
}

export default function Home() {
  const { award: awardXp } = useXpReward();
  const demoPreset =
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("demo") ?? "");
  const [navOpen, setNavOpen] = useState(false);
  const [teamName, setTeamName] = useState(() =>
    typeof window === "undefined"
      ? "Agent Copilot"
      : localStorage.getItem("agent-copilot-team-name") || "Agent Copilot"
  );
  const [motivationMount, setMotivationMount] = useState<HTMLElement | null>(
    null
  );
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "profile";
    return resolveSprint6Route(window.location.hash);
  });
  const [content, setContent] = useState<OperationalLibrary>(emptyLibrary);
  const [loading, setLoading] = useState(hasSupabaseContentConfig);
  const [contentError, setContentError] = useState(
    hasSupabaseContentConfig ? "" : "Thiếu Supabase URL hoặc Anon Key."
  );
  const [pilotSession, setPilotSession] = useState<PilotSession | null>(null);
  const [pilotAuthError, setPilotAuthError] = useState("");
  const [pilotSessionHydrating, setPilotSessionHydrating] = useState(hasSupabaseContentConfig);
  const [agentProfileSettingsOpen, setAgentProfileSettingsOpen] = useState(false);
  const [streakDetailsOpen, setStreakDetailsOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState<AgentProfilePreference>(() => ({
    displayName: "",
    avatarId: "navigator",
    avatarUrl: CORE_CAST_AVATARS[0].url,
  }));
  const [streakMilestones, setStreakMilestones] = useState<StreakMilestone[]>([]);
  const [streakClaims, setStreakClaims] = useState<StreakMilestoneClaim[]>([]);
  const [claimingStreakMilestoneId, setClaimingStreakMilestoneId] = useState<string | null>(null);
  const [teamGoalDefaults, setTeamGoalDefaults] = useState<TeamGoalDefaults | null>(null);
  const [targetIncome, setTargetIncome] = useState(0);
  const [targetDraft, setTargetDraft] = useState("");
  const [targetBhnt, setTargetBhnt] = useState(0);
  const [targetPnt, setTargetPnt] = useState(0);
  const [targetBhntDraft, setTargetBhntDraft] = useState("");
  const [targetPntDraft, setTargetPntDraft] = useState("");
  const [commissionRate, setCommissionRate] = useState(40);
  const [commissionRateDraft, setCommissionRateDraft] = useState("40");
  const [contractSize, setContractSize] = useState(25_000_000);
  const [contractSizeDraft, setContractSizeDraft] = useState("25");
  const [advisorRank, setAdvisorRank] = useState<AdvisorRank>("newbie");
  const [targetOpen, setTargetOpen] = useState(
    () => demoPreset === "target-advisor" || demoPreset === "target-leader"
  );
  const [sprint11TargetRole, setSprint11TargetRole] = useState<TargetRole>(
    () => (demoPreset === "target-leader" ? "leader" : "advisor")
  );
  const [pntCommission, setPntCommission] = useState(15);
  const [pntContractSize, setPntContractSize] = useState(8_000_000);
  const [playerCoachGoal, setPlayerCoachGoal] = useState<PlayerCoachGoal>({ personalIncome: 0, recruitmentOutreach: 0, activeRatePercent: 0, coachingSessions: 0, xpBudget: 0, teamStreak7dMembers: 0 });
  const [activeLearningChallenge, setActiveLearningChallenge] = useState<ActiveLearningChallenge | null>(null);
  const [openKnowledge, setOpenKnowledge] = useState<string | null>(null);
  const [leaderContentTab, setLeaderContentTab] = useState<"principle" | "coaching_script">("principle");
  const [leaderSituationFilter, setLeaderSituationFilter] = useState("all");
  const [coachingLogPlaybook, setCoachingLogPlaybook] = useState<LeadershipPrinciple | null>(null);
  const [leaderRoleplayScript, setLeaderRoleplayScript] = useState<LeadershipPrinciple | null>(null);
  const [coachingAdvisors, setCoachingAdvisors] = useState<CoachingAdvisor[]>([]);
  const [coachingAdvisorsLoading, setCoachingAdvisorsLoading] = useState(false);
  const [coachingAdvisorId, setCoachingAdvisorId] = useState("");
  const [coachingNote, setCoachingNote] = useState("");
  const [coachingLogSaving, setCoachingLogSaving] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      !demoPreset.startsWith("target-") &&
      shouldShowWelcome(
        window.location.hash,
        Boolean(sessionStorage.getItem("agent-copilot-welcome-seen"))
      )
  );
  const [discOpen, setDiscOpen] = useState(false);
  const [discAnswers, setDiscAnswers] = useState<Record<string, DiscType>>({});
  const [discBadge, setDiscBadge] = useState<DiscResultType | null>(null);
  const [discStep, setDiscStep] = useState(0);
  const [discResult, setDiscResult] = useState<DiscResultType | null>(null);
  const [leadershipTest, setLeadershipTest] = useState<LeadershipTest | null>(null);
  const [leadershipTestLoading, setLeadershipTestLoading] = useState(false);
  const [leadershipTestError, setLeadershipTestError] = useState("");
  const [leadershipIntroOpen, setLeadershipIntroOpen] = useState(false);
  const [leadershipAnswers, setLeadershipAnswers] = useState<Record<number, LeadershipTrait>>({});
  const [leadershipStep, setLeadershipStep] = useState(0);
  const [leadershipResult, setLeadershipResult] = useState<LeadershipTrait | null>(null);
  const [leadershipSaving, setLeadershipSaving] = useState(false);
  const [leadershipLearningRequest, setLeadershipLearningRequest] = useState<{ playbookCode: string; openRoleplay: boolean } | null>(null);
  const [dailyPushOpen, setDailyPushOpen] = useState(false);
  const [lastQuizDate, setLastQuizDate] = useState<string | null>(null);
  const [xpOpen, setXpOpen] = useState(false);
  const [xpStoreOpen, setXpStoreOpen] = useState(false);
  const [xpEntries, setXpEntries] = useState<XpLedgerEntry[]>([]);
  const [xpLoading, setXpLoading] = useState(false);
  const [redeemingRewardCode, setRedeemingRewardCode] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [rewardStoreTab, setRewardStoreTab] = useState<"catalog" | "mine">("catalog");
  const [rewardRedemptionsLoading, setRewardRedemptionsLoading] = useState(false);
  const [rewardRedemptions, setRewardRedemptions] = useState<MyRewardRedemption[]>([]);
  const [voucherRedemption, setVoucherRedemption] = useState<MyRewardRedemption | null>(null);
  const [rewardShareMode, setRewardShareMode] = useState<"team" | "leader" | "hidden">("team");
  const [leaderMomentCreatorOpen, setLeaderMomentCreatorOpen] = useState(false);
  const [agentMirrorOpen, setAgentMirrorOpen] = useState(false);
  const [leaderMomentAgentName, setLeaderMomentAgentName] = useState("");
  const [leaderMomentRecipientId, setLeaderMomentRecipientId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [incomingRecognition, setIncomingRecognition] = useState<RecognitionRecord | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [logSaving, setLogSaving] = useState(false);
  const [logLevel, setLogLevel] = useState(3);
  const [serviceLevelPreview, setServiceLevelPreview] = useState(3);
  const [logAction, setLogAction] = useState<
    "Ký Hợp Đồng" | "Dời lịch" | "Từ chối" | "Đã gặp & Đang bám sát"
  >("Dời lịch");
  const [logCustomerJourney, setLogCustomerJourney] = useState<
    "pre_sale" | "post_sale"
  >("pre_sale");
  const [followUp, setFollowUp] = useState("");
  const [revenue, setRevenue] = useState("");
  const [journalStory, setJournalStory] = useState("");
  const [journalPublic, setJournalPublic] = useState(false);
  const [logUsesLearningChallenge, setLogUsesLearningChallenge] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackFeature, setFeedbackFeature] = useState("");
  const [feedbackSuggestion, setFeedbackSuggestion] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [newsSection, setNewsSection] = useState<"all" | "news" | "case">(() =>
    demoPreset === "case" ? "case" : "all"
  );
  const [marketingAudience, setMarketingAudience] = useState<
    "advisor" | "leader"
  >(() => (demoPreset === "marketing-leader" ? "leader" : "advisor"));
  const [marketingViewMode, setMarketingViewMode] = useState<"studio" | "manager">("studio");
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizClaimed, setQuizClaimed] = useState(false);
  const [quizStreak, setQuizStreak] = useState<number | null>(null);
  const [advisorProgress, setAdvisorProgress] = useState<{
    total_xp: number;
    current_streak: number;
    coin_balance: number;
    completed_quiz_today: boolean;
  } | null>(null);
  const [managerMode, setManagerMode] = useState(
    () =>
      demoPreset === "leader" ||
      demoPreset === "target-leader" ||
      demoPreset === "leader-report"
  );
  const [communityPosts, setCommunityPosts] = useState<TeamCommunityPost[]>([]);
  const [communityLeaderboard, setCommunityLeaderboard] = useState<WeeklyLeaderboardEntry[]>([]);
  const [teamContests, setTeamContests] = useState<TeamContestRecord[]>([]);
  const [crmRecords, setCrmRecords] = useState<PilotCrmJournalRecord[]>([]);
  const [gratitudeOpen, setGratitudeOpen] = useState(
    () => demoPreset === "gratitude"
  );
  const [gratitudeRecipient, setGratitudeRecipient] = useState("Thu Hà");
  const [gratitudeRecipientId, setGratitudeRecipientId] = useState<string | null>(null);
  const [gratitudePostId, setGratitudePostId] = useState<string | null>(null);
  const [gratitudeNote, setGratitudeNote] = useState("");
  const pilotManager =
    pilotSession?.profile.role === "leader" ||
    pilotSession?.profile.role === "super_admin";
  const usesLeadershipCheckpoint = pilotManager;
  const requiresLeadershipOnboarding = pilotSession?.profile.role === "leader" && !pilotSession.profile.leadership_style;
  const agentDisplayName = agentProfile.displayName.trim() || pilotSession?.profile.display_name || "ĐINH VĨ";
  const userRole: UserRole = managerMode || pilotManager ? "PRO" : "FREE";
  const canAccessLeaderPlaybook = pilotSession?.profile.role === "leader"
    || pilotSession?.profile.role === "director"
    || pilotSession?.profile.role === "super_admin";
  const leaderPlaybookLocked = !canAccessLeaderPlaybook;
  const earnedIncome = 0;
  const baselinePlan = calculateTargetPlan(
    Math.max(targetIncome, 1),
    earnedIncome
  );
  const xpTotal = advisorProgress?.total_xp ?? sumXp(xpEntries);
  const capabilityQuest = useMemo(() => getCapabilityQuest(content.playbooks), [content.playbooks]);
  const advisorCoins = advisorProgress?.coin_balance ?? xpTotal;
  const ledgerTotal = pilotSession?.profile.role === "leader" ? Number(pilotSession.profile.xp_balance) : xpTotal;
  const flexibleTarget = calculateFlexibleTarget(
    targetBhnt,
    targetPnt,
    advisorRank
  );
  const incomeMeetingPlan = calculateIncomeMeetingPlan({
    targetIncome,
    commissionRatePercent: commissionRate,
    averageContractSize: contractSize,
  });
  const requiredMeetings =
    incomeMeetingPlan.requiredMeetings ||
    flexibleTarget.requiredMeetings ||
    baselinePlan.requiredMeetings;
  const finishedMeetings = baselinePlan.finishedMeetings;
  const progress = baselinePlan.progress;
  const meetingProgress = requiredMeetings
    ? Math.min(100, Math.round((finishedMeetings / requiredMeetings) * 100))
    : 0;
  const currentDiscQuestion = content.discQuestions[discStep];
  const currentLeadershipQuestion = leadershipTest?.questions[leadershipStep];
  const savedLeadershipStyle = pilotSession?.profile.leadership_style ?? leadershipResult;
  const savedLeadershipDescription = savedLeadershipStyle ? leadershipTest?.results[savedLeadershipStyle]?.description ?? pilotSession?.profile.leadership_style_description ?? "" : "";
  const currentServiceLevel = content.serviceLevels.find(
    item => item.level === serviceLevelPreview
  );
  const dailyQuiz = content.dailyQuizzes[0];
  const todayDateKey = new Date().toISOString().slice(0, 10);
  const quizPlayer = pilotSession?.profile.role === "advisor" || pilotSession?.profile.role === "leader";
  const completedQuizToday = lastQuizDate === todayDateKey || Boolean(advisorProgress?.completed_quiz_today);
  const dailyQuizNeedsCompletion = Boolean(quizPlayer && dailyQuiz && !completedQuizToday);
  const shouldShowQuiz = Boolean(
    quizPlayer
      && dailyQuiz
      && advisorProgress
      && !completedQuizToday
      && !discOpen
      && !welcomeOpen
      && !requiresLeadershipOnboarding
  );
  const insight = useMemo(
    () =>
      targetIncome
        ? `${incomeMeetingPlan.requiredContracts || "—"} HĐ dự kiến · ${requiredMeetings} cuộc gặp theo thu nhập, hoa hồng và size HĐ`
        : "Hãy đặt mục tiêu thu nhập để Copilot tính ngược phễu hành động.",
    [targetIncome, incomeMeetingPlan.requiredContracts, requiredMeetings]
  );

  const loadRootContent = React.useCallback(async () => fetchContentLibrary(), []);
  const refreshInPlaceContent = React.useCallback(async () => {
    if (!hasSupabaseContentConfig) return;
    const library = await loadRootContent();
    setContent(library);
  }, [loadRootContent]);
  const retryContentLibrary = React.useCallback(async () => {
    if (!hasSupabaseContentConfig) return;
    setLoading(true);
    setContentError("");
    try {
      const library = await loadRootContent();
      setContent(library);
      setOpenKnowledge(library.empathy[0]?.code ?? library.leadership[0]?.code ?? null);
    } catch {
      setContentError("Không thể đọc dữ liệu Supabase. Hãy kiểm tra kết nối rồi thử lại.");
    } finally {
      setLoading(false);
    }
  }, [loadRootContent]);
  const contentSourceError = React.useCallback((source: keyof OperationalLibrary["readErrors"]) => content.readErrors?.[source] ? "Nguồn dữ liệu này đang tạm thời chưa phản hồi. Các tab khác vẫn hoạt động bình thường." : contentError, [content.readErrors, contentError]);

  useEffect(() => {
    if (!hasSupabaseContentConfig) return;
    let active = true;
    loadRootContent()
      .then(library => {
        if (!active) return;
        setContent(library);
        setOpenKnowledge(
          library.empathy[0]?.code ?? library.leadership[0]?.code ?? null
        );
      })
      .catch(
        (error: unknown) =>
          active &&
          setContentError(
            error instanceof Error
              ? error.message
              : "Không thể đọc dữ liệu Supabase."
          )
      )
      .finally(() => active && setLoading(false));
    fetchXpLedger()
      .then(entries => active && setXpEntries(entries))
      .catch(() => undefined);
    fetchAdvisorProgress()
      .then(progress => {
        if (!active || !progress) return;
        setAdvisorProgress(progress);
        setQuizDone(progress.completed_quiz_today);
        setQuizClaimed(progress.completed_quiz_today);
        setQuizStreak(progress.current_streak);
        setLastQuizDate(progress.completed_quiz_today ? new Date().toISOString().slice(0, 10) : null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pilotSession?.userId]);

  useEffect(() => {
    if (!hasSupabaseContentConfig) return;
    let active = true;
    const applySession = (session: PilotSession | null, error?: Error) => {
      if (!active) return;
      setPilotSession((current) => arePilotSessionsEquivalent(current, session) ? current : session);
      setPilotAuthError(error?.message ?? "");
      setPilotSessionHydrating(false);
    };
    getCurrentPilotSession()
      .then(session => applySession(session))
      .catch((error: unknown) => applySession(null, error instanceof Error ? error : new Error("Không thể kiểm tra quyền Pilot.")));
    const unsubscribe = subscribePilotAuth(applySession);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!usesLeadershipCheckpoint) return;
    let active = true;
    setLeadershipTestLoading(true);
    setLeadershipTestError("");
    fetchActiveLeadershipTest()
      .then((test) => {
        if (!active) return;
        setLeadershipTest(test);
        if (!test) setLeadershipTestError("Chưa có Leadership Test đang hoạt động.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLeadershipTestError(error instanceof Error ? error.message : "Không thể tải Leadership Test.");
      })
      .finally(() => active && setLeadershipTestLoading(false));
    return () => {
      active = false;
    };
  }, [usesLeadershipCheckpoint]);

  useEffect(() => {
    if (!requiresLeadershipOnboarding || leadershipTestLoading || !leadershipTest) return;
    setWelcomeOpen(false);
    setDailyPushOpen(false);
    setLeadershipAnswers({});
    setLeadershipStep(0);
    setLeadershipResult(null);
    setLeadershipIntroOpen(true);
    setDiscOpen(true);
  }, [leadershipTest, leadershipTestLoading, requiresLeadershipOnboarding]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `agent-copilot-profile-preferences-${pilotSession?.userId ?? "guest"}`;
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) {
        setAgentProfile({ displayName: "", avatarId: "navigator", avatarUrl: CORE_CAST_AVATARS[0].url });
        return;
      }
      const parsed = JSON.parse(stored) as Partial<AgentProfilePreference>;
      const validCoreCast = CORE_CAST_AVATARS.some((avatar) => avatar.id === parsed.avatarId);
      if (typeof parsed.displayName !== "string" || typeof parsed.avatarUrl !== "string" || (!validCoreCast && parsed.avatarId !== "custom")) throw new Error("Invalid profile preference");
      setAgentProfile({ displayName: parsed.displayName, avatarId: parsed.avatarId as AgentProfilePreference["avatarId"], avatarUrl: parsed.avatarUrl });
    } catch {
      window.localStorage.removeItem(key);
      setAgentProfile({ displayName: "", avatarId: "navigator", avatarUrl: CORE_CAST_AVATARS[0].url });
    }
  }, [pilotSession?.userId]);

  useEffect(() => {
    if (!pilotSession) {
      setCommunityPosts([]);
      setCommunityLeaderboard([]);
      setTeamContests([]);
      setCrmRecords([]);
      return;
    }
    let active = true;
    Promise.all([fetchTeamCommunityFeed(), fetchWeeklyTeamLeaderboard(), fetchTeamContests(), fetchPilotCrmJournals()])
      .then(([posts, leaderboard, contests, journals]) => {
        if (!active) return;
        setCommunityPosts(posts);
        setCommunityLeaderboard(leaderboard);
        setTeamContests(contests);
        setCrmRecords(journals);
      })
      .catch(() => {
        if (!active) return;
        setCommunityPosts([]);
        setCommunityLeaderboard([]);
        setTeamContests([]);
        setCrmRecords([]);
      });
    return () => { active = false; };
  }, [pilotSession?.userId, pilotSession?.profile.primary_team_id]);

  useEffect(() => {
    if (!pilotSession || typeof window === "undefined") return;
    const nextView: View = "profile";
    setView(nextView);
    window.history.replaceState(
      null,
      "",
      nextView === "profile" ? window.location.pathname : `#${nextView}`
    );
  }, [pilotSession?.profile.role]);

  useEffect(() => {
    if (!pilotSession) {
      setStreakMilestones([]);
      setStreakClaims([]);
      setTeamGoalDefaults(null);
      return;
    }
    let active = true;
    Promise.all([fetchStreakMilestones(), fetchCurrentTeamGoalDefaults(), fetchMyStreakMilestoneClaims()])
      .then(([milestones, defaults, claims]) => {
        if (!active) return;
        setStreakMilestones(milestones);
        setTeamGoalDefaults(defaults);
        setStreakClaims(claims);
      })
      .catch(() => {
        if (!active) return;
        setStreakMilestones([]);
        setStreakClaims([]);
        setTeamGoalDefaults(null);
      });
    return () => { active = false; };
  }, [pilotSession?.userId, pilotSession?.profile.primary_team_id]);

  useEffect(() => {
    const role = pilotSession?.profile.role;
    if (!pilotSession || (role !== "leader" && role !== "director")) {
      setPlayerCoachGoal({ personalIncome: 0, recruitmentOutreach: 0, activeRatePercent: 0, coachingSessions: 0, xpBudget: 0, teamStreak7dMembers: 0 });
      return;
    }
    let active = true;
    void fetchMyPlayerCoachGoal().then((goal) => {
      if (!active) return;
      setPlayerCoachGoal(goal);
      setTargetIncome(goal.personalIncome);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [pilotSession?.userId, pilotSession?.profile.role]);

  useEffect(() => {
    if (!pilotSession || pilotSession.profile.role !== "advisor") {
      setActiveLearningChallenge(null);
      return;
    }
    let active = true;
    void fetchMyActiveLearningChallenge()
      .then((challenge) => active && setActiveLearningChallenge(challenge))
      .catch(() => active && setActiveLearningChallenge(null));
    return () => { active = false; };
  }, [pilotSession?.userId, pilotSession?.profile.role]);

  useEffect(() => {
    if (!pilotSession) return;
    let active = true;
    void fetchTodayDailyQuiz()
      .then((quiz) => active && setContent((current) => ({ ...current, dailyQuizzes: quiz ? [quiz] : [] })))
      .catch(() => undefined);
    return () => { active = false; };
  }, [pilotSession?.userId]);

  useEffect(() => {
    if (pilotSession?.profile.role !== "advisor") {
      setDiscOpen(false);
      return;
    }
    const storedResult = pilotSession.profile.disc_result as DiscResultType | null;
    if (storedResult) {
      setDiscBadge(storedResult);
      setDiscResult(storedResult);
      setDiscOpen(false);
      return;
    }
    if (content.discQuestions.length) setDiscOpen(true);
  }, [content.discQuestions.length, pilotSession?.profile.disc_result, pilotSession?.profile.role, pilotSession?.userId]);

  useEffect(() => {
    if (!shouldShowQuiz) {
      setDailyPushOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setDailyPushOpen(true), 4000);
    return () => window.clearTimeout(timer);
  }, [shouldShowQuiz]);

  const currentStreakDays = quizStreak ?? advisorProgress?.current_streak ?? 0;
  const unclaimedStreakMilestone = streakMilestones
    .filter((milestone) => milestone.milestoneDay <= currentStreakDays && !streakClaims.some((claim) => claim.milestoneId === milestone.id))
    .sort((left, right) => left.milestoneDay - right.milestoneDay)[0] ?? null;

  const handleClaimStreakMilestone = async (milestone: StreakMilestone) => {
    if (!milestone.id) return;
    setClaimingStreakMilestoneId(milestone.id);
    try {
      const result = await claimStreakMilestone(milestone.id);
      if (result.claimed) {
        setStreakClaims((current) => [{ milestoneId: milestone.id, xpAwarded: result.xpAmount, claimedAt: new Date().toISOString() }, ...current]);
        setAdvisorProgress((current) => current ? { ...current, total_xp: result.totalXp, current_streak: result.currentStreak } : current);
        setQuizStreak(result.currentStreak);
        setXpEntries(await fetchXpLedger());
        toast.success(`Đã nhận +${result.xpAmount} XP cho mốc ${milestone.milestoneDay} ngày!`);
      } else {
        setStreakClaims((current) => current.some((claim) => claim.milestoneId === milestone.id) ? current : [{ milestoneId: milestone.id, xpAwarded: 0, claimedAt: new Date().toISOString() }, ...current]);
        toast.message("Cột mốc này đã được nhận thưởng trước đó.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể nhận thưởng Chuỗi Bền Bỉ.");
    } finally {
      setClaimingStreakMilestoneId(null);
    }
  };

  useEffect(() => {
    setMotivationMount(document.querySelector(".income-shield"));
  }, [view]);

  useEffect(() => {
    if (!discOpen) return;
    setDiscAnswers({});
    setDiscStep(0);
    setDiscResult(null);
  }, [discOpen]);

  const refreshNotifications = async () => {
    if (!pilotSession) return;
    setNotificationLoading(true);
    try {
      setNotifications(await fetchMyNotifications());
    } finally {
      setNotificationLoading(false);
    }
  };
  const refreshRewardRedemptions = async () => {
    if (!pilotSession) return;
    setRewardRedemptionsLoading(true);
    try {
      setRewardRedemptions(await fetchMyRewardRedemptions());
    } finally {
      setRewardRedemptionsLoading(false);
    }
  };
  const refreshXpState = async () => {
    const [ledger, progress, refreshedSession] = await Promise.all([fetchXpLedger(), fetchAdvisorProgress(), getCurrentPilotSession()]);
    setXpEntries(ledger);
    if (progress) setAdvisorProgress(progress);
    if (refreshedSession) setPilotSession((current) => arePilotSessionsEquivalent(current, refreshedSession) ? current : refreshedSession);
  };
  useEffect(() => {
    if (!pilotSession) return;
    return subscribeXpLedgerNotifications(pilotSession.userId, (entry) => {
      const reason = entry.description?.trim() || entry.reason.replaceAll("_", " ");
      toast.success(entry.isGift ? `🎉 Bạn vừa được tặng ${entry.xpAmount} XP từ đồng đội! ${reason}` : entry.xpAmount >= 0 ? `+${entry.xpAmount} XP · ${reason}` : `${entry.xpAmount} XP · ${reason}`);
      void refreshXpState().catch(() => undefined);
    });
  }, [pilotSession?.userId]);
  useEffect(() => {
    if (!pilotSession || pilotSession.profile.role !== "advisor") {
      setIncomingRecognition(null);
      setShowCelebration(false);
      return;
    }
    let active = true;
    const openRecognition = (recognition: RecognitionRecord, announce = false) => {
      if (!active) return;
      setIncomingRecognition((current) => (current?.id === recognition.id ? current : recognition));
      setShowCelebration(true);
      if (announce) toast.success("Ting Ting! Bạn vừa nhận một Thẻ Vinh Danh từ Leader.");
    };
    const unsubscribe = subscribeIncomingRecognitions(pilotSession.userId, (recognition) => openRecognition(recognition, true));
    void fetchLatestPendingRecognition(pilotSession.userId)
      .then((recognition) => recognition && openRecognition(recognition))
      .catch(() => undefined);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [pilotSession?.profile.role, pilotSession?.userId]);
  useEffect(() => {
    if (!pilotSession) {
      setNotifications([]);
      setRewardRedemptions([]);
      return;
    }
    let active = true;
    void refreshNotifications().catch(() => active && setNotifications([]));
    void refreshRewardRedemptions().catch(() => active && setRewardRedemptions([]));
    const unsubscribe = subscribeUserNotifications(pilotSession.userId, (notification) => {
      if (!active) return;
      setNotifications((current) => {
        const existing = current.find((item) => item.id === notification.id);
        if (existing
          && existing.eventType === notification.eventType
          && existing.title === notification.title
          && existing.body === notification.body
          && existing.isRead === notification.isRead
          && existing.createdAt === notification.createdAt) {
          return current;
        }
        return [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 50);
      });
    });
    const unsubscribeRedemptions = subscribeMyRewardRedemptions(pilotSession.userId, () => {
      if (active) void refreshRewardRedemptions().catch(() => undefined);
    });
    return () => {
      active = false;
      unsubscribe();
      unsubscribeRedemptions();
    };
  }, [pilotSession?.userId]);
  const openView = (next: View) => {
    setView(next);
    setNavOpen(false);
    window.history.pushState(
      null,
      "",
      next === "profile" ? window.location.pathname : `#${next}`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openLeaderPlaybook = () => {
    if (leaderPlaybookLocked) {
      toast.error("🔒 Tính năng này dành riêng cho cấp Quản lý (Leader).");
      setNavOpen(false);
      return;
    }
    openView("leader");
  };
  const openLeadershipLearning = (style: LeadershipTrait, openRoleplay: boolean) => {
    setLeadershipLearningRequest({ playbookCode: getLeadershipPracticePlaybookCode(style), openRoleplay });
    setDiscOpen(false);
    openView("playbook");
  };
  const renderLeadershipValueAdd = (style: LeadershipTrait | null) => {
    const result = style ? leadershipTest?.results[style] : null;
    if (!style || !result) return null;
    return <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-left" aria-label="Gợi ý phát triển theo phong cách lãnh đạo"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Góc khuất cần lưu tâm</span><p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{result.goc_khuat}</p><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => openLeadershipLearning(style, false)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-3 text-left text-xs font-black leading-snug text-amber-800 shadow-sm transition hover:border-amber-500 hover:bg-amber-100"><BookOpen size={16} className="shrink-0" />Đọc Thẻ: {result.goi_y_bao_boi}</button><button type="button" onClick={() => openLeadershipLearning(style, true)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-left text-xs font-black leading-snug text-white shadow-sm transition hover:bg-slate-800"><Sparkles size={16} className="shrink-0 text-amber-300" />Thực Hành: {result.goi_y_roleplay}</button></div></section>;
  };
  const refreshMarketingTemplates = React.useCallback(async () => {
    try {
      const library = await fetchContentLibrary();
      setContent((current) => ({ ...current, marketing: library.marketing }));
      setContentError("");
    } catch (error) {
      setContentError(error instanceof Error ? error.message : "Không thể đồng bộ phôi Marketing.");
    }
  }, []);
  const refreshPlaybooks = React.useCallback(async () => {
    try {
      const library = await fetchContentLibrary();
      setContent((current) => ({ ...current, playbooks: library.playbooks }));
      setContentError("");
    } catch (error) {
      setContentError(error instanceof Error ? error.message : "Không thể đồng bộ Bảo Bối.");
    }
  }, []);
  const openNewsSection = (section: "news" | "case") => {
    setNewsSection(section);
    openView("news");
  };
  const dismissWelcome = () => {
    sessionStorage.setItem("agent-copilot-welcome-seen", "true");
    setWelcomeOpen(false);
  };
  const awardAdvisorAction = async (source: Parameters<typeof awardXp>[0], sourceKey: string) => {
    if (!pilotSession || pilotSession.profile.role !== "advisor") return null;
    try {
      const reward = await awardXp(source, sourceKey);
      if (reward.awarded) {
        setXpEntries(await fetchXpLedger());
        setAdvisorProgress((current) => current ? { ...current, total_xp: reward.totalXp, current_streak: reward.currentStreak, completed_quiz_today: current.completed_quiz_today || source.startsWith("daily_quiz") } : current);
      }
      return reward;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hoạt động đã lưu, nhưng XP tự động chưa thể xác nhận.");
      return null;
    }
  };
  const completeDailyQuiz = async (source: "daily_quiz_correct" | "daily_quiz_incorrect") => {
    if (pilotSession?.profile.role === "leader") {
      const claim = await claimDailyQuizXp();
      return { awarded: claim.claimed, xpAmount: claim.xp_amount, totalXp: claim.total_xp, currentStreak: claim.current_streak };
    }
    return awardAdvisorAction(source, todayDateKey);
  };
  const startCapabilityQuest = async (playbook: OperationalLibrary["playbooks"][number]) => {
    if (!pilotSession || pilotSession.profile.role !== "advisor") {
      toast.error("Đăng nhập TVV để nhận thử thách thực chiến.");
      return;
    }
    try {
      const challenge = await acceptLearningChallenge(playbook.code);
      setActiveLearningChallenge(challenge);
      setView("playbook");
      toast.success(`Đã nhận thử thách “${challenge.playbookTitle}”. Áp dụng rồi ghi Nhịp Đập để nhận +50 XP.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa thể nhận thử thách lúc này.");
    }
  };
  const redeemReward = async (reward: OperationalLibrary["xpRewards"][number]) => {
    if (Number(xpTotal) < Number(reward.xp_cost)) {
      toast.error("Chưa đủ điểm, hãy đi gặp khách hàng thêm nhé!");
      return;
    }
    setRedeemingRewardCode(reward.code);
    try {
      const result = await redeemXpReward(reward.code);
      await Promise.all([refreshXpState(), refreshRewardRedemptions()]);
      toast.success(result.idempotent ? `Yêu cầu đổi “${result.rewardName}” đã được ghi nhận trước đó.` : `Đã đổi “${result.rewardName}” và trừ ${result.xpCost} XP.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đổi quà lúc này.");
    } finally {
      setRedeemingRewardCode(null);
    }
  };
  const downloadAgentMoment = async (elementId: string, rewardName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
      toast.info("Đang xử lý ảnh chất lượng cao...");
      const giftElements = Array.from(element.querySelectorAll<Element>("[data-export-decoration='true'], [data-export-ignore='true']"));
      const removedEffectClasses: Array<{ element: Element; className: string }> = [];
      giftElements.forEach((node) => {
        Array.from(node.classList).forEach((className) => {
          if (className.startsWith("backdrop-blur-") || className.startsWith("shadow-") || className.startsWith("drop-shadow-")) {
            node.classList.remove(className);
            removedEffectClasses.push({ element: node, className });
          }
        });
      });
      let dataUrl: string;
      try {
        dataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: Math.min(typeof window === "undefined" ? 1 : (window.devicePixelRatio || 1), 2),
          backgroundColor: "#ffffff",
          filter: (node) => !(node instanceof Element && (node.getAttribute("data-export-decoration") === "true" || node.getAttribute("data-export-ignore") === "true")),
          style: { transform: "none", margin: "0", position: "relative", boxShadow: "none" },
        });
      } finally {
        removedEffectClasses.forEach(({ element: giftElement, className }) => giftElement.classList.add(className));
      }
      const link = document.createElement("a");
      link.download = `AgentMoment_${rewardName.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Tải ảnh thành công! Sẵn sàng chia sẻ.");
    } catch (error) {
      console.error("Image Capture Error:", error);
      toast.error("Lỗi tạo ảnh. Vui lòng thử lại.");
    }
  };
  const openTargetModal = () => {
    const role = pilotSession?.profile.role;
    setSprint11TargetRole(role === "leader" || role === "director" ? role : managerMode ? "leader" : "advisor");
    setTargetOpen(true);
  };
  const saveTarget = () => {
    const bhnt = Number(targetBhntDraft.replace(/[^0-9]/g, ""));
    const pnt = Number(targetPntDraft.replace(/[^0-9]/g, ""));
    const rate = Number(commissionRateDraft.replace(/[^0-9]/g, ""));
    const size = Number(contractSizeDraft.replace(/[^0-9]/g, ""));
    const value = bhnt + pnt;
    if (!Number.isFinite(value) || value < 5 || value > 800)
      return toast.error("Hãy nhập tổng mục tiêu từ 5 đến 800 triệu.");
    if (
      !Number.isFinite(rate) ||
      rate < 1 ||
      rate > 100 ||
      !Number.isFinite(size) ||
      size < 1
    )
      return toast.error("Nhập hoa hồng 1–100% và size HĐ từ 1 triệu.");
    setTargetBhnt(bhnt * 1_000_000);
    setTargetPnt(pnt * 1_000_000);
    setTargetIncome(value * 1_000_000);
    setCommissionRate(rate);
    setContractSize(size * 1_000_000);
    setTargetDraft(String(value));
    setTargetOpen(false);
    toast.success("Đã quy đổi phễu theo thu nhập, hoa hồng và size hợp đồng.");
  };
  const openZalo = (message: string, title: string) => {
    window.open(buildZaloDeepLink(message), "_blank", "noopener,noreferrer");
    toast.success(`Đã mở Zalo với mẫu “${title}”.`);
  };
  const copyLetter = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`Đã copy mẫu “${label}”.`);
  };
  const copyLeaderShareText = async (shareText: string) => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Đã copy thông điệp!");
    } catch {
      toast.error("Không thể copy thông điệp. Vui lòng thử lại.");
    }
  };
  const openLeaderRoleplay = (script: LeadershipPrinciple) => {
    if (!script.roleplay_prompt?.trim()) {
      toast.error("Kịch bản này chưa có prompt Roleplay.");
      return;
    }
    setLeaderRoleplayScript(script);
  };
  const leaderRoleplayCard: PlaybookCard | null = leaderRoleplayScript
    ? {
        code: `leader-roleplay-${leaderRoleplayScript.code}`,
        team_id: null,
        skill_system: "Nghệ thuật Khai vấn",
        required_level: "Leader",
        situation: leaderRoleplayScript.topic,
        customer_insight: leaderRoleplayScript.core_thinking,
        mindset: "Giữ nhịp thấu cảm, đặt câu hỏi mở và dẫn dắt TVV tự tìm ra bước tiếp theo.",
        core_logic: leaderRoleplayScript.core_thinking,
        coaching_prompts: leaderRoleplayScript.note ?? "Thực hành một cuộc trò chuyện 1-1 ngắn gọn, rõ ràng và không phán xét.",
        ai_evaluation_rules: { roleplay_prompt: leaderRoleplayScript.roleplay_prompt ?? undefined },
        is_pro: true,
        sort_order: 0,
      }
    : null;
  const showLedger = async () => {
    setXpOpen(true);
    setXpLoading(true);
    try {
      setXpEntries(await fetchXpLedger());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải Ngân Hàng Điểm."
      );
    } finally {
      setXpLoading(false);
    }
  };
  const closeCoachingLog = () => {
    setCoachingLogPlaybook(null);
    setCoachingAdvisorId("");
    setCoachingNote("");
  };
  const openCoachingLog = async (playbook: LeadershipPrinciple) => {
    if (pilotSession?.profile.role !== "leader") return;
    setCoachingLogPlaybook(playbook);
    setCoachingAdvisorId("");
    setCoachingNote("");
    setCoachingAdvisorsLoading(true);
    try {
      const advisors = await fetchMyCoachingAdvisors();
      setCoachingAdvisors(advisors);
      setCoachingAdvisorId(advisors[0]?.id ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách TVV.");
    } finally {
      setCoachingAdvisorsLoading(false);
    }
  };
  const saveCoachingLog = async () => {
    if (!coachingLogPlaybook || !coachingAdvisorId) {
      toast.error("Hãy chọn một TVV trong Team trước khi lưu.");
      return;
    }
    setCoachingLogSaving(true);
    try {
      await logMyCoachingApplication({ advisorId: coachingAdvisorId, leaderPlaybookId: coachingLogPlaybook.code, note: coachingNote });
      toast.success("Tuyệt vời! Một cuộc trò chuyện chất lượng hôm nay có thể cứu vãn cả một sự nghiệp của TVV ngày mai.");
      closeCoachingLog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu ghi nhận coaching.");
    } finally {
      setCoachingLogSaving(false);
    }
  };
  const startDisc = () => {
    if (usesLeadershipCheckpoint) {
      if (!leadershipTest) {
        toast.error(leadershipTestError || "Leadership Test đang được tải. Vui lòng thử lại sau.");
        return;
      }
      setLeadershipAnswers({});
      setLeadershipStep(0);
      setLeadershipResult(null);
      setLeadershipIntroOpen(true);
      setDiscOpen(true);
      return;
    }
    if (pilotSession?.profile.disc_result) {
      toast.message("DISC đã được lưu trong hồ sơ. Kết quả được giữ nguyên để theo dõi phát triển cá nhân.");
      return;
    }
    setDiscAnswers({});
    setDiscStep(0);
    setDiscResult(null);
    setDiscOpen(true);
  };
  const revealDiscResult = async (answers: Record<string, DiscType>) => {
    const result = calculateDiscResult(Object.values(answers));
    if (!result) return;
    const scores = calculateDiscScores(Object.values(answers));
    setDiscBadge(result);
    setDiscResult(result);
    try {
      const persisted = await submitDiscAssessment({
        disc_type: result as DiscProfileType,
        score_d: scores.D,
        score_i: scores.I,
        score_s: scores.S,
        score_c: scores.C,
      });
      if (persisted) {
        const checkpoint = await completeDiscCheckpoint(result as DiscProfileType);
        setPilotSession((current) => current ? { ...current, profile: { ...current.profile, disc_result: checkpoint } } : current);
        const reward = await awardAdvisorAction("disc_assessment", persisted);
        toast.success(`Đã lưu Nhóm ${result} vào hồ sơ Supabase.${reward?.awarded ? ` +${reward.xpAmount} XP hoàn tất DISC.` : ""}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Kết quả Nhóm ${result} đang hiển thị trong phiên này.`
      );
    }
  };
  const chooseDiscAnswer = (type: DiscType) => {
    if (!currentDiscQuestion) return;
    const nextAnswers = { ...discAnswers, [currentDiscQuestion.code]: type };
    setDiscAnswers(nextAnswers);
    if (discStep < content.discQuestions.length - 1)
      window.setTimeout(() => setDiscStep(step => step + 1), 220);
    else
      window.setTimeout(() => {
        void revealDiscResult(nextAnswers);
      }, 240);
  };
  const persistLeadershipResult = async (result: LeadershipTrait) => {
    if (!leadershipTest || leadershipSaving) return;
    setLeadershipSaving(true);
    try {
      const checkpoint = await completeLeadershipCheckpoint(result);
      const description = leadershipTest.results[checkpoint]?.description ?? "";
      setPilotSession((current) => current ? { ...current, profile: { ...current.profile, leadership_style: checkpoint, leadership_style_description: description } } : current);
      toast.success(`Đã lưu phong cách ${leadershipTest.results[checkpoint].name} vào hồ sơ Supabase.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chưa thể lưu kết quả. Vui lòng thử lại.");
    } finally {
      setLeadershipSaving(false);
    }
  };
  const chooseLeadershipAnswer = async (trait: LeadershipTrait) => {
    if (!currentLeadershipQuestion || !leadershipTest || leadershipSaving) return;
    const nextAnswers = { ...leadershipAnswers, [currentLeadershipQuestion.id]: trait };
    setLeadershipAnswers(nextAnswers);
    if (leadershipStep < leadershipTest.questions.length - 1) {
      window.setTimeout(() => setLeadershipStep((step) => step + 1), 220);
      return;
    }
    const answers = leadershipTest.questions
      .map((question) => nextAnswers[question.id])
      .filter((answer): answer is LeadershipTrait => Boolean(answer));
    const result = calculateLeadershipTraitResult(answers);
    if (!result) return;
    setLeadershipResult(result);
    await persistLeadershipResult(result);
  };
  const answerQuiz = async (choice: string) => {
    if (!dailyQuiz || quizSaving || quizDone) return;
    setQuizAnswer(choice);
    const isCorrect = choice === dailyQuiz.correct_option;
    setQuizDone(true);
    setQuizSaving(true);
    try {
      const reward = await completeDailyQuiz(isCorrect ? "daily_quiz_correct" : "daily_quiz_incorrect");
      if (!reward) {
        setQuizDone(false);
        setQuizAnswer(null);
        toast.success("Đã ghi nhận câu trả lời.");
        return;
      }
      setDailyPushOpen(false);
      setQuizClaimed(reward.awarded);
      setQuizStreak(reward.currentStreak);
      setLastQuizDate(todayDateKey);
      setAdvisorProgress((current) => ({ total_xp: reward.totalXp, current_streak: reward.currentStreak, coin_balance: current?.coin_balance ?? 0, completed_quiz_today: true }));
      if (reward.awarded) toast.success(isCorrect ? `Xuất sắc! +${reward.xpAmount} XP đã vào Ngân hàng điểm; Chuỗi hôm nay được giữ vững.` : `Bạn đã hoàn tất Nạp Não. +${reward.xpAmount} XP để giữ nhịp học mỗi ngày.`);
      else toast.error("Bạn đã nhận XP cho Daily Quiz hôm nay rồi.");
    } catch {
      setQuizDone(false);
      setQuizAnswer(null);
      setQuizClaimed(false);
      toast.success("Đã ghi nhận câu trả lời.");
    } finally {
      setDailyPushOpen(false);
      setQuizSaving(false);
    }
  };
  const submitLog = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pilotSession || pilotSession.profile.role !== "advisor")
      return toast.error("Hãy đăng nhập bằng tài khoản TVV Pilot để ghi Nhịp Đập.");
    if (logAction === "Dời lịch" && !followUp)
      return toast.error("Dời lịch cần một ngày Follow-up cụ thể.");
    if (journalPublic) {
      const journalError = validateJournalEntry(journalStory);
      if (journalError) return toast.error(journalError);
    }
    setLogSaving(true);
    try {
      const result = await logPilotActivity({
        serviceLevel: logLevel,
        actionResult: logAction,
        customerJourney: logCustomerJourney,
        followUpDate: followUp || null,
        revenueAmount: Number(revenue || 0),
      });
      const pulseReward = await awardAdvisorAction(logLevel === 1 ? "customer_pulse_l1" : "customer_pulse_l2_plus", result.activity.id);
      let proofReward: Awaited<ReturnType<typeof completeLearningChallengeProof>> | null = null;
      if (logUsesLearningChallenge && activeLearningChallenge) {
        try {
          proofReward = await completeLearningChallengeProof(activeLearningChallenge.id, result.activity.id);
          if (proofReward.awarded) {
            setActiveLearningChallenge(null);
            setXpEntries(await fetchXpLedger());
            setAdvisorProgress((current) => current ? { ...current, total_xp: proofReward!.totalXp, current_streak: proofReward!.currentStreak } : current);
          }
        } catch (error) {
          toast.error(error instanceof Error ? `Nhịp Đập đã lưu, nhưng Proof of Work chưa được xác nhận: ${error.message}` : "Nhịp Đập đã lưu, nhưng Proof of Work chưa được xác nhận.");
        }
      }
      if (journalPublic) {
        const post = await createTeamCommunityPost(journalStory.trim());
        await awardAdvisorAction("community_post", post.id);
        setCommunityPosts(await fetchTeamCommunityFeed());
      }
      setLogOpen(false);
      setRevenue("");
      setFollowUp("");
      setJournalStory("");
      setLogUsesLearningChallenge(false);
      toast.success(
        result.followup
          ? `Đã ghi Nhịp Đập và tạo Follow-up Zero-PII trong Pilot.${pulseReward?.awarded ? ` +${pulseReward.xpAmount} XP` : ""}${proofReward?.awarded ? ` +${proofReward.xpAmount} XP Proof of Work` : ""}`
          : `Đã ghi hoạt động thật vào Pilot Data Loop.${pulseReward?.awarded ? ` +${pulseReward.xpAmount} XP` : ""}${proofReward?.awarded ? ` +${proofReward.xpAmount} XP Proof of Work` : ""}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu Nhịp Đập."
      );
    } finally {
      setLogSaving(false);
    }
  };
  const sendGratitudeXp = async (
    amountInput: string | React.MouseEvent<HTMLButtonElement>
  ) => {
    const amountDraft = typeof amountInput === "string" ? amountInput : "20";
    const amount = Number(amountDraft.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(amount) || amount < 1 || amount > 5_000)
      return toast.error("Hãy nhập số XP từ 1 đến 5.000 điểm.");
    if (gratitudeNote.trim().length < 4)
      return toast.error("Hãy viết một lời cảm ơn ngắn trước khi tặng XP.");
    if (!gratitudeRecipientId)
      return toast.error("Hãy chọn một bài chia sẻ của đồng đội trước khi tặng XP.");
    try {
      await giftTeamXp(gratitudeRecipientId, amount, gratitudeNote, Boolean(gratitudePostId));
      const [ledger, progress] = await Promise.all([fetchXpLedger(), fetchAdvisorProgress()]);
      setXpEntries(ledger);
      if (progress) setAdvisorProgress(progress);
      setGratitudeOpen(false);
      setGratitudeNote("");
      setGratitudeRecipientId(null);
      setGratitudePostId(null);
      toast.success(`Đã gửi ${amount} XP biết ơn tới ${gratitudeRecipient}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi XP biết ơn lúc này.");
    }
  };
  const sendFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateZeroPiiFeedback(
      feedbackFeature,
      feedbackSuggestion
    );
    if (validationError) return toast.error(validationError);
    setFeedbackSaving(true);
    try {
      await submitFeedback({
        rating: feedbackRating,
        favorite_feature: feedbackFeature,
        suggestion: feedbackSuggestion.trim(),
      });
      setFeedbackFeature("");
      setFeedbackSuggestion("");
      toast.success("Cảm ơn! Góp ý đã được gửi an toàn.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi góp ý.");
    } finally {
      setFeedbackSaving(false);
    }
  };

  const saveSprint11Target = async (value: Sprint11TargetSave) => {
    if (value.role === "advisor") {
      const plan = calculateAdvisorTargetPlan(
        {
          incomeTarget: value.bhntIncome,
          commissionRate: value.bhntCommission,
          averageContractSize: value.bhntContractSize,
        },
        {
          incomeTarget: value.pntIncome,
          commissionRate: value.pntCommission,
          averageContractSize: value.pntContractSize,
        }
      );
      const persisted = hasSupabaseContentConfig
        ? await persistAdvisorTarget({
            targetIncome: plan.projectedIncome,
            requiredMeetings: plan.requiredMeetings,
          })
        : {
            targetIncome: plan.projectedIncome,
            requiredMeetings: plan.requiredMeetings,
          };
      setTargetBhnt(value.bhntIncome);
      setTargetPnt(value.pntIncome);
      setTargetIncome(persisted.targetIncome);
      setCommissionRate(value.bhntCommission);
      setContractSize(value.bhntContractSize);
      setPntCommission(value.pntCommission);
      setPntContractSize(value.pntContractSize);
      const reward = await awardAdvisorAction("monthly_target_set", new Date().toISOString().slice(0, 7));
      toast.success(
        `Đã lưu và đồng bộ ${plan.requiredContracts} HĐ cùng ${persisted.requiredMeetings} cuộc gặp theo BHNT/PNT.${reward?.awarded ? ` +${reward.xpAmount} XP thiết lập mục tiêu.` : ""}`
      );
    } else {
      const persisted = hasSupabaseContentConfig ? await persistPlayerCoachGoal(value) : value;
      setPlayerCoachGoal(persisted);
      setTargetIncome(persisted.personalIncome);
      toast.success("Đã lưu bốn trụ cột Leader: cá nhân, tuyển dụng, Active Rate và coaching.");
    }
    setTargetOpen(false);
  };
  const openSprint11Target = () => {
    const role = pilotSession?.profile.role;
    setSprint11TargetRole(role === "leader" || role === "director" ? role : managerMode ? "leader" : "advisor");
    setTargetOpen(true);
  };
  const primaryNav = [
    { id: "profile" as View, label: pilotSession?.profile.role === "super_admin" ? "God Mode" : "Hồ Sơ", icon: HomeIcon },
    { id: "playbook" as View, label: "Bảo Bối", icon: BookOpen },
    { id: "community" as View, label: "Cộng Đồng", icon: Users },
    { id: "radar" as View, label: "Radar", icon: Radar },
    { id: "heartbeat" as View, label: "Nhịp Đập", icon: HandHeart },
    ...(pilotSession?.profile.role === "super_admin"
      ? [{ id: "founder" as View, label: "Pilot", icon: ShieldCheck }]
      : []),
  ];

  function DailyQuiz() {
    if (!dailyQuiz)
      return loading ? (
        <ContentState loading error="" empty={false} label="Nạp Não Mỗi Sáng" />
      ) : null;
    const choices = [
      { id: "A", text: dailyQuiz.option_a },
      { id: "B", text: dailyQuiz.option_b },
      { id: "C", text: dailyQuiz.option_c },
    ];
    if (quizDone)
      return (
        <section className="daily-quiz completed lift-card">
          <Confetti />
          <div className="quiz-complete-icon">
            <CheckCircle2 size={25} />
          </div>
          <div>
            <span>NẠP NÃO MỖI SÁNG · ĐÃ HOÀN TẤT</span>
            <h3>
              {quizClaimed
                ? `+${dailyQuiz.xp_reward} XP đã vào Ngân hàng điểm.`
                : "Đáp án chính xác."}
            </h3>
            <p>
              {quizClaimed ? (
                <>
                  Chuỗi đã được giữ vững ở <b>{quizStreak ?? "—"} ngày</b>.
                </>
              ) : (
                "Đăng nhập Supabase để ghi XP và Chuỗi cho lượt đúng hôm nay."
              )}
            </p>
            <div className="quiz-study-panel">
              <Lightbulb size={20} />
              <div>
                <span>GIẢI THÍCH CHUYÊN SÂU</span>
                <strong>{dailyQuiz.explanation}</strong>
              </div>
            </div>
          </div>
          <div className="quiz-streak-chip">
            <Flame size={16} />
            {quizStreak ?? "—"} ngày
          </div>
        </section>
      );
    return (
      <section className="daily-quiz lift-card">
        <div className="quiz-heading">
          <div className="quiz-orb">
            <Sparkles size={20} />
          </div>
          <div>
            <span>NẠP NÃO MỖI SÁNG · SUPABASE</span>
            <h3>
              Phản xạ 60 giây · <b>+{dailyQuiz.xp_reward} XP</b>
            </h3>
          </div>
          <div className="quiz-streak-chip">
            <Flame size={16} />
            Chuỗi thật
          </div>
        </div>
        <div className="quiz-question">
          <span>HÔM NAY · {dailyQuiz.code}</span>
          <strong>{dailyQuiz.question}</strong>
        </div>
        <div className="quiz-options">
          {choices.map(choice => (
            <button
              type="button"
              key={choice.id}
              disabled={quizSaving}
              className={`${quizAnswer === choice.id ? (choice.id === dailyQuiz.correct_option ? "is-correct" : "is-wrong") : ""}`}
              onClick={() => void answerQuiz(choice.id)}
            >
              <i>{choice.id}</i>
              <span>{choice.text}</span>
            </button>
          ))}
        </div>
        {quizAnswer && (
          <div
            className={`quiz-study-panel ${quizAnswer === dailyQuiz.correct_option ? "is-correct" : "is-review"}`}
          >
            <Lightbulb size={20} />
            <div>
              <span>
                {quizAnswer === dailyQuiz.correct_option
                  ? "ĐÚNG RỒI · GHI NHỚ ĐIỂM NÀY"
                  : "CÙNG XEM LẠI GÓC NHÌN"}
              </span>
              <strong>{dailyQuiz.explanation}</strong>
            </div>
          </div>
        )}
        <p className="quiz-hint">
          <Zap size={14} />
          Câu hỏi và giải thích được đồng bộ từ <b>12_Nạp Não Mỗi Sáng</b>.
        </p>
      </section>
    );
  }

  function ProfileView() {
		const isLeaderDashboard = pilotSession?.profile.role === "leader";
		const leadershipProfile = savedLeadershipStyle ? leadershipTest?.results[savedLeadershipStyle] : null;
    return (
      <motion.div
        className="screen-enter"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AgentDashboardGreeting
          userName={agentDisplayName}
          userAvatar={agentProfile.avatarUrl}
          companionName={CORE_CAST_AVATARS.find((avatar) => avatar.id === agentProfile.avatarId)?.name || "Người đồng hành"}
        />
        {pilotSession?.profile.role === "advisor" && <CapabilityQuestCard playbook={capabilityQuest} activeTitle={activeLearningChallenge?.playbookTitle} onStart={(playbook) => void startCapabilityQuest(playbook)} />}
        <AgentStreakWidget
          currentStreak={currentStreakDays}
          milestones={streakMilestones}
          unclaimedMilestone={unclaimedStreakMilestone}
          isClaiming={claimingStreakMilestoneId === unclaimedStreakMilestone?.id}
          onClaimMilestone={handleClaimStreakMilestone}
          onDetails={() => setStreakDetailsOpen(true)}
          dailyQuizPending={dailyQuizNeedsCompletion}
        />
        <section className="dashboard-intro dashboard-quick-actions">
          <div className="intro-actions">
            <button className="disc-quick cta-glow" onClick={startDisc}>
              <ClipboardCheck size={17} />
              {isLeaderDashboard ? "Trắc Nghiệm Định Vị Phong Cách Lãnh Đạo" : discBadge ? `Nhóm ${discBadge}` : "Làm DISC 5 câu"}
            </button>
            <button
              className="log-cta cta-glow"
              onClick={() => setLogOpen(true)}
            >
              <Plus size={18} />
              Ghi Nhịp Đập
            </button>
            {(pilotSession?.profile.role === "advisor" || pilotSession?.profile.role === "leader") && (
              <button className="disc-quick" onClick={() => setAgentMirrorOpen(true)}>
                <Sparkles size={17} />
                Hành Trình Của Tôi
              </button>
            )}
          </div>
        </section>
        {isLeaderDashboard && savedLeadershipStyle && (
          <section className="mb-5 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-indigo-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-black tracking-[0.16em] text-amber-700">KẾT QUẢ L.E.A.D ĐÃ LƯU</span>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">Phong cách quản trị: {leadershipProfile?.name ?? savedLeadershipStyle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{savedLeadershipDescription || "Kết quả phong cách lãnh đạo đang được đồng bộ."}</p>
              </div>
              <button type="button" onClick={startDisc} className="shrink-0 text-sm font-black text-indigo-700 underline decoration-indigo-300 underline-offset-4 transition hover:text-indigo-900">Làm lại bài trắc nghiệm</button>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-100 bg-white/80 p-4">
              <span className="text-[10px] font-black tracking-[0.14em] text-amber-700">GÓC KHUẤT CẦN LƯU TÂM</span>
              <p className="mt-1 text-sm leading-6 text-slate-700">{leadershipProfile?.goc_khuat ?? "Dành thời gian quan sát phản hồi của đội ngũ trước khi quyết định bước tiếp theo."}</p>
            </div>
          </section>
        )}
        <PilotAdvisorDailyStart session={pilotSession} />
        <DailyQuiz />
        <section className="income-card lift-card">
          <div className="income-grid">
            <div className="income-copy">
              <div className="card-kicker">
                <Target size={15} />
                MỤC TIÊU THÁNG{" "}
                <button
                  className="target-edit"
                  onClick={openTargetModal}
                  aria-label="Chỉnh mục tiêu thu nhập"
                >
                  <PenLine size={14} />
                </button>
              </div>
              <div className="income-total">
                <AnimatedNumber value={earnedIncome / 1_000_000} />
                <small>triệu</small>
                <em>
                  /{" "}
                  {targetIncome
                    ? `${money.format(targetIncome / 1_000_000)} triệu`
                    : "chưa đặt"}
                </em>
              </div>
              <p>
                Không có doanh số giả. Đặt mục tiêu để Copilot quy đổi thành số
                cuộc gặp mỗi tháng.
              </p>
              <div className="progress-track ember-progress">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
                <i style={{ left: `${progress}%` }} />
              </div>
              <div className="progress-legend">
                <strong>Thực đạt {money.format(earnedIncome / 1_000_000)} / Mục tiêu {targetIncome ? money.format(targetIncome / 1_000_000) : "—"} triệu</strong>
                <span>{progress}% · dữ liệu theo doanh thu đã ghi nhận</span>
              </div>
            </div>
            <div className="income-visual">
              <div className="signal-orbit orbit-one" />
              <div className="signal-orbit orbit-two" />
              <figure className="dashboard-motivation-art">
                <img
                  src={trophyImg}
                  alt="Minh họa hành trình chinh phục mục tiêu"
                />
                <figcaption>
                  <span>MỖI NGÀY MỘT BƯỚC</span>
                  <strong>
                    Giữ nhịp nhỏ.
                    <br />
                    Mở đường lớn.
                  </strong>
                </figcaption>
              </figure>
              <div className="income-shield">
                <BrandMark />
              </div>
            </div>
          </div>
        </section>
        <section className="meeting-section">
          <div className="section-title">
            <div>
              <div className="eyebrow">
                <span />
                PHỄU HÀNH ĐỘNG
              </div>
              <h2>
                Cuộc gặp tạo ra <em>đường đi.</em>
              </h2>
            </div>
            <button className="cta-hover" onClick={openTargetModal}>
              Chỉnh mục tiêu <Edit3 size={15} />
            </button>
          </div>
          <div className="meeting-grid">
            <article className="meeting-progress lift-card">
              <div className="meeting-progress-top">
                <div>
                  <span>Cuộc gặp cần thực hiện</span>
                  <strong>
                    <AnimatedNumber value={finishedMeetings} />
                    <small> / {targetIncome ? requiredMeetings : "—"}</small>
                  </strong>
                </div>
                <div className="meeting-ring">
                  <span>{meetingProgress}%</span>
                </div>
              </div>
              <div className="meeting-bar">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${meetingProgress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p>
                <Target size={15} />
                {insight}
              </p>
            </article>
            <article className="metric-card streak-card lift-card">
              <div className="metric-head">
                <span>NHỊP HIỆN TẠI</span>
                <Flame size={19} />
              </div>
              <strong>
                {quizStreak ?? "—"} <small>ngày</small>
              </strong>
              <p>
                <i />
                {quizStreak
                  ? "Chuỗi được đồng bộ sau Daily Quiz"
                  : "Chờ users_profile.current_streak"}
              </p>
              <div className="metric-footer">
                Nguồn: <b>Supabase</b>
              </div>
            </article>
            <button
              className="metric-card xp-card lift-card xp-clickable"
              onClick={showLedger}
            >
              <div className="metric-head">
                <span>TỔNG XP · BẤM XEM SỔ CÁI</span>
                <Zap size={18} />
              </div>
              <strong>
                <AnimatedNumber value={xpTotal} />
              </strong>
              <p>
                <i />
                xp_ledger theo user đã xác thực
              </p>
              <div className="metric-footer">
                Mở Ngân Hàng Điểm <ChevronRight size={15} />
              </div>
            </button>
          </div>
        </section>
        <section className="zero-pii-card lift-card">
          <div className="zero-pii-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>ZERO-PII BY DEFAULT</span>
            <h3>Không ghi tên, số điện thoại hay định danh khách hàng.</h3>
            <p>
              Nhịp Đập chỉ lưu cấp độ dịch vụ, kết quả, ngày follow-up và doanh
              thu — toàn bộ dưới RLS của Supabase.
            </p>
          </div>
        </section>
      </motion.div>
    );
  }

  function PlaybookView() {
    return (
      <div className="screen-enter playbook-page">
        <Hero
          eyebrow="BẢO BỐI THỰC CHIẾN · SUPABASE"
          title={
            <>
              Đừng tranh luận.
              <br />
              <em>Hãy hỏi đúng.</em>
            </>
          }
          description="Thẻ xử lý tình huống được đồng bộ trực tiếp từ sheet 3_Bảo Bối Thực Chiến."
          icon={<MessageCircle size={62} />}
          label="DATA-DRIVEN PLAYBOOK"
          className="playbook-hero"
        />
        <ContentState
          loading={loading}
          error={contentSourceError("playbooks")}
          empty={!content.playbooks.length}
          label="Bảo Bối"
          onRetry={() => void retryContentLibrary()}
        />
        <BaoBoiPage
          session={pilotSession}
          playbooks={content.playbooks}
          userRole={userRole}
          onPlaybooksChanged={refreshPlaybooks}
          onRoleplayCompleted={async () => {
            if (!pilotSession || pilotSession.profile.role !== "advisor") return;
            try {
              const activity = await recordPilotActivityEvent("learning_session", { source: "training_roleplay" });
              const reward = await awardAdvisorAction("training_roleplay", activity.id);
              if (reward?.awarded) toast.success(`Hoàn tất Roleplay. +${reward.xpAmount} XP.`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Không thể ghi nhận vòng Roleplay lúc này.");
            }
          }}
          activeChallenge={activeLearningChallenge}
          onAcceptChallenge={startCapabilityQuest}
          learningRequest={leadershipLearningRequest}
          onLearningRequestHandled={() => setLeadershipLearningRequest(null)}
        />
      </div>
    );
  }

  function Hero({
    eyebrow,
    title,
    description,
    icon,
    label,
    className,
  }: {
    eyebrow: string;
    title: React.ReactNode;
    description: string;
    icon: React.ReactNode;
    label: string;
    className: string;
  }) {
    return (
      <section className={`view-hero ${className}`}>
        <div>
          <div className="eyebrow">
            <span />
            {eyebrow}
          </div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="knowledge-hero-icon">
          {icon}
          <span>{label}</span>
        </div>
      </section>
    );
  }

  function KnowledgeView({ kind }: { kind: "empathy" | "leader" }) {
    const isEmpathy = kind === "empathy";
    const principlesList = content.leadership.filter((item) => item.type === "principle");
    const coachingList = content.leadership.filter((item) => item.type === "coaching_script");
    const leaderTags = Array.from(new Set(coachingList.flatMap((item) => item.tags ?? [])));
    const filteredCoachingList = coachingList.filter((item) => leaderSituationFilter === "all" || (item.tags ?? []).includes(leaderSituationFilter));
    const visibleLeaderItems = leaderContentTab === "principle" ? principlesList : filteredCoachingList;
    const items = isEmpathy ? content.empathy : visibleLeaderItems;
    const isSuperAdmin = pilotSession?.profile.role === "super_admin";
    const isLeader = pilotSession?.profile.role === "leader";
    return (
      <div className="screen-enter knowledge-page">
        <Hero
          eyebrow={
            isEmpathy
              ? "NGÔN NGỮ THẤU CẢM · SUPABASE"
              : "LA BÀN LÃNH ĐẠO · SUPABASE"
          }
          title={
            isEmpathy ? (
              <>
                Ngôn Ngữ
                <br />
                <em>Thấu Cảm.</em>
              </>
            ) : (
              <>
                La Bàn
                <br />
                <em>Lãnh Đạo.</em>
              </>
            )
          }
          description={
            isEmpathy
              ? "Diễn giải điều khoản bằng ngôn ngữ đời thường từ Content Library."
              : "Nguyên tắc quản trị và coaching được đồng bộ trực tiếp từ Content Library."
          }
          icon={isEmpathy ? <MessageCircle size={58} /> : <Compass size={58} />}
          label="CONTENT LIBRARY"
          className={
            isEmpathy
              ? "knowledge-hero empathy-hero"
              : "knowledge-hero leader-hero"
          }
        />
        {!isEmpathy && (
          <div className="mb-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Nội dung La Bàn">
                <button type="button" role="tab" aria-selected={leaderContentTab === "principle"} onClick={() => setLeaderContentTab("principle")} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${leaderContentTab === "principle" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Nguyên tắc</button>
                <button type="button" role="tab" aria-selected={leaderContentTab === "coaching_script"} onClick={() => setLeaderContentTab("coaching_script")} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${leaderContentTab === "coaching_script" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Kịch bản Coaching</button>
              </div>
              {isSuperAdmin && <InPlaceContentAdmin station="leader_playbook" triggerLabel="+ Thêm Nội Dung" initialValues={{ type: leaderContentTab }} onChanged={refreshInPlaceContent} />}
            </div>
            {leaderContentTab === "coaching_script" && (
              <div className="flex flex-wrap items-center gap-2" aria-label="Lọc tình huống coaching">
                <span className="mr-1 text-[10px] font-black tracking-widest text-slate-400">TÌNH HUỐNG</span>
                <button type="button" onClick={() => setLeaderSituationFilter("all")} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${leaderSituationFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>Tất cả</button>
                {leaderTags.map((tag) => <button key={tag} type="button" onClick={() => setLeaderSituationFilter(tag)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${leaderSituationFilter === tag ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}>{tag}</button>)}
              </div>
            )}
          </div>
        )}
        {isEmpathy && isSuperAdmin && <div className="mb-5 flex justify-end"><InPlaceContentAdmin station="empathy_dictionary" onChanged={refreshInPlaceContent} /></div>}
        <ContentState
          loading={loading}
          error={contentSourceError(isEmpathy ? "empathy" : "leadership")}
          empty={!items.length}
          label={isEmpathy ? "Ngôn Ngữ Thấu Cảm" : "La Bàn Lãnh Đạo"}
          onRetry={() => void retryContentLibrary()}
        />
        {isEmpathy ? (
          <div className="knowledge-list">
            {content.empathy.map((item, index) => {
              const active = openKnowledge === item.code;
              return <article className={`knowledge-item lift-card group relative ${active ? "is-open" : ""}`} key={item.code}><button onClick={() => setOpenKnowledge(active ? null : item.code)}><span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span><span className="knowledge-term">{item.legal_term}</span><span className="knowledge-toggle">{active ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</span></button>{isSuperAdmin && <div className="flex justify-end px-4 pb-2"><InPlaceContentAdmin station="empathy_dictionary" record={{ id: item.code, technical_term: item.legal_term, empathy_translation: item.empathy_translation, category: item.category ?? "Chung" }} onChanged={refreshInPlaceContent} compact /></div>}{active && <div className="knowledge-detail"><div className="empathy-answer"><span>NÓI VỚI KHÁCH NHƯ THẾ NÀY</span><Lightbulb size={18} /><p>{item.empathy_translation}</p></div><aside><span>NGUỒN DỮ LIỆU</span><p>4_Ngôn Ngữ Thấu Cảm</p></aside></div>}</article>;
            })}
          </div>
        ) : leaderContentTab === "principle" ? (
          <div className="knowledge-list" data-leader-principles="accordion">
            {principlesList.map((item, index) => {
              const active = openKnowledge === item.code;
              const displayPrefix = item.prefix || String(index + 1).padStart(2, "0");
              return <article className={`knowledge-item lift-card group relative ${active ? "is-open" : ""}`} key={item.code}><button onClick={() => setOpenKnowledge(active ? null : item.code)}><span className="knowledge-index">{displayPrefix}</span><span className="knowledge-term">{item.topic}</span><span className="knowledge-toggle">{active ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</span></button>{isSuperAdmin && <div className="flex justify-end px-4 pb-2"><InPlaceContentAdmin station="leader_playbook" record={{ id: item.code, type: item.type, prefix: item.prefix ?? "", title: item.topic, tags: (item.tags ?? []).join(", "), content: item.core_thinking, note: item.note ?? "" }} onChanged={refreshInPlaceContent} compact /></div>}{active && <div className="border-t border-slate-100 px-4 pb-4 pt-4 sm:px-5"><p className="text-sm leading-7 text-slate-600">{item.core_thinking}</p>{item.note && <p className="mt-3 text-xs font-black text-indigo-700">{item.note}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void copyLeaderShareText(item.share_text ?? "")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-800 transition hover:bg-amber-100 active:scale-[0.97]"><Share2 size={16} />📤 Gửi Team</button>{isLeader && <button type="button" onClick={() => void openCoachingLog(item)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97]"><PenLine size={16} />Ghi nhận áp dụng cho TVV</button>}</div></div>}</article>;
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" data-leader-coaching="card-grid">
            {filteredCoachingList.map((item) => <article className="relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" key={item.code}><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black tracking-wider text-indigo-700">{item.prefix ?? "CHẠM"}</span>{isSuperAdmin && <InPlaceContentAdmin station="leader_playbook" record={{ id: item.code, type: item.type, prefix: item.prefix ?? "", title: item.topic, tags: (item.tags ?? []).join(", "), content: item.core_thinking, note: item.note ?? "" }} onChanged={refreshInPlaceContent} compact compactMenu />}</div><h3 className="mt-4 text-lg font-black leading-snug text-slate-900">{item.topic}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.core_thinking}</p><div className="mt-4 flex flex-wrap gap-1.5">{(item.tags ?? []).map((tag) => <span key={tag} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{tag}</span>)}</div><div className="mt-auto border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-black text-indigo-700">{item.note}</p><button type="button" onClick={() => openLeaderRoleplay(item)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.97]"><Sparkles size={16} className="text-amber-300" />🎭 Luyện tập với AI</button>{isLeader && <button type="button" onClick={() => void openCoachingLog(item)} className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100 active:scale-[0.97]"><PenLine size={15} />Ghi nhận áp dụng cho TVV</button>}</div></article>)}
          </div>
        )}
        {!isEmpathy && leaderRoleplayCard && <AIRoleplayStudio playbook={leaderRoleplayCard} onClose={() => setLeaderRoleplayScript(null)} />}
        {!isEmpathy && coachingLogPlaybook && (
          <Modal onClose={closeCoachingLog}>
            <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-5">
                <span className="text-[10px] font-black tracking-[0.15em] text-indigo-600">COACHING CRM · KHÔNG XP</span>
                <h2 className="mt-1 text-xl font-black text-slate-900">Ghi nhận áp dụng cho TVV</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Lưu một ghi chú ngắn cho “{coachingLogPlaybook.topic}”. Không nhập tên khách hàng, số điện thoại hoặc email.</p>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">TVV trong Team</span>
                  <select value={coachingAdvisorId} disabled={coachingAdvisorsLoading || !coachingAdvisors.length} onChange={(event) => setCoachingAdvisorId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                    <option value="">{coachingAdvisorsLoading ? "Đang tải TVV..." : coachingAdvisors.length ? "Chọn TVV" : "Chưa có TVV phù hợp trong Team"}</option>
                    {coachingAdvisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.displayName}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">Ghi chú áp dụng</span>
                  <textarea value={coachingNote} onChange={(event) => setCoachingNote(event.target.value)} rows={4} maxLength={1200} placeholder="Ví dụ: Đã dùng GROW để cùng TVV xác định một hành động đầu tiên cho chiều nay." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={closeCoachingLog} disabled={coachingLogSaving} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
                <button type="button" onClick={() => void saveCoachingLog()} disabled={coachingLogSaving || coachingAdvisorsLoading || !coachingAdvisors.length} className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700 disabled:opacity-60"><PenLine size={15} />{coachingLogSaving ? "Đang lưu..." : "Lưu ghi nhận"}</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  function MarketingView() {
    const isMarketingAdmin = pilotSession?.profile.role === "super_admin";
    const activeMarketingView = isMarketingAdmin ? marketingViewMode : "studio";
    return (
      <div className="screen-enter marketing-page">
        {isMarketingAdmin && (
          <div className="mb-5 flex justify-center">
            <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1 shadow-inner" role="group" aria-label="Chế độ Marketing">
              <button type="button" onClick={() => setMarketingViewMode("studio")} aria-pressed={activeMarketingView === "studio"} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition sm:px-6 ${activeMarketingView === "studio" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><ImageIcon size={16} />Marketing Studio</button>
              <button type="button" onClick={() => setMarketingViewMode("manager")} aria-pressed={activeMarketingView === "manager"} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition sm:px-6 ${activeMarketingView === "manager" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><Settings size={16} />Quản lý Phôi</button>
            </div>
          </div>
        )}
        {activeMarketingView === "studio" && (
          <><ContentState loading={loading} error={contentSourceError("marketing")} empty={!content.marketing.length} label="Marketing 1 Chạm" onRetry={() => void retryContentLibrary()} /><MarketingStudio session={pilotSession} templates={content.marketing} /></>
        )}
        {isMarketingAdmin && activeMarketingView === "manager" && (
          <MarketingManager templates={content.marketing} onTemplatesChanged={refreshMarketingTemplates} />
        )}
      </div>
    );
  }

  function RadarView() {
    const role = pilotSession?.profile.role;
    if (role === "super_admin") return <LeadershipMatrixRadar role="super_admin" />;
    if (role === "director" && pilotSession) return <DirectorHybridRadar session={pilotSession} onToast={toast.success} onCreateMoment={(agent) => { setLeaderMomentAgentName(agent.displayName); setLeaderMomentRecipientId(agent.id); setLeaderMomentCreatorOpen(true); }} />;
    if (role === "leader" && pilotSession) return <div className="screen-enter radar-page gated-radar-wrap"><LeaderCommandCenter session={pilotSession} onToast={toast.success} onOpenGoalSettings={openSprint11Target} onCreateMoment={(agent) => { setLeaderMomentAgentName(agent.displayName); setLeaderMomentRecipientId(agent.id); setLeaderMomentCreatorOpen(true); }} /></div>;
    return <div className="screen-enter radar-page gated-radar-wrap"><section className="radar-empty lift-card"><ShieldCheck size={24} /><div><span>PILOT ACCESS</span><h3>Radar Lãnh Đạo chưa áp dụng cho TVV.</h3><p>Hãy dùng Hồ Sơ và Hành Trình Của Tôi để theo dõi nhịp phát triển cá nhân. Không hiển thị dữ liệu Team mẫu.</p></div></section></div>;
  }

  function DiscView() {
    const savedDiscProfile = !usesLeadershipCheckpoint && discBadge
      ? content.discProfiles.find((item) => item.disc_type === discBadge) ?? null
      : null;
    const hasCompletedDisc = Boolean(discBadge);
    return (
      <div className="screen-enter module-page">
        <Hero
          eyebrow="TRẠM ĐĂNG KIỂM · SUPABASE"
          title={
            <>
              Hiểu mình.
              <br />
              <em>{usesLeadershipCheckpoint ? "Dẫn dắt đúng." : "Bán đúng."}</em>
            </>
          }
          description={usesLeadershipCheckpoint ? "Khám phá phong cách quản trị đội ngũ của bạn." : "Khám phá phong cách tạo ảnh hưởng của bạn."}
          icon={<ClipboardCheck size={54} />}
          label={usesLeadershipCheckpoint ? "LEADERSHIP CHECKPOINT" : "DISC CHECKPOINT"}
          className="disc-hero"
        />
        <ContentState
          loading={usesLeadershipCheckpoint ? leadershipTestLoading : loading}
          error={usesLeadershipCheckpoint ? leadershipTestError : contentSourceError("discQuestions")}
          empty={usesLeadershipCheckpoint ? !leadershipTest : !content.discQuestions.length}
          label="Trạm Đăng Kiểm"
          onRetry={() => void retryContentLibrary()}
        />
        <section className={`disc-launch lift-card ${hasCompletedDisc ? "disc-result-card" : ""}`} aria-label={hasCompletedDisc ? "Kết quả DISC đã lưu" : "Trạm Đăng Kiểm"}>
          <div>
            <span>{usesLeadershipCheckpoint ? `${leadershipTest?.questions.length ?? 0} CÂU · 2 PHÚT` : "5 CÂU · 2 PHÚT"}</span>
            <h2>
              {usesLeadershipCheckpoint
                ? savedLeadershipStyle
                  ? `Phong cách quản trị của bạn: ${leadershipTest?.results[savedLeadershipStyle]?.name ?? savedLeadershipStyle}`
                  : "Khám phá phong cách quản trị đội ngũ của bạn."
                : discBadge
                ? `Hồ sơ hiện tại: Nhóm ${discBadge}`
                : "Khám phá phong cách tạo ảnh hưởng của bạn."}
            </h2>
            <p>
              {usesLeadershipCheckpoint
                ? savedLeadershipStyle
                  ? savedLeadershipDescription
                  : "Trả lời theo phản xạ tự nhiên để nhận diện thế mạnh lãnh đạo; kết quả là tấm gương phát triển, không phải nhãn phán xét."
                : hasCompletedDisc
                  ? savedDiscProfile?.source_evidence ?? "Kết quả được lưu từ bài trắc nghiệm DISC của bạn."
                  : "Trả lời từng câu, nhận một la bàn gồm điểm mạnh, điểm cần cân bằng và phong cách tư vấn."}
            </p>
            {hasCompletedDisc && savedDiscProfile && discBadge && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <h3 className="text-xl font-black text-slate-900">{savedDiscProfile.headline} (Nhóm {discBadge})</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <article className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                    <h4 className="font-black">Điểm mạnh</h4>
                    <p className="mt-1 text-sm leading-6">{savedDiscProfile.strengths}</p>
                  </article>
                  <article className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
                    <h4 className="font-black">Điểm cần cân bằng</h4>
                    <p className="mt-1 text-sm leading-6">{savedDiscProfile.watch_out}</p>
                  </article>
                </div>
                <article className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                  <h4 className="font-black">Phong cách tư vấn</h4>
                  <p className="mt-1 text-sm leading-6">{savedDiscProfile.selling_style}</p>
                </article>
              </div>
            )}
            {usesLeadershipCheckpoint && savedLeadershipStyle && renderLeadershipValueAdd(savedLeadershipStyle)}
          </div>
          <button className={usesLeadershipCheckpoint && savedLeadershipStyle ? "text-xs font-black text-amber-700 underline decoration-amber-300 underline-offset-4 transition hover:text-amber-900" : "cta-glow"} onClick={startDisc}>
            {usesLeadershipCheckpoint && savedLeadershipStyle ? "Làm lại bài trắc nghiệm" : discBadge ? "Làm lại DISC" : "Bắt đầu trắc nghiệm"}
            <ArrowUpRight size={17} />
          </button>
        </section>
      </div>
    );
  }

  function CoverView() {
    return <TroLyThamDinh session={pilotSession} />;
  }

  function NewsView() {
    const isSuperAdmin = pilotSession?.profile.role === "super_admin";
    const visibleNews = content.news.filter(
      item =>
        newsSection === "all" ||
        (newsSection === "news" ? item.kind === "news" : item.kind === "case")
    );
    const sectionLabel =
      newsSection === "news"
        ? "BẢN TIN 90S"
        : newsSection === "case"
          ? "CASE STUDY THỰC CHIẾN"
          : "BẢN TIN 90S & CASE STUDY THỰC CHIẾN";
    return (
      <div className="screen-enter module-page">
        <Hero
          eyebrow={`${sectionLabel} · SUPABASE`}
          title={
            <>
              Đọc nhanh.
              <br />
              <em>Áp dụng sâu.</em>
            </>
          }
          description="Feed tín hiệu thị trường và case study từ Master Data — gọn như Threads, đậm tính thực chiến."
          icon={<Newspaper size={54} />}
          label="FIELD INTELLIGENCE"
          className="news-hero"
        />
        {isSuperAdmin && <div className="mb-5 flex justify-end"><InPlaceContentAdmin station={newsSection === "case" ? "case_studies" : "news_90s"} triggerLabel={newsSection === "case" ? "+ Thêm Case Study" : "+ Tạo Bản Tin"} onChanged={refreshInPlaceContent} /></div>}
        <div className="news-filter" aria-label="Lọc feed nội dung">
          <button
            className={newsSection === "all" ? "is-active" : ""}
            onClick={() => setNewsSection("all")}
          >
            Tất cả
          </button>
          <button
            className={newsSection === "news" ? "is-active" : ""}
            onClick={() => setNewsSection("news")}
          >
            Bản Tin 90s
          </button>
          <button
            className={newsSection === "case" ? "is-active" : ""}
            onClick={() => setNewsSection("case")}
          >
            Case Study Thực Chiến
          </button>
        </div>
        <ContentState
          loading={loading}
          error={contentSourceError("news")}
          empty={!visibleNews.length}
          label={sectionLabel}
          onRetry={() => void retryContentLibrary()}
        />
        <div className="news-feed">
          {visibleNews.map(item => (
            <article className="news-card lift-card group" key={item.code}>
              <div className="news-meta">
                <span>{item.category}</span>
                <time>
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString("vi-VN")
                    : ""}
                </time>
              </div>
              <h2>{item.title}</h2>
              <div className="news-summary">
                {item.summary
                  .split("\n")
                  .filter(Boolean)
                  .map(line => (
                    <p key={line}>{line.replace(/^-\s*/, "• ")}</p>
                  ))}
              </div>
              <div className="field-takeaway">
                <Lightbulb size={17} />
                <p>{item.field_takeaway.replace(/^👉\s*/, "")}</p>
              </div>
              {item.kind === "case" ? <CaseStudyVideo title={item.title} videoUrl={item.video_url} /> : item.video_url && <a href={item.video_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"><Video size={16} />Mở Short Video Thực chiến</a>}
              {isSuperAdmin && <div className="mt-3 flex justify-end"><InPlaceContentAdmin station={item.kind === "case" ? "case_studies" : "news_90s"} record={item.kind === "case" ? { id: item.code, title: item.title, context_problem: item.summary, lesson_learned: item.field_takeaway, video_url: item.video_url ?? "" } : { id: item.code, title: item.title, category: item.category, content: item.summary, insight_action: item.field_takeaway, video_url: item.video_url ?? "" }} onChanged={refreshInPlaceContent} compact /></div>}
            </article>
          ))}
        </div>
      </div>
    );
  }

  function CommunityView() {
    return (
      <TeamCommunityHub
        posts={communityPosts}
        leaderboard={communityLeaderboard}
        onPublish={async (draft, postType) => {
          const post = await createTeamCommunityPost(draft, postType);
          const reward = await awardAdvisorAction("community_post", post.id);
          const [posts, leaderboard] = await Promise.all([fetchTeamCommunityFeed(), fetchWeeklyTeamLeaderboard()]);
          setCommunityPosts(posts);
          setCommunityLeaderboard(leaderboard);
          if (reward?.awarded) toast.success(`Đã đăng bài và nhận +${reward.xpAmount} XP.`);
        }}
        onReact={async (postId, reaction) => {
          await toggleTeamCommunityReaction(postId, reaction);
          setCommunityPosts(await fetchTeamCommunityFeed());
        }}
        onComment={async (postId, body, parentCommentId) => {
          const comment = await createTeamCommunityComment(postId, body, parentCommentId);
          const reward = await awardAdvisorAction("community_comment", comment.id);
          const [posts, leaderboard] = await Promise.all([fetchTeamCommunityFeed(), fetchWeeklyTeamLeaderboard()]);
          setCommunityPosts(posts);
          setCommunityLeaderboard(leaderboard);
          if (reward?.awarded) toast.success(`Đã gửi lời động viên và nhận +${reward.xpAmount} XP.`);
        }}
        onToast={toast.success}
        onGiftXp={post => {
          setGratitudeRecipient(post.author);
          setGratitudeRecipientId(post.authorId);
          setGratitudePostId(post.id);
          setGratitudeOpen(true);
        }}
        onOpenGiftXp={() => setGratitudeOpen(true)}
        isSuperAdmin={pilotSession?.profile.role === "super_admin"}
        onDeletePost={async (postId) => {
          await deleteTeamCommunityPost(postId);
          setCommunityPosts(await fetchTeamCommunityFeed());
        }}
      />
    );
  }

  const CustomerJournalView = useMemo(
    () =>
      function CustomerJournalView() {
        return <Sprint11CrmHub onToast={toast.success} records={crmRecords} onCreate={async input => {
          await createPilotCrmJournal(input);
          setCrmRecords(await fetchPilotCrmJournals());
        }} onNavigate={openView} />;
      },
    [crmRecords]
  );

  function FeedbackView() {
    return (
      <div className="screen-enter module-page">
        <Hero
          eyebrow="GÓC LẮNG NGHE · SUPABASE"
          title={
            <>
              Nói thật.
              <br />
              <em>Xây tốt hơn.</em>
            </>
          }
          description="Góp ý được ghi vào Supabase. Đừng nhập tên, số điện thoại hoặc thông tin nhận diện của khách hàng."
          icon={<HeartHandshake size={54} />}
          label="ZERO-PII FEEDBACK"
          className="feedback-hero"
        />
        <form className="feedback-form lift-card" onSubmit={sendFeedback}>
          <div>
            <span>ĐÁNH GIÁ TRẢI NGHIỆM</span>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  type="button"
                  className={rating <= feedbackRating ? "is-active" : ""}
                  onClick={() => setFeedbackRating(rating)}
                  key={rating}
                >
                  <Trophy size={19} />
                  <small>{rating}</small>
                </button>
              ))}
            </div>
          </div>
          <label>
            Tính năng bạn thích nhất
            <select
              value={feedbackFeature}
              onChange={event => setFeedbackFeature(event.target.value)}
              required
            >
              <option value="">Chọn một tính năng</option>
              <option>Bảo Bối Thực Chiến</option>
              <option>Ngôn Ngữ Thấu Cảm</option>
              <option>Marketing 1-Chạm</option>
              <option>Trạm Đăng Kiểm</option>
              <option>Radar Giữ Quân</option>
            </select>
          </label>
          <label>
            Đề xuất phát triển <small>Không nhập PII khách hàng</small>
            <textarea
              value={feedbackSuggestion}
              onChange={event => setFeedbackSuggestion(event.target.value)}
              placeholder="Ví dụ: Thêm bộ lọc playbook theo tình huống…"
              maxLength={1000}
              required
            />
          </label>
          <button
            className="feedback-submit cta-glow"
            disabled={feedbackSaving}
          >
            {feedbackSaving ? "Đang gửi…" : "Gửi góp ý an toàn"}
            <Send size={17} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="command-app sprint-two-app sprint-three-app sprint-four-app sprint-five-app sprint-six-app">
      <aside className={`command-sidebar ${navOpen ? "is-open" : ""}`}>
        <div className="side-brand">
          <BrandMark className="side-logo" />
          <div>
            <strong>AGENT</strong>
            <span>COPILOT</span>
          </div>
          <button
            className="side-close"
            onClick={() => setNavOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="advisor-chip">
          <div className="advisor-avatar">{discBadge ?? "—"}</div>
          <div>
            <span>Hồ sơ Supabase</span>
            <strong>
              {discBadge ? `Nhóm DISC ${discBadge}` : "Chưa đồng bộ"}
            </strong>
          </div>
          <ChevronDown size={16} />
        </div>
        <nav className="primary-nav">
          {primaryNav.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${view === item.id ? "active" : ""}`}
                onClick={() => openView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === "radar" && userRole === "FREE" ? (
                  <LockKeyhole size={14} aria-label="Chỉ dành cho cấp Quản lý" />
                ) : view === item.id ? (
                  <i />
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="nav-caption">CÔNG CỤ BỔ TRỢ</div>
        <nav className="secondary-nav">
          {SECONDARY_NAV.filter(item => matchesSidebarRole(pilotSession?.profile.role, item.roles)).map(item => {
            const Icon = item.icon;
            const locked = item.id === "leader" && leaderPlaybookLocked;
            return (
              <button
                key={`${item.open}-${item.label}`}
                type="button"
                onClick={() => {
                  if (item.open === "leader") openLeaderPlaybook();
                  else if (item.open === "news") openNewsSection("news");
                  else if (item.open === "case") openNewsSection("case");
                  else openView(item.id);
                }}
                aria-disabled={locked || undefined}
                className={locked ? "cursor-not-allowed opacity-70" : ""}
              >
                <Icon size={15} />
                {item.label}
                {locked ? <LockKeyhole size={14} aria-label="Khóa La Bàn Lãnh Đạo" /> : <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>
        <div className="plan-card free-plan">
          <div className="plan-icon">
            <LockKeyhole size={15} />
          </div>
          <div>
            <span>{pilotSession ? "PILOT ACTIVE" : "GÓI KHỞI ĐỘNG"}</span>
            <strong>{pilotSession ? `Quyền ${pilotSession.profile.role}` : "Quyền từ Profile"}</strong>
          </div>
        </div>
      </aside>
      <main className="command-main">
        <header className="command-topbar">
          <button
            className="menu-button"
            onClick={() => setNavOpen(true)}
            aria-label="Mở menu"
          >
            <Menu size={20} />
          </button>
          <div className="mobile-brand">
            <BrandMark className="mobile-logo" />
            <span>{viewNames[view].toUpperCase()}</span>
          </div>
          <label className="search-box">
            <Search size={17} />
            <input placeholder="Tìm Bảo Bối, điều khoản…" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <PilotAuthControl
              session={pilotSession}
              error={pilotAuthError}
              userName={agentDisplayName}
              userAvatar={agentProfile.avatarUrl}
              onOpenProfileSettings={() => setAgentProfileSettingsOpen(true)}
              onSession={session => {
                setPilotSession(session);
                setPilotAuthError("");
                setPilotSessionHydrating(false);
                toast.success(`Đã vào Pilot với quyền ${session.profile.role}.`);
              }}
              onError={setPilotAuthError}
              onLoggedOut={() => {
                setPilotSession(null);
                setPilotAuthError("");
                setPilotSessionHydrating(false);
                setView("profile");
                toast.success("Đã đăng xuất Pilot.");
              }}
            />
            <TeamNameEditor onSaved={toast.success} onTeamNameChange={setTeamName} />
            <div className="relative group inline-block z-[100]">
              <button
                className="icon-button cta-hover relative p-2 rounded-full hover:bg-amber-100 transition"
                aria-label="Thông báo"
                aria-expanded={notificationOpen}
                onClick={() => {
                  setNotificationOpen((open) => !open);
                  if (!notificationOpen) void refreshNotifications().catch(() => undefined);
                }}
              >
                <Bell size={18} />
                {notifications.some((item) => !item.isRead) && <span className="absolute -right-1 -top-1 min-w-4 h-4 rounded-full bg-amber-500 px-1 text-[10px] font-extrabold leading-4 text-white">{Math.min(9, notifications.filter((item) => !item.isRead).length)}</span>}
              </button>
              <section className={`absolute top-full mt-2 right-0 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl transition-all duration-300 transform ${notificationOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"}`} aria-label="Trung tâm thông báo">
                <header className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
                  <div><p className="text-[10px] font-bold tracking-[0.14em] text-amber-700">LIVE NOTIFICATIONS</p><h3 className="text-sm font-extrabold text-slate-900">Thông báo của bạn</h3></div>
                  <button className="text-xs font-bold text-amber-700 hover:text-amber-800" onClick={() => void refreshNotifications().catch(() => undefined)}>Làm mới</button>
                </header>
                <div className="max-h-[24rem] overflow-y-auto">
                  {notificationLoading ? <p className="p-6 text-center text-slate-400">Đang đồng bộ thông báo…</p> : notifications.length ? notifications.map((item) => <button key={item.id} className={`flex w-full flex-col gap-1 border-b border-slate-100 p-4 text-left text-sm transition-colors last:border-0 hover:bg-slate-50 ${item.isRead ? "" : "bg-amber-50/70"}`} onClick={() => {
                    if (!item.isRead) {
                      setNotifications((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, isRead: true } : currentItem));
                      void markMyNotificationRead(item.id).catch(() => undefined);
                    }
                  }}>
                    <div className="flex items-start justify-between gap-3"><strong className="text-sm text-slate-900">{item.title}</strong>{!item.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />}</div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{item.body}</p>
                    <time className="mt-1.5 block text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</time>
                  </button>) : <div className="p-6 text-center text-slate-400">Chưa có thông báo nào</div>}
                </div>
              </section>
            </div>
            {/* Gamification moved to FloatingGamificationDock at root level. */}
            <button
              className={`profile-button ${managerMode ? "is-manager-pro" : ""}`}
              onClick={() => setManagerMode(current => !current)}
              aria-label="Chế Độ Quản Lý (PRO)"
              aria-pressed={managerMode}
            >
              <CircleUserRound size={21} />
              <span>Chế Độ Quản Lý (PRO)</span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <div className="dashboard-content">
          {view === "profile" && (pilotSessionHydrating ? <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">Đang xác minh quyền Pilot…</div> : pilotSession?.profile.role === "super_admin" ? <AdminHomeDashboard onNavigate={setView} onQuizBankChanged={() => { void fetchTodayDailyQuiz().then((quiz) => setContent((current) => ({ ...current, dailyQuizzes: quiz ? [quiz] : [] }))).catch(() => undefined); }} /> : pilotSession?.profile.role === "director" ? <LeadershipMatrixRadar role="director" /> : pilotSession?.profile.role === "leader" || pilotSession?.profile.role === "advisor" || !pilotSession ? <ProfileView /> : <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-900">Quyền Pilot chưa được định tuyến cho màn hình này. Vui lòng liên hệ Super Admin để kiểm tra phân quyền.</div>)}
          {view === "playbook" && <PlaybookView />}
          {view === "community" && <CommunityView />}
          {view === "customer_journal" && <CustomerJournalView />}
          {view === "radar" && <RadarView />}
          {view === "heartbeat" && <HeartbeatHierarchyPanel session={pilotSession} onLogNew={() => setLogOpen(true)} />}
          {view === "founder" && <><p className="pilot-helper-text founder-helper-text">Bảng điều khiển Động cơ. Bấm “Chạy Dry-run” để hệ thống quét và tạo Tín hiệu cho Leader.</p><FounderPilotOverview session={pilotSession} /><SuperAdminBusinessPanel session={pilotSession} /><UserManagementCMS session={pilotSession} /></>}
          {view === "marketing" && <MarketingView />}
          {view === "empathy" && <KnowledgeView kind="empathy" />}
          {view === "leader" && (
            pilotSessionHydrating ? (
              <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">Đang xác minh quyền truy cập La Bàn…</div>
            ) : leaderPlaybookLocked ? (
              <div className="flex items-center justify-center h-screen px-6">
                <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
                  <LockKeyhole className="mx-auto mb-4 text-slate-500" size={32} />
                  <h2 className="text-xl font-black text-slate-900">🔒 Tính năng này dành riêng cho cấp Quản lý (Leader).</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Tài khoản TVV không có quyền xem nội dung La Bàn Lãnh Đạo.</p>
                  <button type="button" onClick={() => openView("profile")} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700">Quay lại Trang chủ</button>
                </div>
              </div>
            ) : (
              <Sprint11LeaderCompass
                items={content.leadership}
                loading={loading}
                error={contentError}
                onOpenRoleplay={openLeaderRoleplay}
                isSuperAdmin={pilotSession?.profile.role === "super_admin"}
                onContentChanged={refreshInPlaceContent}
              />
            )
          )}
          {leaderRoleplayCard && <AIRoleplayStudio playbook={leaderRoleplayCard} onClose={() => setLeaderRoleplayScript(null)} />}
          {view === "disc" && <DiscView />}
          {view === "cover" && <CoverView />}
          {view === "news" && <NewsView />}
          {view === "feedback" && (pilotSession?.profile.role === "super_admin" ? <AdminFeedbackInbox /> : <PilotStep4FeedbackModule rating={feedbackRating} feature={feedbackFeature} suggestion={feedbackSuggestion} saving={feedbackSaving} onRatingChange={setFeedbackRating} onFeatureChange={setFeedbackFeature} onSuggestionChange={setFeedbackSuggestion} onSubmit={sendFeedback} />)}
        </div>
      </main>
      <FloatingGamificationDock
        xp={xpTotal}
        coins={pilotSession?.profile.role === "leader" ? Number(pilotSession.profile.xp_balance) : advisorCoins}
        onHonorClick={showLedger}
        onCoinsClick={() => {
          setRewardStoreTab("catalog");
          setXpStoreOpen(true);
        }}
      />
      <AgentMirrorModal
        open={agentMirrorOpen}
        onClose={() => setAgentMirrorOpen(false)}
      />
      <AgentMomentCelebrationModal
        isOpen={showCelebration}
        cardData={incomingRecognition ? { cardId: incomingRecognition.id, agentName: agentDisplayName, recognitionType: "leader", cardType: "recognition", rewardName: incomingRecognition.rewardName, leaderMessage: incomingRecognition.leaderMessage ?? undefined } : undefined}
        onClose={() => {
          setShowCelebration(false);
          setIncomingRecognition(null);
        }}
        onClaimReward={async () => {
          if (!incomingRecognition) return;
          const fulfilled = await claimRecognition(incomingRecognition.id);
          setAdvisorProgress((current) => ({
            total_xp: fulfilled.totalXp,
            current_streak: current?.current_streak ?? quizStreak ?? 0,
            coin_balance: fulfilled.coinBalance,
            completed_quiz_today: current?.completed_quiz_today ?? quizClaimed,
          }));
          if (fulfilled.rewardType === "xp") {
            toast.success(`+${fulfilled.amount} XP đã được cộng vào Ví Danh Dự.`);
          } else if (fulfilled.rewardType === "coins") {
            toast.success(`+${fulfilled.amount} Xu đã được cộng vào Kho Quà.`);
          } else if (fulfilled.rewardType === "none") {
            toast.success("Đã lưu Thẻ Vinh Danh vào hành trình của bạn.");
          } else {
            toast.success(`Đã thêm ${fulfilled.rewardName ?? "phần thưởng"} vào Kho Quà của bạn.`);
          }
          void refreshXpState().catch(() => undefined);
        }}
        onClaimError={(error) => toast.error(error instanceof Error ? error.message : "Không thể xác nhận nhận thưởng. Vui lòng thử lại.")}
      />
      <nav className="mobile-bottom">
        {primaryNav.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => openView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button onClick={() => openView("customer_journal")}>
          <CalendarClock size={18} />
          <span>Nhật Ký KH</span>
        </button>
        {pilotSession?.profile.role !== "super_admin" && <button onClick={() => setLogOpen(true)}>
          <Plus size={18} />
          <span>Nhịp Đập</span>
        </button>}
      </nav>
      {view === "profile" && pilotSession?.profile.role !== "super_admin" && (
        <button
          className="mobile-xp-ledger cta-hover"
          onClick={showLedger}
          aria-label="Mở Sổ cái XP"
        >
          <Zap size={16} />
          <span>Sổ cái XP</span>
        </button>
      )}
      {pilotSession?.profile.role !== "super_admin" && <button
        className="fab-log cta-glow fixed bottom-6 right-6 z-40"
        onClick={() => setLogOpen(true)}
        aria-label="Ghi Nhịp Đập Khách Hàng"
      >
        <Plus size={28} />
        <span>Ghi Nhịp Đập</span>
      </button>}

      {motivationMount &&
        createPortal(
          <DailyMotivationWidget teamName={teamName} />,
          motivationMount
        )}
      <AnimatePresence>
        {targetOpen && (
          <Sprint11TargetModal
            role={sprint11TargetRole}
            initialAdvisor={{
              bhntIncome: targetBhnt,
              pntIncome: targetPnt,
              bhntCommission: commissionRate,
              pntCommission,
              bhntContractSize: contractSize,
              pntContractSize,
            }}
            initialLeader={{
              personalIncome: playerCoachGoal.personalIncome,
              recruitmentOutreach: playerCoachGoal.recruitmentOutreach,
              activeRatePercent: playerCoachGoal.activeRatePercent,
              coachingSessions: playerCoachGoal.coachingSessions,
              xpBudget: playerCoachGoal.xpBudget,
              teamStreak7dMembers: playerCoachGoal.teamStreak7dMembers,
            }}
            teamDefaults={teamGoalDefaults}
            onClose={() => setTargetOpen(false)}
            onSave={saveSprint11Target}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {welcomeOpen && (
          <Modal onClose={dismissWelcome}>
            <section className="welcome-modal">
              <div className="welcome-mark">
                <BrandMark />
              </div>
              <span>LA BÀN KHỞI HÀNH</span>
              <h2>
                Chào mừng đến với
                <br />
                <em>Trợ lý số.</em>
              </h2>
              <p>
                Nơi không có áp lực KPI, chỉ có mục tiêu của chính bạn. Chúng ta
                bắt đầu bằng một hành động nhỏ, nhưng có ý nghĩa.
              </p>
              <div className="welcome-principles">
                <span>
                  <Target size={15} />
                  Mục tiêu tự chọn
                </span>
                <span>
                  <HandHeart size={15} />
                  Nhịp đi bền vững
                </span>
                <span>
                  <ShieldCheck size={15} />
                  Zero-PII
                </span>
              </div>
              <button className="cta-glow" onClick={dismissWelcome}>
                Bắt đầu khám phá <ArrowUpRight size={17} />
              </button>
            </section>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {discOpen && (
          <Modal onClose={requiresLeadershipOnboarding ? () => undefined : () => setDiscOpen(false)}>
            <section className="disc-modal disc-wizard">
              {!requiresLeadershipOnboarding && <button
                  className="store-close"
                  onClick={() => setDiscOpen(false)}
                >
                  <X size={20} />
                </button>}
              {usesLeadershipCheckpoint && leadershipIntroOpen && leadershipTest ? (
                <div className="disc-result">
                  <div className="disc-result-mark"><Compass size={25} /></div>
                  <span>LEADERSHIP CHECKPOINT</span>
                  <h2>{leadershipTest.intro_disclaimer.title}</h2>
                  <p>{leadershipTest.intro_disclaimer.content}</p>
                  <button className="target-save cta-glow" onClick={() => setLeadershipIntroOpen(false)}>
                    Tiếp tục trắc nghiệm <ArrowUpRight size={17} />
                  </button>
                </div>
              ) : usesLeadershipCheckpoint && leadershipResult && leadershipTest ? (
                <div className="disc-result">
                  <div className="disc-result-mark"><Trophy size={25} /></div>
                  <span>PHONG CÁCH LÃNH ĐẠO ĐÃ MỞ KHÓA</span>
                  <h2>{leadershipTest.results[leadershipResult].name}</h2>
                  <p>{leadershipTest.results[leadershipResult].description}</p>
                  <div className="disc-insights">
                    <article><strong>Phong cách nổi trội</strong><p>{leadershipResult}</p></article>
                    <article><strong>Gợi ý ứng dụng</strong><p>Hãy dùng thế mạnh này linh hoạt theo nhu cầu của từng TVV và bối cảnh của đội ngũ.</p></article>
                    <article><strong>Ghi nhớ</strong><p>Kết quả là tấm gương để phát triển, không phải nhãn phán xét hay giới hạn khả năng dẫn dắt của bạn.</p></article>
                  </div>
                  {renderLeadershipValueAdd(leadershipResult)}
                  <button
                    className="target-save cta-glow"
                    disabled={requiresLeadershipOnboarding && leadershipSaving}
                    onClick={() => {
                      if (requiresLeadershipOnboarding) {
                        if (leadershipResult) void persistLeadershipResult(leadershipResult);
                        return;
                      }
                      setDiscOpen(false);
                    }}
                  >
                    {requiresLeadershipOnboarding ? leadershipSaving ? "Đang lưu kết quả..." : "Lưu kết quả để tiếp tục" : "Hoàn tất"} <Check size={17} />
                  </button>
                </div>
              ) : usesLeadershipCheckpoint && currentLeadershipQuestion && leadershipTest ? (
                <>
                  <div className="disc-wizard-head">
                    <span>CÂU {leadershipStep + 1} / {leadershipTest.questions.length}</span>
                    <div><motion.i animate={{ width: `${((leadershipStep + 1) / leadershipTest.questions.length) * 100}%` }} /></div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.section
                      className="disc-question-card"
                      key={`leadership-${currentLeadershipQuestion.id}`}
                      initial={{ opacity: 0, x: 34 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -34 }}
                      transition={{ duration: 0.22 }}
                    >
                      <span>CHỌN PHẢN XẠ LÃNH ĐẠO TỰ NHIÊN NHẤT</span>
                      <h2>{currentLeadershipQuestion.scenario}</h2>
                      <p>Mỗi lựa chọn phản chiếu một thế mạnh tự nhiên trong cách bạn dẫn dắt đội ngũ.</p>
                      <div className="disc-options">
                        {currentLeadershipQuestion.options.map((option) => (
                          <button
                            type="button"
                            key={`${currentLeadershipQuestion.id}-${option.trait}`}
                            className={leadershipAnswers[currentLeadershipQuestion.id] === option.trait ? "is-picked" : ""}
                            onClick={() => void chooseLeadershipAnswer(option.trait)}
                          >
                            <b>{option.trait.slice(0, 1)}</b>
                            <span>{option.text}</span>
                            <ChevronRight size={17} />
                          </button>
                        ))}
                      </div>
                    </motion.section>
                  </AnimatePresence>
                </>
              ) : discResult ? (
                (() => {
                  const profile = content.discProfiles.find(
                    item => item.disc_type === discResult
                  );
                  return profile ? (
                    <div className="disc-result">
                      <div className="disc-result-mark">
                        <Trophy size={25} />
                      </div>
                      <span>HỒ SƠ DISC ĐÃ MỞ KHÓA</span>
                      <h2>
                        Nhóm {discResult}: {profile.headline}
                      </h2>
                      <p>
                        Đây là la bàn để bạn chọn cách mở cuộc trò chuyện, không
                        phải một nhãn để tự giới hạn mình.
                      </p>
                      <div className="disc-insights">
                        <article>
                          <strong>Điểm mạnh</strong>
                          <p>{profile.strengths}</p>
                        </article>
                        <article>
                          <strong>Điểm cần cân bằng</strong>
                          <p>{profile.watch_out}</p>
                        </article>
                        <article>
                          <strong>Phong cách tư vấn</strong>
                          <p>{profile.selling_style}</p>
                        </article>
                      </div>
                      <small>Nguồn diễn giải: {profile.source_evidence}</small>
                      <button
                        className="target-save cta-glow"
                        onClick={() => setDiscOpen(false)}
                      >
                        Hoàn tất <Check size={17} />
                      </button>
                    </div>
                  ) : (
                    <ContentState
                      loading={loading}
                      error={contentError}
                      empty
                      label="hồ sơ DISC"
                    />
                  );
                })()
              ) : currentDiscQuestion ? (
                <>
                  <div className="disc-wizard-head">
                    <span>
                      CÂU {discStep + 1} / {content.discQuestions.length}
                    </span>
                    <div>
                      <motion.i
                        animate={{
                          width: `${((discStep + 1) / content.discQuestions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.section
                      className="disc-question-card"
                      key={currentDiscQuestion.code}
                      initial={{ opacity: 0, x: 34 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -34 }}
                      transition={{ duration: 0.22 }}
                    >
                      <span>CHỌN PHẢN XẠ TỰ NHIÊN NHẤT</span>
                      <h2>
                        {currentDiscQuestion.question.replace(/^\d+\.\s*/, "")}
                      </h2>
                      <p>
                        Mỗi lựa chọn sẽ mở ra một góc nhìn đúng với phong cách
                        tư vấn của bạn.
                      </p>
                      <div className="disc-options">
                        {(["D", "I", "S", "C"] as DiscType[]).map(type => (
                          <button
                            type="button"
                            key={type}
                            className={
                              discAnswers[currentDiscQuestion.code] === type
                                ? "is-picked"
                                : ""
                            }
                            onClick={() => chooseDiscAnswer(type)}
                          >
                            <b>{type}</b>
                            <span>
                              {
                                currentDiscQuestion[
                                  `option_${type.toLowerCase()}` as "option_d"
                                ]
                              }
                            </span>
                            <ChevronRight size={17} />
                          </button>
                        ))}
                      </div>
                    </motion.section>
                  </AnimatePresence>
                </>
              ) : (
                <ContentState
                  loading={loading}
                  error={contentError}
                  empty
                  label="câu hỏi DISC"
                />
              )}
            </section>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dailyPushOpen && dailyQuiz && (
          <Modal onClose={() => setDailyPushOpen(false)}>
            <section className="relative w-[min(92vw,34rem)] rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8" aria-label="Nạp Não Mỗi Sáng">
              <button type="button" onClick={() => setDailyPushOpen(false)} aria-label="Đóng Nạp Não Mỗi Sáng" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
              <div className="flex items-start gap-3 pr-8"><span className="rounded-2xl bg-amber-100 p-3 text-amber-700"><Lightbulb size={23} /></span><div><span className="text-[10px] font-black tracking-[0.16em] text-amber-700">NẠP NÃO MỖI SÁNG · HÔM NAY</span><h2 className="mt-1 text-2xl font-black tracking-tight">Phản xạ 60 giây · <em className="not-italic text-amber-600">+{dailyQuiz.xp_reward} XP</em></h2></div></div>
              <p className="mt-5 text-base font-bold leading-7 text-slate-800">{dailyQuiz.question}</p>
              <div className="mt-5 grid gap-2">{[{ id: "A", text: dailyQuiz.option_a }, { id: "B", text: dailyQuiz.option_b }, { id: "C", text: dailyQuiz.option_c }].map((choice) => <button type="button" key={choice.id} disabled={quizSaving || quizDone} onClick={() => void answerQuiz(choice.id)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-70"><b className="mr-2 text-amber-700">{choice.id}.</b>{choice.text}</button>)}</div>
              {quizDone && <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><b>{quizClaimed ? `Đã ghi nhận +${dailyQuiz.xp_reward} XP.` : "Bạn đã hoàn thành nội dung hôm nay."}</b><br />{dailyQuiz.explanation}</div>}
              <button type="button" onClick={() => setDailyPushOpen(false)} className="mt-5 text-sm font-bold text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline">Bỏ qua hôm nay</button>
            </section>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {xpOpen && (
          <Modal onClose={() => setXpOpen(false)}>
            <section className="ledger-modal">
              <button className="store-close" onClick={() => setXpOpen(false)}>
                <X size={20} />
              </button>
              <span>NGÂN HÀNG ĐIỂM · SUPABASE</span>
              <h2>Sổ cái XP thông minh</h2>
              <p>
                Chỉ hiển thị giao dịch thuộc tài khoản Supabase đang đăng nhập.
              </p>
              <div className="ledger-total">
                <Zap size={22} />
                <strong>
                  <AnimatedNumber value={ledgerTotal} /> XP
                </strong>
                {pilotSession?.profile.role === "leader" && <small>Quỹ Leader khả dụng</small>}
                <button
                  className="ledger-store-cta cta-hover"
                  onClick={() => setXpStoreOpen(true)}
                >
                  <Sparkles size={15} />
                  Trạm Tiếp Năng Lượng
                </button>
              </div>
              {xpLoading ? (
                <ContentState
                  loading
                  error=""
                  empty={false}
                  label="XP Ledger"
                />
              ) : (
                <div className="ledger-table">
                  <div className="ledger-row ledger-head">
                    <span>Ngày giờ</span>
                    <span>Lý do</span>
                    <span>XP</span>
                  </div>
                  {xpEntries.length ? (
                    xpEntries.map(entry => (
                      <div className="ledger-row" key={entry.transaction_id}>
                        <time>
                          {new Date(entry.created_at).toLocaleString("vi-VN")}
                        </time>
                        <span>{entry.description?.trim() || entry.reason.replaceAll("_", " ")}</span>
                        <b
                          className={
                            entry.xp_amount > 0 ? "is-plus" : "is-minus"
                          }
                        >
                          {entry.xp_amount > 0 ? "+" : ""}
                          {entry.xp_amount}
                        </b>
                      </div>
                    ))
                  ) : (
                    <div className="ledger-empty">
                      <Landmark size={22} />
                      <p>Chưa có giao dịch XP cho hồ sơ đã xác thực.</p>
                    </div>
                  )}
                </div>
              )}
              {pilotSession?.profile.role === "leader" && <O2OLeaderRewards session={pilotSession} onToast={toast.success} />}
            </section>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {xpStoreOpen && (
          <Modal onClose={() => setXpStoreOpen(false)}>
            <section className="energy-store-modal">
              <button
                className="store-close"
                onClick={() => setXpStoreOpen(false)}
              >
                <X size={20} />
              </button>
              <span>7_TRẠM TIẾP NĂNG LƯỢNG · SUPABASE</span>
              <h2>
                Đổi năng lượng
                <br />
                <em>cho hành trình dài.</em>
              </h2>
              <p>Quà tặng được đọc trực tiếp từ Master Data. XP được khấu trừ ngay khi yêu cầu đổi quà được ghi nhận.</p>
              <div className="energy-balance">
                <Zap size={20} />
                <strong>
                  <AnimatedNumber value={xpTotal} /> XP hiện có
                </strong>
              </div>
              <div className="mb-4 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-bold">
                <button type="button" className={`rounded-lg px-3 py-2 transition-colors ${rewardStoreTab === "catalog" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`} onClick={() => setRewardStoreTab("catalog")}>Đổi quà</button>
                <button type="button" className={`rounded-lg px-3 py-2 transition-colors ${rewardStoreTab === "mine" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`} onClick={() => { setRewardStoreTab("mine"); void refreshRewardRedemptions().catch(() => undefined); }}>Kho Quà Của Tôi</button>
              </div>
              {rewardStoreTab === "catalog" ? <><ContentState loading={loading} error={contentError} empty={!content.xpRewards.length} label="quà tặng" />
              <div className="reward-list">
                {content.xpRewards.map(reward => {
                  const canRedeem = Number(xpTotal) >= Number(reward.xp_cost);
                  return <article className={`reward-card ${canRedeem ? "is-available" : ""}`} key={reward.code}>
                    <div className="reward-mark"><Trophy size={20} /></div>
                    <div><span>{reward.reward_type} · {reward.status}</span><h3>{reward.name}</h3><p><strong>{money.format(reward.xp_cost)} XP</strong> để đổi</p></div>
                    <button className="copy-button cta-hover" type="button" onClick={() => void redeemReward(reward)} disabled={reward.status !== "Hoạt động" || redeemingRewardCode !== null}>{redeemingRewardCode === reward.code ? "Đang đổi…" : "Đổi quà"}</button>
                  </article>;
                })}
              </div></> : <section className="space-y-3" aria-label="Kho quà của tôi">
                {rewardRedemptionsLoading ? <p className="py-6 text-center text-sm text-slate-500">Đang tải Kho Quà…</p> : rewardRedemptions.length ? <div className="w-full grid grid-cols-1 gap-8 py-6">
                  {rewardRedemptions.map((redemption) => {
                    const cardId = `agent-moment-${redemption.id}`;
                    const recognitionType = rewardShareMode === "hidden"
                      ? "personal"
                      : rewardShareMode === "leader"
                        ? "leader"
                        : "team";
                    return <MomentShareScreen
                      key={redemption.id}
                      cardProps={{
                        cardId,
                        theme: "default",
                        momentBadgeText: "AGENT MOMENT™",
                        heroTitleTop: "BẠN ĐÃ",
                        heroTitleGold: "MỞ KHÓA",
                        heroTitleBottom: "MỘT PHẦN THƯỞNG",
                        heroDescription: "Hành trình nhỏ hôm nay, tạo nên bạn tốt hơn ngày mai.",
                        agentName: agentDisplayName,
                        agentAvatar: agentProfile.avatarUrl,
                        recognitionType,
                        teamName,
                        rewardName: redemption.rewardName || "01 Cốc Cafe Starbucks",
                        rewardValueText: "Phần thưởng",
                        quoteText: "Không phải ngày nào cũng phải bứt phá. Quan trọng là mình đã không bỏ cuộc.",
                      }}
                      rewardShareMode={rewardShareMode}
                      onRewardShareModeChange={setRewardShareMode}
                      onDownload={() => downloadAgentMoment(cardId, redemption.rewardName)}
                    />;
                  })}
                </div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Kho quà đang trống. Đổi một phần thưởng để Agent Moment xuất hiện tại đây.</div>}
              </section>}
              <TeamContestPanel
                managerMode={pilotManager}
                onToast={toast.success}
                contests={teamContests}
                onPersistContest={async draft => {
                  await createTeamContest(draft);
                  setTeamContests(await fetchTeamContests());
                }}
              />
            </section>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {voucherRedemption && <Modal onClose={() => setVoucherRedemption(null)}>
          <section className="w-[min(92vw,28rem)]" aria-label="Pride Voucher">
            <div className="relative mx-auto my-4 max-w-sm transform overflow-hidden rounded-3xl border-4 border-dashed border-white/40 bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-xl transition hover:scale-105">
              <Trophy className="absolute right-0 top-0 p-4 text-white opacity-20" size={80} />
              <button className="absolute right-4 top-4 z-10 rounded-full p-1 text-white/90 transition hover:bg-white/15" onClick={() => setVoucherRedemption(null)} aria-label="Đóng voucher"><X size={19} /></button>
              <div className="relative z-10 mb-5 text-center">
                <span className="mb-3 inline-block rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-900 shadow-sm">Chứng nhận xuất sắc</span>
                <h3 className="text-2xl font-black leading-tight drop-shadow-md">{voucherRedemption.rewardName}</h3>
              </div>
              <p className="relative z-10 mb-5 rounded-xl bg-black/15 p-3 text-center text-xs font-medium backdrop-blur-sm">Hãy chụp màn hình Voucher này và gửi cho Leader để nhận quà nhé!</p>
              <div className="relative z-10 rounded-xl bg-white px-4 py-3 text-center text-lg font-black uppercase tracking-wide text-slate-900 shadow-inner">{voucherRedemption.status === "fulfilled" ? "✅ Đã Sử Dụng" : "⏳ Chờ Sếp Phát Quà"}</div>
            </div>
          </section>
        </Modal>}
      </AnimatePresence>
      {leaderMomentCreatorOpen && <LeaderMomentCreator
        agentName={leaderMomentAgentName || "TVV trong đội"}
        onClose={() => { setLeaderMomentCreatorOpen(false); setLeaderMomentRecipientId(null); }}
        onSubmit={async ({ tone, message, rewardName }) => {
          if (!leaderMomentRecipientId) {
            toast.error("Không xác định được TVV nhận Thẻ Vinh Danh.");
            return;
          }
          try {
            await createTeamRecognition({ receiverId: leaderMomentRecipientId, rewardName, leaderMessage: message || `Leader gửi lời vinh danh theo tone ${tone}.` });
            setLeaderMomentCreatorOpen(false);
            setLeaderMomentRecipientId(null);
            toast.success(`Đã gửi Thẻ Vinh Danh ${tone} đến ${leaderMomentAgentName}.`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể gửi Thẻ Vinh Danh. Vui lòng thử lại.");
          }
        }}
      />}
      {agentProfileSettingsOpen && <AgentProfileSettings
        initialAvatarId={agentProfile.avatarId}
        initialAvatarUrl={agentProfile.avatarUrl}
        initialName={agentDisplayName}
        onClose={() => setAgentProfileSettingsOpen(false)}
        onSave={(profile) => {
          const key = `agent-copilot-profile-preferences-${pilotSession?.userId ?? "guest"}`;
          window.localStorage.setItem(key, JSON.stringify(profile));
          setAgentProfile(profile);
          setAgentProfileSettingsOpen(false);
          toast.success("Đã lưu Người Đồng Hành cho hành trình của bạn.");
        }}
      />}
      <AgentStreakDetailsModal
        isOpen={streakDetailsOpen}
        currentStreak={currentStreakDays}
        milestones={streakMilestones}
        claimedMilestoneIds={streakClaims.map((claim) => claim.milestoneId)}
        claimingMilestoneId={claimingStreakMilestoneId}
        onClaimMilestone={(milestoneId) => {
          const milestone = streakMilestones.find((item) => item.id === milestoneId);
          if (milestone) void handleClaimStreakMilestone(milestone);
        }}
        onClose={() => setStreakDetailsOpen(false)}
      />
      <AnimatePresence>
        {logOpen && (
          <Sprint10LogModal
            content={content}
            logLevel={logLevel}
            serviceLevelPreview={serviceLevelPreview}
            logAction={logAction}
            customerJourney={logCustomerJourney}
            followUp={followUp}
            revenue={revenue}
            journalStory={journalStory}
            journalPublic={journalPublic}
            activeLearningChallenge={activeLearningChallenge}
            proofOfWork={logUsesLearningChallenge}
            saving={logSaving}
            onClose={() => setLogOpen(false)}
            onSubmit={submitLog}
            onLevelChange={level => {
              setLogLevel(level);
              setServiceLevelPreview(level);
            }}
            onPreviewLevel={setServiceLevelPreview}
            onActionChange={setLogAction}
            onJourneyChange={setLogCustomerJourney}
            onFollowUpChange={setFollowUp}
            onRevenueChange={setRevenue}
            onJournalChange={setJournalStory}
            onJournalVisibilityChange={setJournalPublic}
            onProofOfWorkChange={setLogUsesLearningChallenge}
          />
        )}
      </AnimatePresence>
      <GlobalGiftXpModal
        open={gratitudeOpen}
        session={pilotSession}
        onClose={() => setGratitudeOpen(false)}
        onCompleted={(gift) => {
          setPilotSession((current) => current && current.profile.role !== "advisor" ? { ...current, profile: { ...current.profile, xp_balance: gift.giverRemainingXpBudget } } : current);
          void Promise.all([refreshXpState(), fetchTeamCommunityFeed(), fetchWeeklyTeamLeaderboard()]).then(([, posts, leaderboard]) => {
            setCommunityPosts(posts);
            setCommunityLeaderboard(leaderboard);
          });
            toast.success("Đã ghi nhận Gift XP theo quỹ Team.");
        }}
      />
      <AdvisorQuickGuide
        session={gratitudeOpen ? null : pilotSession}
        onCompleted={(completedAt) => setPilotSession((current) => current ? { ...current, profile: { ...current.profile, onboarding_completed_at: completedAt } } : current)}
      />
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="store-backdrop sprint6-backdrop"
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        onMouseDown={event => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function TeamNameEditor({
  onSaved,
  onTeamNameChange,
}: {
  onSaved: (message: string) => void;
  onTeamNameChange: (name: string) => void;
}) {
  const [teamName, setTeamName] = useState(() =>
    typeof window === "undefined"
      ? "Agent Copilot"
      : localStorage.getItem("agent-copilot-team-name") || "Agent Copilot"
  );
  const [draft, setDraft] = useState(teamName);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.teamName = teamName;
    window.dispatchEvent(new Event("agent-copilot-team-change"));
  }, [teamName]);
  const save = () => {
    const next = draft.trim() || "Agent Copilot";
    setTeamName(next);
    setDraft(next);
    localStorage.setItem("agent-copilot-team-name", next);
    document.documentElement.dataset.teamName = next;
    onTeamNameChange(next);
    setEditing(false);
    onSaved(`Đã đổi tên Team thành ${next}.`);
  };
  const cancel = () => {
    setDraft(teamName);
    setEditing(false);
  };
  return (
    <div className="team-brand-control">
      <button
        onClick={() => {
          setDraft(teamName);
          setEditing(true);
        }}
        aria-label="Đổi tên Team"
      >
        <Users size={15} />
        <span>{teamName}</span>
      </button>
      {editing && (
        <input
          autoFocus
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onBlur={save}
          onKeyDown={event => {
            if (
              [
                "ArrowUp",
                "ArrowDown",
                "PageUp",
                "PageDown",
                "Home",
                "End",
                " ",
              ].includes(event.key)
            )
              event.stopPropagation();
            if (event.key === "Escape") {
              event.preventDefault();
              cancel();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            }
          }}
          aria-label="Tên Team"
        />
      )}
    </div>
  );
}

function IncomeTargetModal({
  targetBhntDraft,
  targetPntDraft,
  commissionRateDraft,
  contractSizeDraft,
  advisorRank,
  earnedIncome,
  onBhntChange,
  onPntChange,
  onCommissionChange,
  onContractSizeChange,
  onRankChange,
  onClose,
  onSave,
}: {
  targetBhntDraft: string;
  targetPntDraft: string;
  commissionRateDraft: string;
  contractSizeDraft: string;
  advisorRank: AdvisorRank;
  earnedIncome: number;
  onBhntChange: (value: string) => void;
  onPntChange: (value: string) => void;
  onCommissionChange: (value: string) => void;
  onContractSizeChange: (value: string) => void;
  onRankChange: (value: AdvisorRank) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const income =
    (Number(targetBhntDraft || 0) + Number(targetPntDraft || 0)) * 1_000_000;
  const plan = calculateIncomeMeetingPlan({
    targetIncome: income,
    commissionRatePercent: Number(commissionRateDraft || 0),
    averageContractSize: Number(contractSizeDraft || 0) * 1_000_000,
  });
  const numeric =
    (setValue: (value: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setValue(event.target.value.replace(/[^0-9]/g, ""));
  return (
    <Modal onClose={onClose}>
      <section className="target-modal sprint10-target-modal">
        <button className="store-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="target-modal-icon">
          <Target size={25} />
        </div>
        <span>MỤC TIÊU THÁNG · SPRINT 10</span>
        <h2>
          Tháng này, bạn muốn
          <br />
          <em>chinh phục mức thu nhập bao nhiêu?</em>
        </h2>
        <p>
          Copilot tính ngược từ mức thu nhập mong muốn, hoa hồng thực nhận và
          size hợp đồng trung bình — không còn con số cuộc gặp phi thực tế.
        </p>
        <div className="target-source-grid">
          <label>
            Mục tiêu BHNT (triệu VNĐ)
            <input
              inputMode="numeric"
              value={targetBhntDraft}
              onChange={numeric(onBhntChange)}
              placeholder="VD: 30"
            />
          </label>
          <label>
            Mục tiêu PNT (triệu VNĐ)
            <input
              inputMode="numeric"
              value={targetPntDraft}
              onChange={numeric(onPntChange)}
              placeholder="VD: 10"
            />
          </label>
        </div>
        <div className="target-source-grid">
          <label>
            Hoa hồng dự kiến (%)
            <input
              inputMode="numeric"
              value={commissionRateDraft}
              onChange={numeric(onCommissionChange)}
              placeholder="VD: 40"
            />
          </label>
          <label>
            Size HĐ trung bình (triệu VNĐ)
            <input
              inputMode="numeric"
              value={contractSizeDraft}
              onChange={numeric(onContractSizeChange)}
              placeholder="VD: 25"
            />
          </label>
        </div>
        <label className="target-rank-field">
          Cấp bậc TVV
          <select
            className="target-rank-select"
            value={advisorRank}
            onChange={event => onRankChange(event.target.value as AdvisorRank)}
          >
            {Object.entries(rankProfiles).map(([key, profile]) => (
              <option value={key} key={key}>
                {profile.label}
              </option>
            ))}
          </select>
        </label>
        <div className="target-rate-note">
          <b>{plan.requiredContracts || "—"} HĐ dự kiến</b> ·{" "}
          {plan.requiredMeetings || "—"} cuộc gặp (1 khám phá + tối đa 2 chạm
          theo mỗi HĐ) · {commissionRateDraft || 0}% hoa hồng.
        </div>
        <div className="target-impact">
          <div>
            <span>Tổng mục tiêu</span>
            <strong>{money.format(income / 1_000_000)} triệu</strong>
          </div>
          <div>
            <span>Đã đạt</span>
            <strong>{money.format(earnedIncome / 1_000_000)} triệu</strong>
          </div>
        </div>
        <button className="target-save cta-glow" onClick={onSave}>
          Lưu & Tính lại phễu <ArrowUpRight size={17} />
        </button>
      </section>
    </Modal>
  );
}

type Sprint10LogAction =
  | "Ký Hợp Đồng"
  | "Dời lịch"
  | "Từ chối"
  | "Đã gặp & Đang bám sát";

export function Sprint10LogModal({
  content,
  logLevel,
  serviceLevelPreview,
  logAction,
  customerJourney,
  followUp,
  revenue,
  journalStory,
  journalPublic,
  activeLearningChallenge,
  proofOfWork,
  saving,
  onClose,
  onSubmit,
  onLevelChange,
  onPreviewLevel,
  onActionChange,
  onJourneyChange,
  onFollowUpChange,
  onRevenueChange,
  onJournalChange,
  onJournalVisibilityChange,
  onProofOfWorkChange,
}: {
  content: OperationalLibrary;
  logLevel: number;
  serviceLevelPreview: number;
  logAction: Sprint10LogAction;
  customerJourney: "pre_sale" | "post_sale";
  followUp: string;
  revenue: string;
  journalStory: string;
  journalPublic: boolean;
  activeLearningChallenge: ActiveLearningChallenge | null;
  proofOfWork: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onLevelChange: (level: number) => void;
  onPreviewLevel: (level: number) => void;
  onActionChange: (action: Sprint10LogAction) => void;
  onJourneyChange: (journey: "pre_sale" | "post_sale") => void;
  onFollowUpChange: (value: string) => void;
  onRevenueChange: (value: string) => void;
  onJournalChange: (value: string) => void;
  onJournalVisibilityChange: (value: boolean) => void;
  onProofOfWorkChange: (value: boolean) => void;
}) {
  const currentServiceLevel = content.serviceLevels.find(
    item => item.level === serviceLevelPreview
  );
  const journeyHint =
    customerJourney === "pre_sale"
      ? "Gợi ý thấu cảm: hỏi về điều khách muốn bảo vệ và trao quyền chọn nhịp trao đổi tiếp theo."
      : "Gợi ý thấu cảm: kiểm tra trải nghiệm quyền lợi, lắng nghe thay đổi cuộc sống và hẹn một chạm chăm sóc rõ ràng.";
  return (
    <Modal onClose={onClose}>
      <form className="log-modal sprint10-log-modal" onSubmit={onSubmit}>
        <button type="button" className="store-close" onClick={onClose}>
          <X size={20} />
        </button>
        <span>NHỊP ĐẬP KHÁCH HÀNG · ZERO-PII</span>
        <h2>
          Ghi một hành động,
          <br />
          <em>giữ nhịp một ngày.</em>
        </h2>
        <p>Không nhập tên, SĐT, email hay nội dung nhận diện khách hàng.</p>
        <div
          className="log-journey-toggle"
          role="group"
          aria-label="Bối cảnh khách hàng"
        >
          <button
            type="button"
            className={customerJourney === "pre_sale" ? "is-active" : ""}
            onClick={() => onJourneyChange("pre_sale")}
          >
            Khách Hàng Mới
            <br />
            <small>Trước Bán</small>
          </button>
          <button
            type="button"
            className={customerJourney === "post_sale" ? "is-active" : ""}
            onClick={() => onJourneyChange("post_sale")}
          >
            Khách Hiện Hữu
            <br />
            <small>Sau Bán</small>
          </button>
        </div>
        <aside className="log-empathy-hint">
          <Lightbulb size={18} />
          <p>{journeyHint}</p>
        </aside>
        <label>
          Cấp độ dịch vụ{" "}
          <div className="level-picker">
            {content.serviceLevels.map(item => (
              <button
                type="button"
                className={logLevel === item.level ? "is-selected" : ""}
                onMouseEnter={() => onPreviewLevel(item.level)}
                onFocus={() => onPreviewLevel(item.level)}
                onClick={() => onLevelChange(item.level)}
                key={item.level}
              >
                <b>{item.level}</b>
                <small>{item.label.split("—")[0].trim()}</small>
              </button>
            ))}
          </div>
        </label>
        {currentServiceLevel && (
          <aside className="service-level-explainer">
            <div>
              <span>CẤP {currentServiceLevel.level}</span>
              <strong>{currentServiceLevel.label}</strong>
            </div>
            <p>{currentServiceLevel.description}</p>
            <small>{currentServiceLevel.coaching_hint}</small>
          </aside>
        )}
        <label>
          Kết quả cuộc gặp
          <select
            value={logAction}
            onChange={event =>
              onActionChange(event.target.value as Sprint10LogAction)
            }
          >
            <option>Ký Hợp Đồng</option>
            <option>Dời lịch</option>
            <option>Từ chối</option>
            <option>Đã gặp & Đang bám sát</option>
          </select>
        </label>
        {logAction === "Dời lịch" && (
          <label className="followup-required">
            Ngày Follow-up <small>Bắt buộc khi Dời lịch</small>
            <input
              type="date"
              value={followUp}
              onChange={event => onFollowUpChange(event.target.value)}
              required
            />
          </label>
        )}
        <label>
          Doanh thu mang về (VNĐ)
          <input
            inputMode="numeric"
            value={revenue}
            onChange={event =>
              onRevenueChange(event.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="0"
          />
        </label>
        <JournalFields
          value={journalStory}
          onChange={onJournalChange}
          isPublic={journalPublic}
          onVisibilityChange={onJournalVisibilityChange}
        />
        {activeLearningChallenge && <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3"><label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={proofOfWork} onChange={(event) => onProofOfWorkChange(event.target.checked)} className="h-5 w-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500" /><span><b className="block text-sm text-indigo-900">Tôi đã áp dụng bài học/thử thách hôm nay</b><small className="block text-[10px] text-indigo-600">Đính kèm “{activeLearningChallenge.playbookTitle}” vào ca thực chiến này (+50 XP).</small></span></label></div>}
        <button className="target-save cta-glow" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu Nhịp Đập"}
          <Check size={17} />
        </button>
      </form>
    </Modal>
  );
}

function GratitudePanel({
  value,
  recipient,
  onValueChange,
  onRecipientChange,
  onClose,
  onSubmit,
}: {
  value: string;
  recipient: string;
  onValueChange: (value: string) => void;
  onRecipientChange: (recipient: string) => void;
  onClose: () => void;
  onSubmit: (amount: string) => void;
}) {
  const [amount, setAmount] = useState("20");
  return (
    <Modal onClose={onClose}>
      <section className="gratitude-modal">
        <button className="store-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="gratitude-icon">
          <HeartHandshake size={24} />
        </div>
        <span>TẶNG ĐIỂM BIẾT ƠN · DEMO</span>
        <h2>
          Ghi nhận
          <br />
          <em>một người đồng đội.</em>
        </h2>
        <p>
          Tùy chỉnh điểm biết ơn hoặc thưởng nóng cho đồng đội. Đây là thử
          nghiệm social, không trừ XP thật.
        </p>
        <label>
          Tặng cho
          <select
            value={recipient}
            onChange={event => onRecipientChange(event.target.value)}
          >
            <option>Thu Hà</option>
            <option>Minh Tuấn</option>
            <option>Ngân</option>
          </select>
        </label>
        <label>
          Số XP muốn tặng
          <input
            inputMode="numeric"
            value={amount}
            onChange={event =>
              setAmount(event.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="VD: 50"
          />
        </label>
        <label>
          Lời cảm ơn
          <textarea
            value={value}
            onChange={event => onValueChange(event.target.value)}
            placeholder="VD: Cảm ơn bạn đã cùng mình role-play trước cuộc hẹn."
            maxLength={240}
          />
        </label>
        <button className="cta-glow" onClick={() => onSubmit(amount)}>
          <HeartHandshake size={16} />
          Tặng {amount || "…"} XP biết ơn
        </button>
      </section>
    </Modal>
  );
}
