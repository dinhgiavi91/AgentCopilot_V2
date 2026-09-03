import { createClient } from "@supabase/supabase-js";
import { buildAdvisorProgress, getUtcDayStartIso } from "./sprint6Logic";
import type {
  ActivityEvent,
  ActivityEventType,
  Followup,
  FollowupStatus,
  Intervention,
  InterventionActionStatus,
  InterventionCheckpointDay,
  InterventionType,
  JsonObject,
  OutcomeEvaluatorRun,
  Profile as PilotProfile,
  RecoveryStatus,
  ReviewOutcome,
  Signal,
  SignalEngineRuleConfig,
  SignalEngineRun,
  SignalSeverity,
  SignalStatus,
  Team,
} from "./pilotTypes";

export type PlaybookCard = {
  code: string;
  team_id: string | null;
  skill_system: string;
  required_level: string;
  situation: string;
  customer_insight: string | null;
  mindset: string;
  core_logic: string | null;
  coaching_prompts: string | null;
  ai_evaluation_rules?: {
    roleplay_prompt?: string;
    iceberg_steps?: Record<string, string>;
  } | null;
  is_pro: boolean;
  sort_order: number;
};

export type EmpathyTerm = {
  code: string;
  legal_term: string;
  empathy_translation: string;
  category?: string;
  sort_order: number;
};

export type LeadershipPrinciple = {
  code: string;
  prefix?: string | null;
  topic: string;
  core_thinking: string;
  type: "principle" | "coaching_script";
  note?: string | null;
  tags?: string[];
  share_text?: string | null;
  roleplay_prompt?: string | null;
  mini_quiz?: LeadershipMiniQuiz | null;
  learning_carousel?: LeadershipLearningCarousel | null;
  sort_order: number;
};

export type LeadershipMiniQuiz = {
  question: string;
  options: string[];
  correct_index: number;
  correct_explanation: string;
  wrong_explanation: string;
};

export type LeadershipLearningSituation = {
  question: string;
  options: string[];
  correct_index: number;
  correct_explanation: string;
  wrong_explanation: string;
};

export type LeadershipLearningCarousel = {
  situations: LeadershipLearningSituation[];
  summary: { title: string; content: string; homework: string };
};

export type MarketingTemplate = {
  code: string;
  category: string;
  occasion: string;
  message_template: string;
  image_url: string | null;
  sort_order: number;
};

export type ContentLibrary = {
  playbooks: PlaybookCard[];
  empathy: EmpathyTerm[];
  leadership: LeadershipPrinciple[];
  marketing: MarketingTemplate[];
};

export type ContentReadKey = "playbooks" | "empathy" | "leadership" | "marketing" | "discQuestions" | "discProfiles" | "serviceLevels" | "xpRewards" | "dailyQuizzes" | "coverLetters" | "news";
export type ContentReadErrors = Partial<Record<ContentReadKey, string>>;

export type DiscQuestion = {
  code: string;
  question: string;
  option_d: string;
  option_i: string;
  option_s: string;
  option_c: string;
  sort_order: number;
};

export type CoverLetter = {
  code: string;
  situation: string;
  body_template: string;
  sort_order: number;
};

export type UwDictionaryEntry = {
  id: string;
  team_id: string | null;
  condition: string;
  layman: string;
  decision: string;
  docs: string;
  tips: string;
  icd_code: string | null;
  category: string;
  company_tag: string;
  reference_link: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UwDictionaryInput = Pick<UwDictionaryEntry, "team_id" | "condition" | "layman" | "decision" | "docs" | "tips" | "icd_code" | "category" | "company_tag" | "reference_link" | "is_active"> & { id?: string };

export type UwTemplatePhase = "PRE_UW" | "CLAIM";
export type UwTemplate = {
  id: string;
  team_id: string | null;
  template_code: string;
  template_name: string;
  guide_text: string;
  checklist: string[];
  letter_body: string;
  phase: UwTemplatePhase;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UwTemplateInput = Pick<UwTemplate, "team_id" | "template_code" | "template_name" | "guide_text" | "checklist" | "letter_body" | "phase" | "is_active"> & { id?: string };

export type NewsCaseStudy = {
  code: string;
  kind: "news" | "case";
  category: string;
  title: string;
  summary: string;
  field_takeaway: string;
  published_at: string | null;
  sort_order: number;
  video_url?: string | null;
};

export type DynamicAdminStation = "news_90s" | "case_studies" | "empathy_dictionary" | "leader_playbook";
export type DynamicAdminRecord = Record<string, string | number | null | undefined> & { id: string };
export type AdminLeaderPlaybookItem = {
  id: string;
  type: "principle" | "coaching_script";
  prefix: string;
  title: string;
  content: string;
  note: string | null;
  tags: string[];
  roleplay_prompt: string | null;
  learning_carousel: LeadershipLearningCarousel | null;
  created_at: string;
};
export type AdminLeaderPlaybookInput = {
  id?: string;
  type: "principle" | "coaching_script";
  prefix: string;
  title: string;
  description: string;
  situations?: LeadershipLearningSituation[];
  summary?: LeadershipLearningCarousel["summary"];
  tags?: string[];
  action_text?: string;
  roleplay_prompt?: string;
};
export type CoachingAdvisor = { id: string; displayName: string };
export type UserFeedbackRecord = {
  id: string;
  rating: number;
  feature: string;
  favorite_feature: string;
  suggestion: string;
  user_id: string | null;
  created_at: string;
};

export type FeedbackConfig = {
  id: number;
  headline: string;
  dropdown_options: string[];
  question_label: string;
  updated_at: string;
};

export type DiscProfileType = "D" | "I" | "S" | "C" | "DI" | "DC" | "IS" | "SC" | "CHAMELEON";

export type DiscProfile = {
  disc_type: DiscProfileType;
  headline: string;
  strengths: string;
  watch_out: string;
  selling_style: string;
  source_evidence: string;
};

export type LeadershipTrait = "Visionary" | "Architect" | "Nurturer" | "Coach";
export type LeadershipTestQuestion = {
  id: number;
  scenario: string;
  options: Array<{ text: string; trait: LeadershipTrait }>;
};
export type LeadershipTestResult = {
  name: string;
  description: string;
  goc_khuat: string;
  goi_y_bao_boi: string;
  goi_y_roleplay: string;
};
export type LeadershipTest = {
  test_key: string;
  intro_disclaimer: { title: string; content: string };
  questions: LeadershipTestQuestion[];
  results: Record<LeadershipTrait, LeadershipTestResult>;
};

export type ServiceLevel = {
  level: number;
  label: string;
  description: string;
  coaching_hint: string;
  sort_order: number;
};

export type XpReward = {
  code: string;
  name: string;
  reward_type: string;
  xp_cost: number;
  status: "Hoạt động" | "Tạm dừng";
  sort_order: number;
  team_id: string | null;
};

export type DailyQuiz = {
  code: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  correct_option: "A" | "B" | "C";
  explanation: string;
  xp_reward: number;
  sort_order: number;
  is_active: boolean;
};

const normalizeDailyQuiz = (row: Partial<DailyQuiz>): DailyQuiz => ({
  code: String(row.code ?? ""),
  question: String(row.question ?? ""),
  option_a: String(row.option_a ?? ""),
  option_b: String(row.option_b ?? ""),
  option_c: String(row.option_c ?? ""),
  correct_option: (row.correct_option === "A" || row.correct_option === "B" || row.correct_option === "C") ? row.correct_option : "A",
  explanation: String(row.explanation ?? ""),
  xp_reward: Number(row.xp_reward ?? 0),
  sort_order: Number(row.sort_order ?? 0),
  is_active: row.is_active ?? true,
});

export type StreakMilestone = {
  id: string;
  milestoneDay: number;
  title: string;
  rewardLabel: string;
  xpReward: number;
  sortOrder: number;
};

export type StreakMilestoneClaim = {
  milestoneId: string;
  xpAwarded: number;
  claimedAt: string;
};

export type StreakMilestoneClaimResult = {
  claimed: boolean;
  xpAmount: number;
  currentStreak: number;
  totalXp: number;
  milestoneId: string;
};

export type TeamGoalDefaults = {
  teamId: string;
  teamName?: string;
  bhntCommissionPercent: number;
  bhntContractSize: number;
  pntCommissionPercent: number;
  pntContractSize: number;
  updatedAt: string;
};

export type AdminHomeTelemetry = {
  dailyActiveRate: number;
  dailyActiveUsers: number;
  activeUsers: number;
  topFeature: string | null;
  topFeatureShare: number;
  weeklyActivity: Array<{ day: string; total: number }>;
  averageSessionSeconds: number | null;
};

export type AppPhilosophyMetrics = {
  recoveryRate: number;
  timeToInterventionHours: number;
  peerGifts30d: number;
  closedPolicies30d: number;
  learningTouches30d: number;
};

export type OperationalLibrary = ContentLibrary & {
  discQuestions: DiscQuestion[];
  discProfiles: DiscProfile[];
  serviceLevels: ServiceLevel[];
  xpRewards: XpReward[];
  dailyQuizzes: DailyQuiz[];
  coverLetters: CoverLetter[];
  news: NewsCaseStudy[];
  readErrors: ContentReadErrors;
};

export type XpLedgerEntry = {
  transaction_id: string;
  xp_amount: number;
  reason: string;
  description: string | null;
  created_at: string;
};

export type DailyQuizClaim = {
  claimed: boolean;
  xp_amount: number;
  current_streak: number;
  total_xp: number;
};

export type AdvisorProgress = {
  total_xp: number;
  current_streak: number;
  coin_balance: number;
  completed_quiz_today: boolean;
};

export type PersistedTarget = {
  targetIncome: number;
  requiredMeetings: number;
};

export type PlayerCoachGoal = {
  personalIncome: number;
  recruitmentOutreach: number;
  activeRatePercent: number;
  coachingSessions: number;
  xpBudget: number;
  teamStreak7dMembers: number;
};

export type LeaderGoalMetricKey = "personal_income" | "recruitment_outreach" | "active_rate" | "coaching_sessions";
export type LeaderGoalRadarSignal = { metricKey: LeaderGoalMetricKey; severity: SignalSeverity; summary: string; actual: number; goal: number };
export type LeaderGoalRadarSnapshot = {
  monthStart: string;
  monthEnd: string;
  goals: { personalIncome: number; recruitmentOutreach: number; activeRatePercent: number; coachingSessions: number };
  actuals: { personalIncome: number; recruitmentOutreach: number; activeRatePercent: number; activeAdvisors: number; activeAdvisorsActual: number; coachingSessions: number };
  openSignals: LeaderGoalRadarSignal[];
};

export type PilotSession = {
  userId: string;
  profile: PilotProfile;
};

export type RecognitionFulfillment = {
  recognitionId: string;
  rewardType: "none" | "streak_freeze" | "xp" | "voucher" | "coins" | "item";
  rewardName: string | null;
  amount: number;
  totalXp: number;
  coinBalance: number;
  idempotent: boolean;
};

export type PilotSignalItem = Signal & {
  advisor_display_name: string;
};

export type PilotOverview = {
  activeTeams: number;
  totalAdvisors: number;
  newSignalsThisWeek: number;
  interventionsThisWeek: number;
  signalReviewsThisWeek: number;
  openSignals: number;
  actedOnSignals: number;
  teams: Array<{ id: string; name: string; status: Team["status"]; newSignals: number; actedOnSignals: number }>;
};

export type CommunityPostType = "WIN" | "SOS" | "TIP" | "GENERAL";
export type TeamCommunityComment = { id: string; parentCommentId: string | null; author: string; body: string; createdAt: string };
export type TeamCommunityPost = { id: string; authorId: string; author: string; rank: string; message: string; createdAt: string; postType: CommunityPostType; imageUrls: string[]; reactions: { heart: number; smile: number }; viewerReactions: Array<"heart" | "smile">; comments: TeamCommunityComment[]; isOwn: boolean };
export type WeeklyLeaderboardEntry = { userId: string; displayName: string; weeklyXp: number };
export type TeamContestRecord = { id: string; title: string; xp: number; createdAt: string; status: "active" | "closed" };
export type PilotCrmJournalRecord = { id: string; alias: string; stage: "pre_sale" | "post_sale"; context: string; note: string; streak: number; followUpDate: string };
export type CrmNurtureScenario = { id: string; stage: "pre_sale" | "post_sale"; context: "expecting" | "new_parent" | "health_recovery" | "financial_goal" | "renewal" | "other"; title: string; emotionalTouch: string; actionPersuasion: string; longTermNote: string; quickLinkView: "marketing" | "playbook" | "empathy" | "cover" | null; followUpDays: number };
export type LeaderTeamReport = { activeAdvisors: number; touchesThisWeek: number; completedFollowupsThisWeek: number; openFollowups: number; newSignals: number; actedOnSignals: number; interventionsThisWeek: number; weeklyTouches: Array<{ label: string; count: number }> };
export type TeamRecoveryWatchlistItem = { id: string; memberName: string; signalType: string; signalSummary: string; interventionType: string; actionStatus: "planned" | "done" | "cancelled"; actionDate: string | null; recoveryStatus: RecoveryStatus | "monitoring" | "pending_measurement"; measuredAt: string | null };
export type TeamRecoveryWatchlist = { totalInterventions: number; recoveredCount: number; measurableOutcomes: number; recoveryRate: number | null; items: TeamRecoveryWatchlistItem[] };
export type CosmicTarotCard = { id: string; signalTrigger: string; cardTitle: string; crypticQuote: string; actionableAdvice: string; createdAt: string };
export type CosmicTarotCardInput = Omit<CosmicTarotCard, "id" | "createdAt"> & { id?: string };
export type AdminLeadershipRadarTeam = { teamId: string; teamName: string; leaderName: string; activeAdvisors: number; supportedAdvisors: number; closedPolicies: number; empathyScore: number; performanceScore: number };
export type LeadershipRadarScope = "global" | "agency";
export type AdminLeadershipRadar = { windowDays: number; scope: LeadershipRadarScope; teams: AdminLeadershipRadarTeam[] };
export type SmartTarotDraw = { signalTrigger: string; card: CosmicTarotCard; reusedThisWeek: boolean };
export type TeamOperationalRadarSignal = { id: string; memberName: string; signalType: string; severity: string; summary: string; status: string; detectedAt: string };
export type TeamOperationalRadar = { teamId: string; teamName: string; activeAdvisors: number; touches7d: number; openFollowups: number; newSignals: number; interventions7d: number; signals: TeamOperationalRadarSignal[] };
export type HeartbeatTeamOption = { id: string; name: string };
export type HeartbeatUserOption = { id: string; displayName: string; teamId: string; role: "super_admin" | "director" | "leader" | "advisor" };
export type HeartbeatLogItem = { id: string; userId: string; displayName: string; teamId: string; teamName: string; serviceLevel: number; actionResult: string; followUpDate: string | null; revenueAmount: number; createdAt: string };
export type HeartbeatHierarchy = { scope: "self" | "team" | "agency" | "global"; teams: HeartbeatTeamOption[]; users: HeartbeatUserOption[]; logs: HeartbeatLogItem[]; summary: { totalLogs: number; completedInteractions: number; closedDeals: number } };
export type AgentMirror = { weekStart: string; xpEarned: number; learningToolsUsed: number; giftsReceived: number; recognitionsReceived: number; customerMeetings: number; closedDeals: number; nextTip: string };
export type ExecutiveActivityPillars = { learn: number; engage: number; execute: number };
export type ExecutiveAdvisorCorrelation = { userId: string; displayName: string; activityCount: number; pillars: ExecutiveActivityPillars; moraleScore: number; observedStreak: number; coachingCount: number; selfReportedRevenue: number; status: "positive" | "recovering" | "false_productivity" | "quiet" };
export type ExecutivePerformanceReport = { teamName: string; rangeStart: string; rangeEnd: string; totalActivity: number; leaderInterventions: number; totalSelfReportedRevenue: number; teamMoraleScore: number; rows: ExecutiveAdvisorCorrelation[] };
export type TeamGiftRecipient = { id: string; displayName: string; role: PilotProfile["role"] };
export type GiftXpResult = { giftId: string; giverRemainingXpBudget: number; recipientTotalXp: number; communityPostId: string | null; idempotent: boolean };
export type RecognitionRecord = { id: string; senderId: string; receiverId: string; teamId: string; cardType: "recognition"; rewardName: string | null; leaderMessage: string | null; createdAt: string; isClaimed: boolean; claimedAt: string | null };
export type CreateRecognitionInput = { receiverId: string; rewardName: string | null; leaderMessage: string | null };
export type RewardRedemptionResult = { redemptionId: string; rewardName: string; xpCost: number; remainingTotalXp: number; idempotent: boolean };
export type RewardRedemptionRequest = { id: string; requester: string; rewardName: string; xpCost: number; status: string; createdAt: string };
export type UserNotification = { id: string; eventType: "xp_awarded" | "xp_spent" | "gift_received" | "reward_redeemed" | "reward_fulfilled" | "community_comment" | "community_reaction"; title: string; body: string; isRead: boolean; createdAt: string };
export type MyRewardRedemption = { id: string; rewardName: string; xpCost: number; status: "pending" | "fulfilled" | "cancelled"; createdAt: string; fulfilledAt: string | null };
export type TeamRewardRedemption = { id: string; requester: string; rewardName: string; xpCost: number; status: "pending"; createdAt: string };
export const AUTO_XP_SOURCES = ["daily_quiz_correct", "daily_quiz_incorrect", "customer_pulse_l1", "customer_pulse_l2_plus", "community_post", "community_comment", "training_roleplay", "training_video", "monthly_target_set", "disc_assessment"] as const;
export type AutoXpSource = (typeof AUTO_XP_SOURCES)[number];
export type AutoXpAward = { awarded: boolean; xpAmount: number; totalXp: number; currentStreak: number; source: AutoXpSource };
export type PilotManagedAccount = { id: string; email: string; displayName: string; role: PilotProfile["role"]; teamId: string; teamName: string; isActive: boolean; xpBalance: number; createdAt: string };
export type PilotManagementTeam = { id: string; name: string };
export type AdminFundingResult = { success: boolean; leaderId: string; teamId: string; newBalance: number };
export type TeamRewardDraft = { name: string; rewardType: string; xpCost: number; teamId: string | null };
export type PilotMeasurementJourney = { signalId: string; advisor: string; team: string; signalType: string; severity: string; summary: string; detectedAt: string; signalStatus: string; interventionType: string | null; actionStatus: string | null; actionDate: string | null; leader: string | null; d7Outcome: string | null; measuredAt: string | null };
export type PilotMeasurementScorecard = { weekStart: string; totalActiveSignals: number; actedSignals: number; interventionRate: number; timeToInterventionHours: number; d7OutcomeCount: number; d7RecoveredCount: number; d7RecoveryRate: number; journeys: PilotMeasurementJourney[] };

export type PilotActivityInput = {
  serviceLevel: number;
  actionResult: "Ký Hợp Đồng" | "Dời lịch" | "Từ chối" | "Đã gặp & Đang bám sát";
  customerJourney: "pre_sale" | "post_sale";
  followUpDate: string | null;
  revenueAmount: number;
};

export type PilotInterventionInput = {
  signal: Pick<PilotSignalItem, "id" | "user_id" | "team_id">;
  interventionType: InterventionType;
  actionStatus: Extract<InterventionActionStatus, "planned" | "done">;
  actionDate: string;
  rationale: string;
  note?: string;
};

export type PilotRadarFilters = {
  status: SignalStatus | "all";
  severity: Signal["severity"] | "all";
  dateRange: "all" | "today" | "7d" | "30d";
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseContentConfig = Boolean(supabaseUrl && supabaseAnonKey);

const supabase = hasSupabaseContentConfig
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

function requireSupabase() {
  if (!supabase) throw new Error("Supabase chưa được cấu hình. Hãy kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.");
  return supabase;
}

function pilotProfileMissingError() {
  return new Error("Tài khoản chưa được cấu hình cho Pilot. Vui lòng liên hệ quản trị viên.");
}

async function getPilotSessionForUserId(userId: string): Promise<PilotSession> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("id, email, display_name, role, primary_team_id, is_active, xp_balance, onboarding_completed_at, disc_result, leadership_style, leadership_style_description, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.is_active) throw pilotProfileMissingError();
  return { userId, profile: data as PilotProfile };
}

export async function getCurrentPilotSession(): Promise<PilotSession | null> {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) return null;
  return getPilotSessionForUserId(data.user.id);
}

function assertUwDictionaryManager(session: PilotSession | null) {
  if (!session || session.profile.role !== "super_admin") {
    throw new Error("Chỉ Super Admin có thể quản trị Từ điển Thẩm định và Templates.");
  }
}

function assertDynamicContentManager(session: PilotSession | null) {
  if (!session || session.profile.role !== "super_admin") {
    throw new Error("Chỉ Super Admin có thể quản trị nội dung của các trạm này.");
  }
}

function requiredCmsText(value: unknown, label: string, max = 10000) {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(`Vui lòng nhập ${label}.`);
  if (normalized.length > max) throw new Error(`${label} vượt quá ${max} ký tự.`);
  return normalized;
}

function optionalCmsText(value: unknown, max = 10000) {
  const normalized = String(value ?? "").trim();
  if (normalized.length > max) throw new Error(`Nội dung vượt quá ${max} ký tự.`);
  return normalized;
}

function dynamicCmsCode() {
  return `ED_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function fetchDynamicAdminRecords(station: DynamicAdminStation): Promise<DynamicAdminRecord[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);

  if (station === "news_90s") {
    const { data, error } = await client.from("news_90s").select("id, title, content, insight_action, category, video_url, created_at").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DynamicAdminRecord[];
  }
  if (station === "case_studies") {
    const { data, error } = await client.from("case_studies").select("id, title, context_problem, lesson_learned, video_url, created_at").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DynamicAdminRecord[];
  }
  if (station === "empathy_dictionary") {
    const { data, error } = await client.from("empathy_dictionary").select("code, technical_term, legal_term, empathy_translation, category, created_at").order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({ ...row, id: String(row.code), technical_term: String(row.technical_term ?? row.legal_term ?? "") })) as DynamicAdminRecord[];
  }
  const { data, error } = await client.from("leader_playbook").select("id, type, prefix, title, content, note, tags, share_text, roleplay_prompt, mini_quiz, learning_carousel, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row, tags: Array.isArray(row.tags) ? row.tags.join(", ") : "" })) as DynamicAdminRecord[];
}

export async function saveDynamicAdminRecord(station: DynamicAdminStation, input: DynamicAdminRecord): Promise<void> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);

  if (station === "news_90s") {
    const videoUrl = optionalCmsText(input.video_url, 1000);
    if (videoUrl && !/^https:\/\//i.test(videoUrl)) throw new Error("Video URL phải bắt đầu bằng https://.");
    const values = { title: requiredCmsText(input.title, "Tiêu đề", 180), content: requiredCmsText(input.content, "Nội dung"), insight_action: optionalCmsText(input.insight_action, 3000), category: requiredCmsText(input.category || "Nội dung thị trường", "Danh mục", 80), video_url: videoUrl || null };
    const { error } = input.id ? await client.from("news_90s").update(values).eq("id", input.id) : await client.from("news_90s").insert(values);
    if (error) throw error;
    return;
  }
  if (station === "case_studies") {
    const videoUrl = optionalCmsText(input.video_url, 1000);
    if (videoUrl && !/^https:\/\//i.test(videoUrl)) throw new Error("Video URL phải bắt đầu bằng https://.");
    const values = { title: requiredCmsText(input.title, "Tiêu đề", 180), context_problem: requiredCmsText(input.context_problem, "Bối cảnh vấn đề"), lesson_learned: optionalCmsText(input.lesson_learned, 5000), video_url: videoUrl || null };
    const { error } = input.id ? await client.from("case_studies").update(values).eq("id", input.id) : await client.from("case_studies").insert(values);
    if (error) throw error;
    return;
  }
  if (station === "empathy_dictionary") {
    const technicalTerm = requiredCmsText(input.technical_term, "Điều khoản bảo hiểm gốc", 200);
    const values = { technical_term: technicalTerm, legal_term: technicalTerm, empathy_translation: requiredCmsText(input.empathy_translation, "Lời diễn giải thấu cảm", 5000), category: requiredCmsText(input.category || "Chung", "Danh mục", 80) };
    const code = input.id || dynamicCmsCode();
    const { error } = input.id
      ? await client.from("empathy_dictionary").update(values).eq("code", input.id)
      : await client.from("empathy_dictionary").insert({ ...values, code, source_sheet: "V66_Ngôn Ngữ Thấu Cảm", sort_order: Date.now() });
    if (error) throw error;
    return;
  }
  const prefix = requiredCmsText(input.prefix, "Mã hiển thị", 32);
  const note = optionalCmsText(input.note, 280);
  const tags = Array.from(new Set(optionalCmsText(input.tags, 1000).split(",").map((tag) => tag.trim()).filter(Boolean)));
  if (tags.length > 12 || tags.some((tag) => tag.length > 80)) throw new Error("Tối đa 12 tags, mỗi tag không quá 80 ký tự.");
  const type = input.type === "coaching_script" ? "coaching_script" : "principle";
  if (type === "principle" && !/^\d{2}$/.test(prefix)) throw new Error("Nguyên tắc cần mã hiển thị gồm 2 chữ số, ví dụ 01.");
  if (type === "coaching_script" && !/^CHẠM \d{2}$/.test(prefix)) throw new Error("Kịch bản cần mã hiển thị dạng CHẠM 01.");
  const values = { type, prefix, title: requiredCmsText(input.title, "Tiêu đề", 180), content: requiredCmsText(input.content, "Nội dung chi tiết"), note: note || null, tags };
  const { error } = input.id ? await client.from("leader_playbook").update(values).eq("id", input.id) : await client.from("leader_playbook").insert(values);
  if (error) throw error;
}

function validateLeaderPlaybookText(value: unknown, label: string, max: number) {
  const text = requiredCmsText(value, label, max);
  if (containsContactPii(text)) throw new Error(`${label} không được chứa email hoặc số điện thoại.`);
  return text;
}

function validateLeaderSituations(situations: LeadershipLearningSituation[] | undefined) {
  if (!Array.isArray(situations) || situations.length < 1 || situations.length > 12) throw new Error("Nguyên tắc cần từ 1 đến 12 tình huống học tập.");
  return situations.map((situation, index) => {
    const options = Array.isArray(situation.options) ? situation.options.map((option) => validateLeaderPlaybookText(option, `Lựa chọn ${index + 1}`, 500)) : [];
    if (options.length !== 2) throw new Error(`Tình huống ${index + 1} cần đúng 2 lựa chọn.`);
    const correctIndex = Number(situation.correct_index);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 1) throw new Error(`Đáp án đúng của tình huống ${index + 1} phải là 0 hoặc 1.`);
    return {
      question: validateLeaderPlaybookText(situation.question, `Câu hỏi tình huống ${index + 1}`, 1200),
      options,
      correct_index: correctIndex,
      correct_explanation: validateLeaderPlaybookText(situation.correct_explanation, `Giải thích đúng ${index + 1}`, 3000),
      wrong_explanation: validateLeaderPlaybookText(situation.wrong_explanation, `Giải thích sai ${index + 1}`, 3000),
    };
  });
}

export async function fetchAdminLeaderPlaybook(): Promise<AdminLeaderPlaybookItem[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);
  const { data, error } = await client
    .from("leader_playbook")
    .select("id, type, prefix, title, content, note, tags, roleplay_prompt, learning_carousel, created_at")
    .order("type")
    .order("prefix");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    type: row.type === "coaching_script" ? "coaching_script" : "principle",
    prefix: String(row.prefix ?? ""),
    title: String(row.title ?? ""),
    content: String(row.content ?? ""),
    note: typeof row.note === "string" ? row.note : null,
    tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    roleplay_prompt: typeof row.roleplay_prompt === "string" ? row.roleplay_prompt : null,
    learning_carousel: row.learning_carousel && typeof row.learning_carousel === "object" ? row.learning_carousel as LeadershipLearningCarousel : null,
    created_at: String(row.created_at ?? ""),
  }));
}

export async function saveAdminLeaderPlaybook(input: AdminLeaderPlaybookInput): Promise<void> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);
  const type: AdminLeaderPlaybookInput["type"] = input.type === "coaching_script" ? "coaching_script" : "principle";
  const prefix = validateLeaderPlaybookText(input.prefix, "Mã hiển thị", 32);
  if (type === "principle" && !/^\d{2}$/.test(prefix)) throw new Error("Nguyên tắc cần mã hiển thị gồm 2 chữ số, ví dụ 01.");
  if (type === "coaching_script" && !/^CHẠM \d{2}$/.test(prefix)) throw new Error("Kịch bản cần mã hiển thị dạng CHẠM 01.");
  const title = validateLeaderPlaybookText(input.title, "Tiêu đề", 180);
  const content = validateLeaderPlaybookText(input.description, "Mô tả", 10000);
  const values: {
    type: AdminLeaderPlaybookInput["type"];
    prefix: string;
    title: string;
    content: string;
    note: string | null;
    tags: string[];
    mini_quiz: null;
    roleplay_prompt: string | null;
    learning_carousel: LeadershipLearningCarousel | null;
  } = type === "principle"
    ? {
        type,
        prefix,
        title,
        content,
        note: null,
        tags: [],
        mini_quiz: null,
        roleplay_prompt: null,
        learning_carousel: {
          situations: validateLeaderSituations(input.situations),
          summary: {
            title: validateLeaderPlaybookText(input.summary?.title, "Tiêu đề tổng kết", 240),
            content: validateLeaderPlaybookText(input.summary?.content, "Nội dung tổng kết", 4000),
            homework: validateLeaderPlaybookText(input.summary?.homework, "Bài tập", 4000),
          },
        },
      }
    : {
        type,
        prefix,
        title,
        content,
        note: validateLeaderPlaybookText(input.action_text, "Hành động gợi ý", 1000),
        tags: Array.from(new Set((input.tags ?? []).map((tag) => validateLeaderPlaybookText(tag, "Tag", 80)))).slice(0, 12),
        mini_quiz: null,
        learning_carousel: null,
        roleplay_prompt: validateLeaderPlaybookText(input.roleplay_prompt, "Roleplay prompt", 8000),
      };
  if (type === "coaching_script" && !values.tags.length) throw new Error("Kịch bản coaching cần ít nhất một tag.");
  const { error } = input.id
    ? await client.from("leader_playbook").upsert({ id: input.id, ...values }, { onConflict: "id" })
    : await client.from("leader_playbook").insert(values);
  if (error) throw error;
}

export async function fetchMyCoachingAdvisors(): Promise<CoachingAdvisor[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "leader") throw new Error("Chỉ Leader có thể chọn TVV để ghi nhận coaching.");
  const { data, error } = await client.rpc("list_my_coaching_advisors_v1");
  if (error) throw error;
  return (data ?? []).map((advisor: { id: string; display_name: string }) => ({ id: advisor.id, displayName: advisor.display_name }));
}

export async function logMyCoachingApplication(input: { advisorId: string; leaderPlaybookId: string; note: string }): Promise<string> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "leader") throw new Error("Chỉ Leader có thể ghi nhận áp dụng coaching.");
  const note = input.note.trim();
  if (note.length < 3 || note.length > 1200 || containsContactPii(note)) throw new Error("Ghi chú cần dài 3–1200 ký tự và không chứa email hoặc số điện thoại.");
  const { data, error } = await client.rpc("log_my_coaching_application_v1", { p_advisor_id: input.advisorId, p_leader_playbook_id: input.leaderPlaybookId, p_note: note });
  if (error) throw error;
  return String(data);
}

export async function deleteDynamicAdminRecord(station: DynamicAdminStation, id: string): Promise<void> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);
  const tableName = station === "empathy_dictionary" ? "empathy_dictionary" : station;
  const idColumn = station === "empathy_dictionary" ? "code" : "id";
  const { error } = await client.from(tableName).delete().eq(idColumn, id);
  if (error) throw error;
}

export async function fetchUserFeedbacks(): Promise<UserFeedbackRecord[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);
  const { data, error } = await client.from("user_feedbacks").select("id, rating, feature, favorite_feature, suggestion, user_id, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row, feature: String(row.feature ?? row.favorite_feature ?? ""), favorite_feature: String(row.favorite_feature ?? row.feature ?? ""), rating: Number(row.rating ?? 0), user_id: row.user_id ?? null })) as UserFeedbackRecord[];
}

export async function deleteUserFeedback(id: string): Promise<void> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);
  const { error } = await client.from("user_feedbacks").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchFeedbackConfig(): Promise<FeedbackConfig> {
  const client = requireSupabase();
  const { data, error } = await client.from("feedback_config").select("id, headline, dropdown_options, question_label, updated_at").eq("id", 1).single();
  if (error) throw error;
  const options = Array.isArray(data.dropdown_options) ? data.dropdown_options.map((value) => String(value).trim()).filter(Boolean) : [];
  if (!options.length) throw new Error("Cấu hình khảo sát chưa có lựa chọn hợp lệ.");
  return { id: Number(data.id), headline: String(data.headline), dropdown_options: options, question_label: String(data.question_label), updated_at: String(data.updated_at) };
}

export async function updateFeedbackConfig(input: Pick<FeedbackConfig, "headline" | "dropdown_options" | "question_label">): Promise<void> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertDynamicContentManager(session);
  const headline = requiredCmsText(input.headline, "Tiêu đề khảo sát", 180);
  const questionLabel = requiredCmsText(input.question_label, "Nhãn câu hỏi", 180);
  const options = input.dropdown_options.map((value) => String(value).trim()).filter(Boolean);
  if (options.length < 1 || options.length > 20 || options.some((value) => value.length > 120)) throw new Error("Cần từ 1 đến 20 lựa chọn, mỗi lựa chọn tối đa 120 ký tự.");
  const { error } = await client.from("feedback_config").update({ headline, dropdown_options: options, question_label: questionLabel, updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) throw error;
}

function mapUwDictionaryEntry(row: Record<string, unknown>): UwDictionaryEntry {
  return {
    id: String(row.id),
    team_id: typeof row.team_id === "string" ? row.team_id : null,
    condition: String(row.condition ?? ""),
    layman: String(row.layman ?? ""),
    decision: String(row.decision ?? ""),
    docs: String(row.docs ?? ""),
    tips: String(row.tips ?? ""),
    icd_code: typeof row.icd_code === "string" && row.icd_code.trim() ? row.icd_code : null,
    category: String(row.category ?? "Chung"),
    company_tag: String(row.company_tag ?? "Áp dụng chung"),
    reference_link: typeof row.reference_link === "string" && row.reference_link.trim() ? row.reference_link : null,
    is_active: row.is_active !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function fetchUwDictionary(includeInactive = false): Promise<UwDictionaryEntry[]> {
  const client = requireSupabase();
  let query = client
    .from("uw_dictionary")
    .select("id, team_id, condition, layman, decision, docs, tips, icd_code, category, company_tag, reference_link, is_active, created_at, updated_at")
    .order("condition", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapUwDictionaryEntry(row as Record<string, unknown>));
}

export async function saveUwDictionary(input: UwDictionaryInput): Promise<UwDictionaryEntry> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertUwDictionaryManager(session);
  const condition = input.condition.trim();
  if (!condition) throw new Error("Cần nhập bệnh lý hoặc tình huống thẩm định.");
  const values = {
    team_id: input.team_id || null,
    condition,
    layman: input.layman.trim(),
    decision: input.decision.trim(),
    docs: input.docs.trim(),
    tips: input.tips.trim(),
    icd_code: input.icd_code?.trim() || null,
    category: input.category.trim() || "Chung",
    company_tag: input.company_tag.trim() || "Áp dụng chung",
    reference_link: input.reference_link?.trim() || null,
    is_active: input.is_active,
    updated_at: new Date().toISOString(),
  };
  const query = input.id
    ? client.from("uw_dictionary").update(values).eq("id", input.id)
    : client.from("uw_dictionary").insert(values);
  const { data, error } = await query.select("id, team_id, condition, layman, decision, docs, tips, icd_code, category, company_tag, reference_link, is_active, created_at, updated_at").single();
  if (error) throw error;
  return mapUwDictionaryEntry(data as Record<string, unknown>);
}

export async function deleteUwDictionary(id: string) {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertUwDictionaryManager(session);
  const { error } = await client.from("uw_dictionary").delete().eq("id", id);
  if (error) throw error;
}

function mapUwTemplate(row: Record<string, unknown>): UwTemplate {
  return {
    id: String(row.id),
    team_id: typeof row.team_id === "string" ? row.team_id : null,
    template_code: String(row.template_code ?? ""),
    template_name: String(row.template_name ?? ""),
    guide_text: String(row.guide_text ?? ""),
    checklist: Array.isArray(row.checklist) ? row.checklist.filter((item): item is string => typeof item === "string") : [],
    letter_body: String(row.letter_body ?? ""),
    phase: row.phase === "CLAIM" ? "CLAIM" : "PRE_UW",
    is_active: row.is_active !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function fetchUwTemplates(includeInactive = false): Promise<UwTemplate[]> {
  const client = requireSupabase();
  let query = client.from("uw_templates").select("id, team_id, template_code, template_name, guide_text, checklist, letter_body, phase, is_active, created_at, updated_at").order("phase").order("template_name");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapUwTemplate(row as Record<string, unknown>));
}

export async function saveUwTemplate(input: UwTemplateInput): Promise<UwTemplate> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertUwDictionaryManager(session);
  const templateCode = input.template_code.trim().toUpperCase();
  if (!/^[A-Z0-9_]+$/.test(templateCode)) throw new Error("Mã template chỉ dùng chữ in hoa, số và dấu gạch dưới.");
  if (!input.template_name.trim() || !input.letter_body.trim()) throw new Error("Cần nhập tên template và nội dung thư.");
  if (/\{patient(?:_name)?\}/i.test(input.letter_body)) throw new Error("Template chỉ dùng {reference}; không dùng placeholder tên khách hàng.");
  const values = { team_id: input.team_id || null, template_code: templateCode, template_name: input.template_name.trim(), guide_text: input.guide_text.trim(), checklist: input.checklist.map((item) => item.trim()).filter(Boolean), letter_body: input.letter_body.trim(), phase: input.phase, is_active: input.is_active, updated_at: new Date().toISOString() };
  const query = input.id ? client.from("uw_templates").update(values).eq("id", input.id) : client.from("uw_templates").insert(values);
  const { data, error } = await query.select("id, team_id, template_code, template_name, guide_text, checklist, letter_body, phase, is_active, created_at, updated_at").single();
  if (error) throw error;
  return mapUwTemplate(data as Record<string, unknown>);
}

export async function deleteUwTemplate(id: string) {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  assertUwDictionaryManager(session);
  const { error } = await client.from("uw_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function signInPilot(email: string, password: string): Promise<PilotSession> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  if (!data.user) throw new Error("Không thể xác thực tài khoản Pilot.");
  return getPilotSessionForUserId(data.user.id);
}

export async function requestPilotPasswordReset(email: string) {
  const client = requireSupabase();
  const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}${window.location.pathname}`;
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw error;
}

export async function completePilotPasswordReset(password: string) {
  const normalized = password.trim();
  if (normalized.length < 8) throw new Error("Mật khẩu mới cần tối thiểu 8 ký tự.");
  const client = requireSupabase();
  const { error } = await client.auth.updateUser({ password: normalized });
  if (error) throw error;
}

export async function signOutPilot() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export function subscribePilotAuth(onChange: (session: PilotSession | null, error?: Error) => void) {
  const client = requireSupabase();
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      onChange(null);
      return;
    }
    void getPilotSessionForUserId(session.user.id).then((pilotSession) => onChange(pilotSession)).catch((error: unknown) => onChange(null, error instanceof Error ? error : pilotProfileMissingError()));
  });
  return () => data.subscription.unsubscribe();
}

export function subscribeXpLedgerNotifications(userId: string, onEntry: (entry: { xpAmount: number; description: string | null; reason: string; isGift: boolean }) => void) {
  const client = requireSupabase();
  const channel = client
    .channel(`xp-ledger-notifications-${userId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "xp_ledger", filter: `user_id=eq.${userId}` }, (payload) => {
      const row = payload.new as { xp_amount?: number | string; source_gift_id?: string | null; description?: string | null; reason?: string | null };
      onEntry({ xpAmount: Number(row.xp_amount ?? 0), description: row.description ?? null, reason: row.reason ?? "XP", isGift: Boolean(row.source_gift_id) });
    })
    .subscribe();
  return () => { void client.removeChannel(channel); };
}

/** Backward-compatible gift-only subscription for legacy callers. */
export function subscribeGiftXpNotifications(userId: string, onGift: (gift: { xpAmount: number; description: string | null }) => void) {
  return subscribeXpLedgerNotifications(userId, (entry) => { if (entry.isGift) onGift({ xpAmount: entry.xpAmount, description: entry.description }); });
}

function mapRecognition(row: Record<string, unknown>): RecognitionRecord {
  return {
    id: String(row.id),
    senderId: String(row.sender_id),
    receiverId: String(row.receiver_id),
    teamId: String(row.team_id),
    cardType: "recognition",
    rewardName: typeof row.reward_name === "string" ? row.reward_name : null,
    leaderMessage: typeof row.leader_message === "string" ? row.leader_message : null,
    createdAt: String(row.created_at),
    isClaimed: Boolean(row.is_claimed),
    claimedAt: typeof row.claimed_at === "string" ? row.claimed_at : null,
  };
}

export async function createTeamRecognition(input: CreateRecognitionInput): Promise<RecognitionRecord> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || (session.profile.role !== "leader" && session.profile.role !== "super_admin")) {
    throw new Error("Chỉ Leader hoặc Super Admin có thể gửi Thẻ Vinh Danh.");
  }
  if (!input.receiverId) throw new Error("Thiếu TVV nhận Thẻ Vinh Danh.");
  const { data, error } = await client
    .from("recognitions")
    .insert({
      sender_id: session.userId,
      receiver_id: input.receiverId,
      team_id: session.profile.primary_team_id,
      card_type: "recognition",
      reward_name: input.rewardName?.trim() || null,
      leader_message: input.leaderMessage?.trim() || null,
    })
    .select("id, sender_id, receiver_id, team_id, card_type, reward_name, leader_message, created_at, is_claimed, claimed_at")
    .single();
  if (error) throw error;
  return mapRecognition(data as Record<string, unknown>);
}

export function subscribeIncomingRecognitions(userId: string, onRecognition: (recognition: RecognitionRecord) => void) {
  const client = requireSupabase();
  const channel = client
    .channel(`recognitions-${userId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "recognitions", filter: `receiver_id=eq.${userId}` }, (payload) => {
      const recognition = mapRecognition(payload.new as Record<string, unknown>);
      if (!recognition.isClaimed) onRecognition(recognition);
    })
    .subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function fetchLatestPendingRecognition(userId: string): Promise<RecognitionRecord | null> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "advisor" || session.userId !== userId) return null;
  const { data, error } = await client
    .from("recognitions")
    .select("id, sender_id, receiver_id, team_id, card_type, reward_name, leader_message, created_at, is_claimed, claimed_at")
    .eq("receiver_id", userId)
    .eq("is_claimed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRecognition(data as Record<string, unknown>) : null;
}

export async function claimRecognition(recognitionId: string): Promise<RecognitionFulfillment> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("claim_recognition_reward_v1", { p_recognition_id: recognitionId });
  if (error) throw error;
  const raw = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!raw) throw new Error("Không nhận được kết quả fulfillment phần thưởng.");
  return {
    recognitionId: String(raw.recognition_id),
    rewardType: raw.reward_type as RecognitionFulfillment["rewardType"],
    rewardName: typeof raw.reward_name === "string" ? raw.reward_name : null,
    amount: Number(raw.amount ?? 0),
    totalXp: Number(raw.total_xp ?? 0),
    coinBalance: Number(raw.coin_balance ?? 0),
    idempotent: Boolean(raw.idempotent),
  };
}

export function subscribePilotPasswordRecovery(onRecovery: () => void) {
  const client = requireSupabase();
  const { data } = client.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") onRecovery();
  });
  return () => data.subscription.unsubscribe();
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function activityEventTypeFor(actionResult: PilotActivityInput["actionResult"]): ActivityEventType {
  if (actionResult === "Đã gặp & Đang bám sát") return "heartbeat";
  if (actionResult === "Dời lịch") return "followup_created";
  return "meeting_logged";
}

function serviceStageFor(customerJourney: PilotActivityInput["customerJourney"]) {
  return customerJourney === "post_sale" ? "after_sales" : "prospecting";
}

export async function recordPilotActivityEvent(eventType: Extract<ActivityEventType, "heartbeat" | "meeting_logged" | "followup_created" | "followup_done" | "learning_session">, metadata: JsonObject = {}): Promise<ActivityEvent> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "advisor") throw new Error("Hãy đăng nhập bằng tài khoản TVV Pilot để ghi hoạt động.");
  const { data, error } = await client
    .from("activity_events")
    .insert({
      user_id: session.userId,
      team_id: session.profile.primary_team_id,
      event_type: eventType,
      event_date: todayIsoDate(),
      event_timestamp: new Date().toISOString(),
      quantity: 1,
      metadata: { source: "advisor_daily_action", ...metadata },
    })
    .select("id, user_id, team_id, event_type, event_date, event_timestamp, quantity, metadata, created_at")
    .single();
  if (error) throw error;
  return data as ActivityEvent;
}

export async function logPilotActivity(input: PilotActivityInput): Promise<{ activity: ActivityEvent; followup: Followup | null }> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot trước khi lưu Nhịp Đập.");
  if (session.profile.role !== "advisor") throw new Error("Nhịp Đập Pilot chỉ dành cho tài khoản TVV.");
  if (input.actionResult === "Dời lịch" && !input.followUpDate) throw new Error("Dời lịch cần một ngày Follow-up cụ thể.");

  const metadata: JsonObject = {
    source: "advisor_daily_action",
    service_level: input.serviceLevel,
    action_result: input.actionResult,
    journey: input.customerJourney,
    revenue_amount: Math.max(0, input.revenueAmount),
  };
  const activity = await recordPilotActivityEvent(activityEventTypeFor(input.actionResult) as Extract<ActivityEventType, "heartbeat" | "meeting_logged" | "followup_created" | "followup_done" | "learning_session">, metadata);

  if (input.actionResult !== "Dời lịch" || !input.followUpDate) return { activity, followup: null };
  const safeAlias = `Nhịp follow-up · ${input.followUpDate}`;
  const { data: followup, error: followupError } = await client
    .from("followups")
    .insert({
      user_id: session.userId,
      team_id: session.profile.primary_team_id,
      alias_label: safeAlias,
      service_stage: serviceStageFor(input.customerJourney),
      due_date: input.followUpDate,
      status: "open" satisfies FollowupStatus,
    })
    .select("id, user_id, team_id, alias_label, service_stage, due_date, completed_at, status, created_at")
    .single();
  if (followupError) throw followupError;
  return { activity, followup: followup as Followup };
}

export async function fetchPilotSignals(options: { evaluateGoals?: boolean } = {}): Promise<PilotSignalItem[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot để xem Radar.");
  if (session.profile.role === "advisor") throw new Error("Radar Pilot chỉ hiển thị cho Leader, Director hoặc Super Admin.");
  // Materialize current-month goal gaps before reading the Radar. The RPC derives
  // its team scope solely from auth.uid(), so callers cannot select another team.
  if (options.evaluateGoals !== false && (session.profile.role === "leader" || session.profile.role === "director")) {
    const { error: goalError } = await client.rpc("evaluate_my_leader_goal_radar_v1");
    if (goalError) throw goalError;
  }
  const { data, error } = await client.rpc("get_leader_radar_signals_v2");
  if (error) throw error;
  return ((data ?? []) as PilotSignalItem[])
    .sort((left, right) => Number(right.status === "new") - Number(left.status === "new") || Date.parse(right.detected_at) - Date.parse(left.detected_at))
    .map((signal) => ({ ...signal, advisor_display_name: signal.advisor_display_name || "TVV Pilot" }));
}

export async function fetchSignalEngineRuleConfigs(): Promise<SignalEngineRuleConfig[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Cấu hình Signal Engine chỉ dành cho Super Admin Pilot.");
  const { data, error } = await client
    .from("signal_engine_rule_configs")
    .select("rule_key, is_enabled, evaluation_window_hours, severity, threshold_version, updated_at, updated_by")
    .order("rule_key");
  if (error) throw error;
  return (data ?? []) as SignalEngineRuleConfig[];
}

export async function updateSignalEngineRuleConfigs(configs: Array<Pick<SignalEngineRuleConfig, "rule_key" | "is_enabled" | "evaluation_window_hours" | "severity" | "threshold_version">>) {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Chỉ Super Admin có thể cập nhật ngưỡng Signal Engine.");
  const payload = configs.map((config) => ({ ...config, updated_by: session.userId, updated_at: new Date().toISOString() }));
  const { error } = await client.from("signal_engine_rule_configs").upsert(payload, { onConflict: "rule_key" });
  if (error) throw error;
}

export async function runPilotSignalEngine(dryRun: boolean): Promise<SignalEngineRun> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Chạy Signal Engine chỉ dành cho Super Admin Pilot.");
  const { data, error } = await client.rpc("run_signal_engine_v1", { p_dry_run: dryRun });
  if (error) throw error;
  return data as SignalEngineRun;
}

export async function runPilotOutcomeEvaluator(
  checkpointDay: InterventionCheckpointDay,
  checkpointHours: number,
  dryRun: boolean,
): Promise<OutcomeEvaluatorRun> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Outcome Evaluator chỉ dành cho Super Admin Pilot.");
  const normalizedHours = Math.max(1, Math.min(8760, Math.round(checkpointHours || 1)));
  const { data, error } = await client.rpc("run_outcome_evaluator_v1", {
    p_checkpoint_day: checkpointDay,
    p_checkpoint_hours: normalizedHours,
    p_dry_run: dryRun,
  });
  if (error) throw error;
  return data as OutcomeEvaluatorRun;
}

export function conciseSignalContext(metadata: JsonObject) {
  const supported = ["activity_count", "followups_overdue", "rejection_count", "window_label"];
  const parts = supported.flatMap((key) => {
    const value = metadata[key];
    if (typeof value !== "string" && typeof value !== "number") return [];
    return [`${key.replaceAll("_", " ")}: ${value}`];
  });
  return parts.slice(0, 2).join(" · ");
}

export async function reviewPilotSignal(signalId: string, reviewOutcome: ReviewOutcome, note?: string) {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot để review tín hiệu.");
  if (session.profile.role === "advisor") throw new Error("Chỉ Leader hoặc Super Admin có thể review Radar.");
  const { error: reviewError } = await client.from("signal_reviews").insert({
    signal_id: signalId,
    reviewer_id: session.userId,
    review_outcome: reviewOutcome,
    note: note?.trim() || null,
  });
  if (reviewError) throw reviewError;
  const status: SignalStatus = reviewOutcome === "not_relevant" ? "dismissed" : "reviewed";
  const { error: statusError } = await client.from("signals").update({ status }).eq("id", signalId);
  if (statusError) throw statusError;
}

export async function createPilotIntervention(input: PilotInterventionInput): Promise<Intervention> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot để ghi can thiệp.");
  if (session.profile.role === "advisor") throw new Error("Chỉ Leader hoặc Super Admin có thể ghi can thiệp.");
  const { data, error } = await client
    .from("interventions")
    .insert({
      signal_id: input.signal.id,
      user_id: input.signal.user_id,
      team_id: input.signal.team_id,
      leader_id: session.userId,
      intervention_type: input.interventionType,
      action_status: input.actionStatus,
      action_date: input.actionDate,
      rationale: input.rationale.trim(),
      note: input.note?.trim() || null,
    })
    .select("id, signal_id, user_id, team_id, leader_id, intervention_type, action_status, action_date, rationale, note, created_at")
    .single();
  if (error) throw error;
  const nextStatus: SignalStatus = input.actionStatus === "done" ? "acted_on" : "reviewed";
  const { error: signalError } = await client.from("signals").update({ status: nextStatus }).eq("id", input.signal.id);
  if (signalError) throw signalError;
  return data as Intervention;
}

function weekStartIso() {
  const date = new Date();
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

export async function fetchPilotOverview(): Promise<PilotOverview> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Founder Overview chỉ dành cho Super Admin Pilot.");
  const since = weekStartIso();
  const [teams, advisors, newSignals, interventions, reviews, signalRows] = await Promise.all([
    client.from("teams").select("id, name, status", { count: "exact" }).eq("status", "active"),
    client.from("profiles").select("id", { count: "exact", head: true }).eq("role", "advisor").eq("is_active", true),
    client.from("signals").select("id", { count: "exact", head: true }).eq("status", "new").gte("detected_at", since),
    client.from("interventions").select("id", { count: "exact", head: true }).gte("created_at", since),
    client.from("signal_reviews").select("id", { count: "exact", head: true }).gte("created_at", since),
    client.from("signals").select("team_id, status"),
  ]);
  const error = [teams.error, advisors.error, newSignals.error, interventions.error, reviews.error, signalRows.error].find(Boolean);
  if (error) throw error;
  const allSignals = signalRows.data ?? [];
  return {
    activeTeams: teams.count ?? teams.data?.length ?? 0,
    totalAdvisors: advisors.count ?? 0,
    newSignalsThisWeek: newSignals.count ?? 0,
    interventionsThisWeek: interventions.count ?? 0,
    signalReviewsThisWeek: reviews.count ?? 0,
    openSignals: allSignals.filter((signal) => signal.status === "new" || signal.status === "reviewed").length,
    actedOnSignals: allSignals.filter((signal) => signal.status === "acted_on").length,
    teams: (teams.data ?? []).map((team) => ({
      ...team,
      newSignals: allSignals.filter((signal) => signal.team_id === team.id && signal.status === "new").length,
      actedOnSignals: allSignals.filter((signal) => signal.team_id === team.id && signal.status === "acted_on").length,
    })) as PilotOverview["teams"],
  };
}

function relativeVietnameseTime(iso: string) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  if (elapsedMinutes < 1) return "Vừa xong";
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function communityRoleLabel(role: PilotProfile["role"]) {
  if (role === "leader") return "Leader";
  if (role === "super_admin") return "Super Admin";
  return "TVV";
}

export async function fetchTeamCommunityFeed(): Promise<TeamCommunityPost[]> {
  const client = requireSupabase(); const session = await getCurrentPilotSession(); if (!session) return [];
  const { data, error } = await client.from("community_posts").select("id, team_id, author_id, author_display_name, author_role, body, post_type, image_urls, created_at, community_comments(id, parent_comment_id, author_display_name, body, created_at), community_likes(user_id, reaction)").eq("team_id", session.profile.primary_team_id).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => {
    const likes = Array.isArray(row.community_likes) ? row.community_likes as Array<{ user_id: string; reaction: "heart" | "smile" }> : [];
    const comments = Array.isArray(row.community_comments) ? row.community_comments as Array<{ id: string; parent_comment_id: string | null; author_display_name: string; body: string; created_at: string }> : [];
    const postType = row.post_type === "WIN" || row.post_type === "SOS" || row.post_type === "TIP" ? row.post_type : "GENERAL";
    const imageUrls = Array.isArray(row.image_urls) ? row.image_urls.filter((url): url is string => typeof url === "string" && url.length > 0) : [];
    return { id: String(row.id), authorId: String(row.author_id), author: String(row.author_display_name || "Đồng đội Pilot"), rank: communityRoleLabel(row.author_role as PilotProfile["role"]), message: String(row.body), createdAt: relativeVietnameseTime(String(row.created_at)), postType, imageUrls, reactions: { heart: likes.filter((like) => like.reaction === "heart").length, smile: likes.filter((like) => like.reaction === "smile").length }, viewerReactions: likes.filter((like) => like.user_id === session.userId).map((like) => like.reaction), comments: comments.map((comment) => ({ id: comment.id, parentCommentId: comment.parent_comment_id, author: comment.author_display_name || "Đồng đội", body: comment.body, createdAt: comment.created_at })).sort((left, right) => left.createdAt.localeCompare(right.createdAt)), isOwn: String(row.author_id) === session.userId } satisfies TeamCommunityPost;
  });
}

export async function createTeamCommunityPost(body: string, postType: CommunityPostType = "GENERAL") {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot để đăng vào Cộng Đồng.");
  const safePostType = postType === "WIN" || postType === "SOS" || postType === "TIP" ? postType : "GENERAL";
  const { data, error } = await client.from("community_posts").insert({ team_id: session.profile.primary_team_id, author_id: session.userId, author_role: session.profile.role, body: body.trim(), post_type: safePostType }).select("id").single();
  if (error) throw error;
  return { id: String(data.id) };
}

export async function toggleTeamCommunityReaction(postId: string, reaction: "heart" | "smile") {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot để thả cảm xúc.");
  const { data: existing, error: lookupError } = await client.from("community_likes").select("id").eq("post_id", postId).eq("user_id", session.userId).eq("reaction", reaction).maybeSingle();
  if (lookupError) throw lookupError;
  const { error } = existing ? await client.from("community_likes").delete().eq("id", existing.id) : await client.from("community_likes").insert({ post_id: postId, team_id: session.profile.primary_team_id, user_id: session.userId, reaction });
  if (error) throw error;
}

export async function createTeamCommunityComment(postId: string, body: string, parentCommentId: string | null = null) {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot để gửi lời động viên.");
  const { data, error } = await client.from("community_comments").insert({ post_id: postId, team_id: session.profile.primary_team_id, author_id: session.userId, body: body.trim(), parent_comment_id: parentCommentId }).select("id").single();
  if (error) throw error;
  return { id: String(data.id) };
}

export async function deleteTeamCommunityPost(postId: string) {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("God Mode Community chỉ dành cho Super Admin.");
  const { data, error } = await client.from("community_posts").delete().eq("id", postId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Không thể xoá bài viết hoặc bài viết không còn tồn tại.");
}

export async function fetchWeeklyTeamLeaderboard(): Promise<WeeklyLeaderboardEntry[]> {
  const client = requireSupabase(); const session = await getCurrentPilotSession(); if (!session) return [];
  const { data, error } = await client.rpc("get_weekly_leaderboard_v1", { p_team_id: session.profile.primary_team_id });
  if (error) throw error;
  return (data ?? []).map((entry: { user_id: string; display_name: string; weekly_xp: number | string }) => ({ userId: entry.user_id, displayName: entry.display_name || "Đồng đội", weeklyXp: Number(entry.weekly_xp ?? 0) }));
}

export async function awardAutomatedXp(source: AutoXpSource, sourceKey: string): Promise<AutoXpAward> {
  const client = requireSupabase();
  const { data, error } = source === "disc_assessment"
    ? await client.rpc("award_disc_assessment_xp_v1", { p_assessment_id: sourceKey })
    : await client.rpc("award_advisor_auto_xp_v1", { p_source: source, p_source_key: sourceKey });
  if (error) throw error;
  const raw = data as { awarded: boolean; xp_amount: number; total_xp: number; current_streak: number; source: AutoXpSource };
  return { awarded: raw.awarded, xpAmount: raw.xp_amount, totalXp: raw.total_xp, currentStreak: raw.current_streak, source: raw.source };
}

export async function fetchTeamContests(): Promise<TeamContestRecord[]> {
  const client = requireSupabase(); const session = await getCurrentPilotSession(); if (!session) return [];
  const { data, error } = await client.from("team_contests").select("id, title, xp_reward, status, created_at").eq("team_id", session.profile.primary_team_id).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []).map((contest) => ({ id: contest.id, title: contest.title, xp: contest.xp_reward, status: contest.status as "active" | "closed", createdAt: contest.created_at }));
}

export async function createTeamContest(input: Pick<TeamContestRecord, "title" | "xp">): Promise<TeamContestRecord> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || (session.profile.role !== "leader" && session.profile.role !== "super_admin")) throw new Error("Chỉ Leader hoặc Super Admin có thể tạo Contest.");
  const { data, error } = await client.from("team_contests").insert({ team_id: session.profile.primary_team_id, created_by: session.userId, title: input.title.trim(), xp_reward: input.xp }).select("id, title, xp_reward, status, created_at").single();
  if (error) throw error;
  return { id: data.id, title: data.title, xp: data.xp_reward, status: data.status as "active" | "closed", createdAt: data.created_at };
}

export async function fetchTeamGiftRecipients(): Promise<TeamGiftRecipient[]> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("list_team_gift_recipients_v1");
  if (error) throw error;
  return (data ?? []).map((recipient: { id: string; display_name: string; role: PilotProfile["role"] }) => ({ id: recipient.id, displayName: recipient.display_name, role: recipient.role }));
}

export async function giftTeamXp(recipientId: string, amount: number, note: string, publishToCommunity = false): Promise<GiftXpResult> {
  const client = requireSupabase();
  const idempotencyKey = crypto.randomUUID();
  const { data, error } = await client.rpc("gift_team_xp_v2", { p_recipient_id: recipientId, p_amount: amount, p_note: note.trim(), p_publish_to_community: publishToCommunity, p_idempotency_key: idempotencyKey });
  if (error) throw error;
  const raw = data as { gift_id: string; giver_remaining_xp_budget: number; recipient_total_xp: number; community_post_id: string | null; idempotent: boolean };
  return { giftId: raw.gift_id, giverRemainingXpBudget: raw.giver_remaining_xp_budget, recipientTotalXp: raw.recipient_total_xp, communityPostId: raw.community_post_id, idempotent: raw.idempotent };
}

export async function redeemXpReward(rewardCode: string): Promise<RewardRedemptionResult> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("redeem_xp_reward_v1", { p_reward_code: rewardCode, p_idempotency_key: crypto.randomUUID() });
  if (error) throw error;
  const raw = data as { redemption_id: string; reward_name: string; xp_cost: number; remaining_total_xp: number; idempotent: boolean };
  return { redemptionId: raw.redemption_id, rewardName: raw.reward_name, xpCost: Number(raw.xp_cost), remainingTotalXp: Number(raw.remaining_total_xp), idempotent: Boolean(raw.idempotent) };
}

export async function fetchRewardRedemptionRequests(): Promise<RewardRedemptionRequest[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Yêu cầu đổi quà chỉ hiển thị cho Super Admin.");
  const { data, error } = await client.rpc("list_reward_redemptions_v1");
  if (error) throw error;
  return (data ?? []).map((row: { id: string; requester: string; reward_name: string; xp_cost: number; status: string; created_at: string }) => ({ id: row.id, requester: row.requester, rewardName: row.reward_name, xpCost: Number(row.xp_cost), status: row.status, createdAt: row.created_at }));
}

export async function fetchMyNotifications(): Promise<UserNotification[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) return [];
  const { data, error } = await client.rpc("list_my_notifications_v1");
  if (error) throw error;
  return (data ?? []).map((row: { id: string; event_type: UserNotification["eventType"]; title: string; body: string; is_read: boolean; created_at: string }) => ({ id: row.id, eventType: row.event_type, title: row.title, body: row.body, isRead: Boolean(row.is_read), createdAt: row.created_at }));
}

export async function markMyNotificationRead(notificationId: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("mark_my_notification_read_v1", { p_notification_id: notificationId });
  if (error) throw error;
  return Boolean(data);
}

export function subscribeUserNotifications(userId: string, onNotification: (notification: UserNotification) => void) {
  const client = requireSupabase();
  const channel = client
    .channel(`user-notifications-${userId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_notifications", filter: `user_id=eq.${userId}` }, (payload) => {
      const row = payload.new as { id?: string; event_type?: UserNotification["eventType"]; title?: string; body?: string; is_read?: boolean; created_at?: string };
      if (!row.id || !row.event_type || !row.title || !row.body || !row.created_at) return;
      onNotification({ id: row.id, eventType: row.event_type, title: row.title, body: row.body, isRead: Boolean(row.is_read), createdAt: row.created_at });
    })
    .subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function fetchMyRewardRedemptions(): Promise<MyRewardRedemption[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) return [];
  const { data, error } = await client.rpc("list_my_reward_redemptions_v1");
  if (error) throw error;
  return (data ?? []).map((row: { id: string; reward_name: string; xp_cost: number; status: MyRewardRedemption["status"]; created_at: string; fulfilled_at: string | null }) => ({ id: row.id, rewardName: row.reward_name, xpCost: Number(row.xp_cost), status: row.status, createdAt: row.created_at, fulfilledAt: row.fulfilled_at }));
}

export function subscribeMyRewardRedemptions(userId: string, onChange: () => void) {
  const client = requireSupabase();
  const channel = client
    .channel(`my-reward-redemptions-${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "reward_redemptions", filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function fetchTeamPendingRewardRedemptions(): Promise<TeamRewardRedemption[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || (session.profile.role !== "leader" && session.profile.role !== "super_admin")) throw new Error("Quản lý trả quà chỉ dành cho Leader hoặc Super Admin.");
  const { data, error } = await client.rpc("list_team_pending_reward_redemptions_v1");
  if (error) throw error;
  return (data ?? []).map((row: { id: string; requester: string; reward_name: string; xp_cost: number; status: "pending"; created_at: string }) => ({ id: row.id, requester: row.requester, rewardName: row.reward_name, xpCost: Number(row.xp_cost), status: row.status, createdAt: row.created_at }));
}

export async function fulfillTeamRewardRedemption(redemptionId: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("fulfill_team_reward_redemption_v1", { p_redemption_id: redemptionId });
  if (error) throw error;
  return data as { id: string; status: "fulfilled"; fulfilled_at: string };
}

export async function completeAdvisorOnboarding() {
  const client = requireSupabase();
  const { data, error } = await client.rpc("complete_advisor_onboarding_v1");
  if (error) throw error;
  return data as string;
}

export async function fetchPilotMeasurementScorecard(): Promise<PilotMeasurementScorecard> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Scorecard chỉ dành cho Super Admin Pilot.");
  const { data, error } = await client.rpc("get_pilot_measurement_scorecard_v1");
  if (error) throw error;
  const raw = data as Record<string, unknown>;
  return { weekStart: String(raw.week_start ?? ""), totalActiveSignals: Number(raw.total_active_signals ?? 0), actedSignals: Number(raw.acted_signals ?? 0), interventionRate: Number(raw.intervention_rate ?? 0), timeToInterventionHours: Number(raw.time_to_intervention_hours ?? 0), d7OutcomeCount: Number(raw.d7_outcome_count ?? 0), d7RecoveredCount: Number(raw.d7_recovered_count ?? 0), d7RecoveryRate: Number(raw.d7_recovery_rate ?? 0), journeys: Array.isArray(raw.journeys) ? raw.journeys.map((journey) => { const item = journey as Record<string, unknown>; return { signalId: String(item.signal_id ?? ""), advisor: String(item.advisor ?? "TVV Pilot"), team: String(item.team ?? "Team"), signalType: String(item.signal_type ?? "other"), severity: String(item.severity ?? "low"), summary: String(item.summary ?? ""), detectedAt: String(item.detected_at ?? ""), signalStatus: String(item.signal_status ?? "new"), interventionType: item.intervention_type ? String(item.intervention_type) : null, actionStatus: item.action_status ? String(item.action_status) : null, actionDate: item.action_date ? String(item.action_date) : null, leader: item.leader ? String(item.leader) : null, d7Outcome: item.d7_outcome ? String(item.d7_outcome) : null, measuredAt: item.measured_at ? String(item.measured_at) : null }; }) : [] };
}

export async function fetchPilotManagedAccounts(): Promise<PilotManagedAccount[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Quản lý tài khoản chỉ dành cho Super Admin Pilot.");
  const { data, error } = await client.from("profiles").select("id, email, display_name, role, primary_team_id, is_active, xp_balance, created_at, teams!profiles_primary_team_id_fkey(name)").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((account: Record<string, unknown>) => ({ id: String(account.id), email: String(account.email), displayName: String(account.display_name), role: account.role as PilotProfile["role"], teamId: String(account.primary_team_id), teamName: String((account.teams as { name?: string } | null)?.name ?? "Team chưa đặt tên"), isActive: Boolean(account.is_active), xpBalance: Number(account.xp_balance ?? 0), createdAt: String(account.created_at) }));
}

export async function fetchPilotManagementTeams(): Promise<PilotManagementTeam[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Quản lý Team chỉ dành cho Super Admin Pilot.");
  const { data, error } = await client.from("teams").select("id, name").order("name");
  if (error) throw error;
  return (data ?? []).map((team) => ({ id: team.id, name: team.name }));
}

export async function adminFundLeader(input: { leaderId: string; amount: number; reason: string }): Promise<AdminFundingResult> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Central Bank chỉ dành cho Super Admin.");
  const { data, error } = await client.rpc("admin_fund_leader_v1", { p_leader_id: input.leaderId, p_amount: Math.round(input.amount), p_reason: input.reason.trim() });
  if (error) throw error;
  const raw = data as { success: boolean; leader_id: string; team_id: string; new_balance: number };
  return { success: Boolean(raw.success), leaderId: String(raw.leader_id), teamId: String(raw.team_id), newBalance: Number(raw.new_balance) };
}

export async function fetchAdminTeamRewards(): Promise<XpReward[]> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Cấu hình kho quà chỉ dành cho Super Admin.");
  const { data, error } = await client.from("xp_rewards").select("code, name, reward_type, xp_cost, status, sort_order, team_id").order("sort_order").limit(100);
  if (error) throw error;
  return (data ?? []).map((reward) => ({ code: reward.code, name: reward.name, reward_type: reward.reward_type, xp_cost: Number(reward.xp_cost), status: reward.status as XpReward["status"], sort_order: Number(reward.sort_order), team_id: reward.team_id }));
}

export async function createAdminTeamReward(input: TeamRewardDraft): Promise<XpReward> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Cấu hình kho quà chỉ dành cho Super Admin.");
  const name = input.name.trim(); const rewardType = input.rewardType.trim(); const xpCost = Math.round(Number(input.xpCost));
  if (name.length < 3 || name.length > 100 || rewardType.length < 2 || rewardType.length > 40 || !Number.isFinite(xpCost) || xpCost < 1 || xpCost > 1_000_000) throw new Error("Nhập tên quà, loại quà và XP hợp lệ; không dùng dữ liệu định danh khách hàng.");
  const code = `TEAM-${(input.teamId ?? "GLOBAL").slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const { data: latest, error: latestError } = await client.from("xp_rewards").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  if (latestError) throw latestError;
  const sortOrder = Number(latest?.[0]?.sort_order ?? 0) + 1;
  const { data, error } = await client.from("xp_rewards").insert({ code, name, reward_type: rewardType, xp_cost: xpCost, status: "Hoạt động", team_id: input.teamId, sort_order: sortOrder }).select("code, name, reward_type, xp_cost, status, sort_order, team_id").single();
  if (error) throw error;
  return { code: data.code, name: data.name, reward_type: data.reward_type, xp_cost: Number(data.xp_cost), status: data.status as XpReward["status"], sort_order: Number(data.sort_order), team_id: data.team_id };
}

const containsContactPii = (value: string) => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\+?84|0)\d{8,10}/i.test(value);
const mapTeamGoalDefaults = (row: Record<string, unknown>): TeamGoalDefaults => ({
  teamId: String(row.team_id),
  teamName: typeof (row.teams as { name?: unknown } | null)?.name === "string" ? String((row.teams as { name: string }).name) : undefined,
  bhntCommissionPercent: Number(row.bhnt_commission_percent),
  bhntContractSize: Number(row.bhnt_contract_size),
  pntCommissionPercent: Number(row.pnt_commission_percent),
  pntContractSize: Number(row.pnt_contract_size),
  updatedAt: String(row.updated_at),
});

export async function fetchStreakMilestones(): Promise<StreakMilestone[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("streak_milestones").select("id, milestone_day, title, reward_label, xp_reward, sort_order").eq("is_active", true).order("sort_order").order("milestone_day").limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: String(row.id), milestoneDay: Number(row.milestone_day), title: String(row.title), rewardLabel: String(row.reward_label), xpReward: Number(row.xp_reward ?? 0), sortOrder: Number(row.sort_order) }));
}

export async function fetchAdminStreakMilestones(): Promise<StreakMilestone[]> {
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Cấu hình cột mốc chuỗi chỉ dành cho Super Admin.");
  return fetchStreakMilestones();
}

export async function createAdminStreakMilestone(input: { milestoneDay: number; title: string; xpReward: number }): Promise<StreakMilestone> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Cấu hình cột mốc chuỗi chỉ dành cho Super Admin.");
  const milestoneDay = Math.round(input.milestoneDay);
  const xpReward = Math.round(input.xpReward);
  const title = input.title.trim();
  if (!Number.isFinite(milestoneDay) || milestoneDay < 1 || milestoneDay > 1_000_000 || !Number.isFinite(xpReward) || xpReward < 0 || xpReward > 1_000_000 || title.length < 3 || title.length > 100 || containsContactPii(title)) {
    throw new Error("Nhập mốc ngày, XP và danh hiệu hợp lệ; không dùng email hoặc số điện thoại.");
  }
  const { data, error } = await client.rpc("create_streak_milestone_v1", { p_milestone_day: milestoneDay, p_title: title, p_xp_reward: xpReward });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) throw new Error("Không nhận được cột mốc sau khi lưu.");
  return { id: String(row.id), milestoneDay: Number(row.milestone_day), title: String(row.title), rewardLabel: String(row.reward_label), xpReward: Number(row.xp_reward ?? 0), sortOrder: Number(row.sort_order) };
}

export async function fetchMyStreakMilestoneClaims(): Promise<StreakMilestoneClaim[]> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) return [];
  const { data, error } = await client.from("streak_milestone_claims").select("milestone_id, xp_awarded, claimed_at").order("claimed_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []).map((row) => ({ milestoneId: String(row.milestone_id), xpAwarded: Number(row.xp_awarded), claimedAt: String(row.claimed_at) }));
}

export async function claimStreakMilestone(milestoneId: string): Promise<StreakMilestoneClaimResult> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập để nhận thưởng Chuỗi Bền Bỉ.");
  const { data, error } = await client.rpc("claim_streak_milestone_v1", { p_milestone_id: milestoneId });
  console.log("Check ID truyền vào:", milestoneId);
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) throw new Error("Không nhận được kết quả nhận thưởng chuỗi.");
  return { claimed: Boolean(row.claimed), xpAmount: Number(row.xp_amount ?? 0), currentStreak: Number(row.current_streak ?? 0), totalXp: Number(row.total_xp ?? 0), milestoneId: String(row.milestone_id ?? milestoneId) };
}

export async function fetchCurrentTeamGoalDefaults(): Promise<TeamGoalDefaults | null> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session) return null;
  const { data, error } = await client.from("team_goal_defaults").select("team_id, bhnt_commission_percent, bhnt_contract_size, pnt_commission_percent, pnt_contract_size, updated_at").eq("team_id", session.profile.primary_team_id).maybeSingle();
  if (error) throw error;
  return data ? mapTeamGoalDefaults(data) : null;
}

export async function fetchAdminTeamGoalDefaults(): Promise<TeamGoalDefaults[]> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Cấu hình Team chỉ dành cho Super Admin.");
  const { data, error } = await client.from("team_goal_defaults").select("team_id, bhnt_commission_percent, bhnt_contract_size, pnt_commission_percent, pnt_contract_size, updated_at, teams!team_goal_defaults_team_id_fkey(name)").order("updated_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => mapTeamGoalDefaults(row as Record<string, unknown>));
}

export async function upsertAdminTeamGoalDefaults(input: Omit<TeamGoalDefaults, "teamName" | "updatedAt">): Promise<TeamGoalDefaults> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Cấu hình Team chỉ dành cho Super Admin.");
  const values = [input.bhntCommissionPercent, input.pntCommissionPercent, input.bhntContractSize, input.pntContractSize];
  if (!input.teamId || values.some((value) => !Number.isFinite(value) || value < 0) || input.bhntCommissionPercent > 100 || input.pntCommissionPercent > 100) throw new Error("Nhập tỷ lệ 0–100% và size hợp đồng hợp lệ.");
  const { data, error } = await client.rpc("upsert_team_goal_defaults_v1", { p_team_id: input.teamId, p_bhnt_commission_percent: Math.round(input.bhntCommissionPercent), p_bhnt_contract_size: Math.round(input.bhntContractSize), p_pnt_commission_percent: Math.round(input.pntCommissionPercent), p_pnt_contract_size: Math.round(input.pntContractSize) });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!row) throw new Error("Không nhận được cấu hình Team sau khi lưu.");
  return mapTeamGoalDefaults(row);
}

export async function fetchAdminDailyQuizBankCount(): Promise<number> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Quản lý Nạp Não chỉ dành cho Super Admin.");
  const { count, error } = await client.from("daily_quizzes").select("code", { count: "exact", head: true });
  if (error) throw error;
  return Number(count ?? 0);
}

export async function fetchAdminDailyQuizBank(): Promise<DailyQuiz[]> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Quản lý Nạp Não chỉ dành cho Super Admin.");
  const { data, error } = await client.from("daily_quizzes").select("code, question, option_a, option_b, option_c, correct_option, explanation, xp_reward, sort_order, is_active").order("sort_order").order("code");
  if (error) throw error;
  return (data ?? []).map((row) => normalizeDailyQuiz(row as Partial<DailyQuiz>));
}

export async function addAdminDailyQuizToBank(input: Omit<DailyQuiz, "code" | "sort_order" | "is_active">): Promise<DailyQuiz> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Quản lý Nạp Não chỉ dành cho Super Admin.");
  const content = [input.question, input.option_a, input.option_b, input.option_c, input.explanation].map((value) => value.trim());
  if (content.some((value) => value.length < 1) || content.some(containsContactPii) || !["A", "B", "C"].includes(input.correct_option) || !Number.isFinite(input.xp_reward) || input.xp_reward < 0 || input.xp_reward > 1_000) throw new Error("Câu hỏi cần đủ nội dung, đáp án A–C, XP hợp lệ và không chứa email/số điện thoại.");
  const { data, error } = await client.rpc("add_daily_quiz_to_bank_v1", { p_question: content[0], p_option_a: content[1], p_option_b: content[2], p_option_c: content[3], p_correct_option: input.correct_option, p_explanation: content[4], p_xp_reward: Math.round(input.xp_reward) });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as DailyQuiz | null;
  if (!row) throw new Error("Không nhận được câu Nạp Não sau khi thêm vào ngân hàng.");
  return normalizeDailyQuiz(row);
}

export async function fetchAdminHomeTelemetry(): Promise<AdminHomeTelemetry> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Telemetry chỉ dành cho Super Admin.");
  const now = new Date(); const dailyCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); const weeklyCutoff = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
  const [activeProfiles, activityResult] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
    client.from("activity_events").select("user_id, event_timestamp, event_type").gte("event_timestamp", weeklyCutoff).order("event_timestamp", { ascending: true }).limit(5000),
  ]);
  if (activeProfiles.error) throw activeProfiles.error; if (activityResult.error) throw activityResult.error;
  const activities = activityResult.data ?? []; const activeUsers = Number(activeProfiles.count ?? 0); const dailyUsers = new Set(activities.filter((event) => event.event_timestamp >= dailyCutoff).map((event) => event.user_id)).size;
  const featureCounts = new Map<string, number>(); activities.forEach((event) => featureCounts.set(String(event.event_type), (featureCounts.get(String(event.event_type)) ?? 0) + 1));
  const topFeature = [...featureCounts.entries()].sort((a, b) => b[1] - a[1])[0]; const featureLabels: Record<string, string> = { learning_session: "Bảo Bối", daily_quiz: "Nạp Não", community_post: "Cộng Đồng", community_comment: "Cộng Đồng", crm_journal: "Nhịp Đập" };
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(now); date.setDate(now.getDate() - (6 - index)); return date.toISOString().slice(0, 10); }); const dailyCounts = new Map(days.map((day) => [day, 0]));
  activities.forEach((event) => { const day = String(event.event_timestamp).slice(0, 10); if (dailyCounts.has(day)) dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1); });
  return { dailyActiveRate: activeUsers ? Math.round((dailyUsers / activeUsers) * 100) : 0, dailyActiveUsers: dailyUsers, activeUsers, topFeature: topFeature ? (featureLabels[topFeature[0]] ?? topFeature[0].replaceAll("_", " ")) : null, topFeatureShare: activities.length && topFeature ? Math.round((topFeature[1] / activities.length) * 100) : 0, weeklyActivity: days.map((day) => ({ day, total: dailyCounts.get(day) ?? 0 })), averageSessionSeconds: null };
}

export async function fetchAppPhilosophyMetrics(): Promise<AppPhilosophyMetrics> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") {
    throw new Error("Telemetry triết lý chỉ dành cho Super Admin.");
  }
  const { data, error } = await client.rpc("get_app_philosophy_metrics_v1");
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  const numberOrZero = (value: unknown) => Math.max(0, Number(value) || 0);
  return {
    recoveryRate: numberOrZero(row?.recovery_rate),
    timeToInterventionHours: numberOrZero(row?.tti_hours),
    peerGifts30d: Math.round(numberOrZero(row?.peer_gifts_30d)),
    closedPolicies30d: Math.round(numberOrZero(row?.closed_policies_30d)),
    learningTouches30d: Math.round(numberOrZero(row?.learning_touches_30d)),
  };
}

type PilotUserMutation = { displayName: string; role: "super_admin" | "director" | "leader" | "advisor"; teamId: string; xpBalance: number; isActive?: boolean; email?: string; password?: string };
async function callPilotUserApi(method: "POST" | "PATCH", payload: PilotUserMutation & { userId?: string }) {
  const client = requireSupabase();
  const { data: authData } = await client.auth.getSession();
  const token = authData.session?.access_token;
  if (!token) throw new Error("Hãy đăng nhập Super Admin trước khi quản lý tài khoản.");
  const response = await fetch("/api/pilot/users", { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({})) as { error?: string; account?: PilotManagedAccount };
  if (!response.ok) throw new Error(result.error || "Không thể cập nhật tài khoản Pilot.");
  return result.account;
}
export async function createPilotManagedAccount(input: Required<Pick<PilotUserMutation, "email" | "password" | "displayName" | "role" | "teamId" | "xpBalance">>) { return callPilotUserApi("POST", input); }
export async function updatePilotManagedAccount(userId: string, input: Omit<PilotUserMutation, "email" | "password">) { return callPilotUserApi("PATCH", { ...input, userId }); }

export async function fetchPilotCrmJournals(): Promise<PilotCrmJournalRecord[]> {
  const client = requireSupabase(); const session = await getCurrentPilotSession(); if (!session || session.profile.role !== "advisor") return [];
  const { data, error } = await client.from("activity_events").select("id, event_timestamp, metadata").eq("user_id", session.userId).eq("team_id", session.profile.primary_team_id).order("event_timestamp", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).flatMap((event) => {
    const metadata = event.metadata as JsonObject; if (metadata.source !== "crm_journal") return [];
    const stage = metadata.stage === "post_sale" ? "post_sale" : "pre_sale";
    const context = typeof metadata.context === "string" ? metadata.context : stage === "post_sale" ? "renewal" : "expecting";
    const note = typeof metadata.note === "string" ? metadata.note : "Nhật ký không định danh.";
    const followUpDate = typeof metadata.follow_up_date === "string" ? metadata.follow_up_date : "";
    return [{ id: event.id, alias: `Nhật ký · ${new Date(event.event_timestamp).toLocaleDateString("vi-VN")}`, stage, context, note, streak: 1, followUpDate }];
  });
}

export async function createPilotCrmJournal(input: Pick<PilotCrmJournalRecord, "stage" | "context" | "note" | "followUpDate">) {
  return recordPilotActivityEvent("heartbeat", { source: "crm_journal", stage: input.stage, context: input.context, note: input.note.trim(), follow_up_date: input.followUpDate || null });
}

export async function fetchCrmNurtureScenario(stage: CrmNurtureScenario["stage"], context: CrmNurtureScenario["context"]): Promise<CrmNurtureScenario | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("crm_nurture_scenarios")
    .select("id, stage, context, title, emotional_touch, action_persuasion, long_term_note, quick_link_view, follow_up_days")
    .eq("stage", stage)
    .eq("context", context)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    stage: data.stage === "post_sale" ? "post_sale" : "pre_sale",
    context: data.context as CrmNurtureScenario["context"],
    title: String(data.title),
    emotionalTouch: String(data.emotional_touch),
    actionPersuasion: String(data.action_persuasion),
    longTermNote: String(data.long_term_note),
    quickLinkView: data.quick_link_view === "marketing" || data.quick_link_view === "playbook" || data.quick_link_view === "empathy" || data.quick_link_view === "cover" ? data.quick_link_view : null,
    followUpDays: Math.max(1, Math.min(60, Number(data.follow_up_days) || 7)),
  };
}

export async function fetchLeaderTeamReport(): Promise<LeaderTeamReport> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || !["leader", "director", "super_admin"].includes(session.profile.role)) throw new Error("Báo cáo Team chỉ dành cho Leader, Director hoặc Super Admin.");
  const teamId = session.profile.primary_team_id; const weekStart = weekStartIso();
  const [advisors, activities, followups, signals, interventions] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }).eq("primary_team_id", teamId).eq("role", "advisor").eq("is_active", true),
    client.from("activity_events").select("event_timestamp").eq("team_id", teamId).gte("event_timestamp", weekStart),
    client.from("followups").select("status, completed_at").eq("team_id", teamId),
    client.from("signals").select("status").eq("team_id", teamId),
    client.from("interventions").select("id").eq("team_id", teamId).gte("created_at", weekStart),
  ]);
  const error = [advisors.error, activities.error, followups.error, signals.error, interventions.error].find(Boolean); if (error) throw error;
  const weeklyTouches = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setUTCDate(date.getUTCDate() - (6 - index)); const dayKey = date.toISOString().slice(0, 10); return { label: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date), count: (activities.data ?? []).filter((event) => event.event_timestamp.slice(0, 10) === dayKey).length }; });
  return { activeAdvisors: advisors.count ?? 0, touchesThisWeek: activities.data?.length ?? 0, completedFollowupsThisWeek: (followups.data ?? []).filter((followup) => followup.status === "done" && followup.completed_at && followup.completed_at >= weekStart).length, openFollowups: (followups.data ?? []).filter((followup) => followup.status === "open" || followup.status === "overdue").length, newSignals: (signals.data ?? []).filter((signal) => signal.status === "new").length, actedOnSignals: (signals.data ?? []).filter((signal) => signal.status === "acted_on").length, interventionsThisWeek: interventions.data?.length ?? 0, weeklyTouches };
}

export async function fetchTeamRecoveryWatchlist(): Promise<TeamRecoveryWatchlist> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || !["leader", "director", "super_admin"].includes(session.profile.role)) throw new Error("Watchlist phục hồi chỉ dành cho Leader, Director hoặc Super Admin.");
  const { data, error } = await client.rpc("get_team_recovery_watchlist_v1");
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(raw.items) ? raw.items : [];
  return {
    totalInterventions: Number(raw.total_interventions ?? 0),
    recoveredCount: Number(raw.recovered_count ?? 0),
    measurableOutcomes: Number(raw.measurable_outcomes ?? 0),
    recoveryRate: raw.recovery_rate === null || raw.recovery_rate === undefined ? null : Number(raw.recovery_rate),
    items: rows.map((row) => { const item = row as Record<string, unknown>; return { id: String(item.id ?? ""), memberName: String(item.member_name ?? "TVV trong Team"), signalType: String(item.signal_type ?? "support"), signalSummary: String(item.signal_summary ?? "Ca hỗ trợ được ghi nhận"), interventionType: String(item.intervention_type ?? "other"), actionStatus: String(item.action_status ?? "planned") as TeamRecoveryWatchlistItem["actionStatus"], actionDate: item.action_date ? String(item.action_date) : null, recoveryStatus: String(item.recovery_status ?? "pending_measurement") as TeamRecoveryWatchlistItem["recoveryStatus"], measuredAt: item.measured_at ? String(item.measured_at) : null }; }),
  };
}

function mapCosmicTarotCard(row: Record<string, unknown>): CosmicTarotCard {
  return { id: String(row.id), signalTrigger: String(row.signal_trigger), cardTitle: String(row.card_title), crypticQuote: String(row.cryptic_quote), actionableAdvice: String(row.actionable_advice), createdAt: String(row.created_at) };
}

export async function fetchCosmicTarotCards(): Promise<CosmicTarotCard[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("cosmic_tarot_cards").select("id, signal_trigger, card_title, cryptic_quote, actionable_advice, created_at").order("created_at", { ascending: true }).limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => mapCosmicTarotCard(row as Record<string, unknown>));
}

export async function drawSmartTarotCard(): Promise<SmartTarotDraw> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || !["leader", "director"].includes(session.profile.role)) throw new Error("Smart Tarot chỉ dành cho Leader hoặc Director của Team.");
  const { data, error } = await client.rpc("draw_smart_tarot_v1", { p_team_signal: null, p_last_card_id: null });
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>;
  const rawCard = (raw.card ?? {}) as Record<string, unknown>;
  if (!rawCard.id) throw new Error("Smart Tarot chưa trả về lá bài hợp lệ.");
  return { signalTrigger: String(raw.signal_trigger ?? "team_momentum"), card: mapCosmicTarotCard(rawCard), reusedThisWeek: Boolean(raw.reused_this_week) };
}

export async function fetchAdminCosmicTarotCards(): Promise<CosmicTarotCard[]> {
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Kho Bài Tín Hiệu Vũ Trụ chỉ dành cho Super Admin.");
  return fetchCosmicTarotCards();
}

export async function saveAdminCosmicTarotCard(input: CosmicTarotCardInput): Promise<CosmicTarotCard> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Kho Bài Tín Hiệu Vũ Trụ chỉ dành cho Super Admin.");
  const values = [input.signalTrigger, input.cardTitle, input.crypticQuote, input.actionableAdvice].map((value) => value.trim());
  if (values.some((value) => value.length < 3) || values.some((value) => value.length > 800) || values.some(containsContactPii)) throw new Error("Nội dung quẻ cần đủ thông tin hợp lệ và không chứa email hoặc số điện thoại.");
  const payload = { signal_trigger: values[0], card_title: values[1], cryptic_quote: values[2], actionable_advice: values[3] };
  const query = input.id ? client.from("cosmic_tarot_cards").update(payload).eq("id", input.id) : client.from("cosmic_tarot_cards").insert(payload);
  const { data, error } = await query.select("id, signal_trigger, card_title, cryptic_quote, actionable_advice, created_at").single();
  if (error) throw error;
  return mapCosmicTarotCard(data as Record<string, unknown>);
}

export async function deleteAdminCosmicTarotCard(cardId: string) {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "super_admin") throw new Error("Kho Bài Tín Hiệu Vũ Trụ chỉ dành cho Super Admin.");
  const { error } = await client.from("cosmic_tarot_cards").delete().eq("id", cardId);
  if (error) throw error;
}

export async function fetchAdminLeadershipRadar(): Promise<AdminLeadershipRadar> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || (session.profile.role !== "super_admin" && session.profile.role !== "director")) throw new Error("Leadership Radar chỉ dành cho Super Admin hoặc Director.");
  const { data, error } = await client.rpc("get_admin_leadership_radar_v1");
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(raw.teams) ? raw.teams : [];
  return { windowDays: Number(raw.window_days ?? 30), scope: raw.scope === "agency" ? "agency" : "global", teams: rows.map((row) => { const item = row as Record<string, unknown>; return { teamId: String(item.team_id), teamName: String(item.team_name), leaderName: String(item.leader_name), activeAdvisors: Number(item.active_advisors ?? 0), supportedAdvisors: Number(item.supported_advisors ?? 0), closedPolicies: Number(item.closed_policies ?? 0), empathyScore: Number(item.empathy_score ?? 0), performanceScore: Number(item.performance_score ?? 0) }; }) };
}

export async function fetchTeamOperationalRadar(teamId: string): Promise<TeamOperationalRadar> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || !["leader", "director", "super_admin"].includes(session.profile.role)) throw new Error("Radar vận hành chỉ dành cho Leader, Director hoặc Super Admin.");
  const { data, error } = await client.rpc("get_team_operational_radar_v1", { p_team_id: teamId });
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>; const signals = Array.isArray(raw.signals) ? raw.signals : [];
  return { teamId: String(raw.team_id ?? teamId), teamName: String(raw.team_name ?? "Team"), activeAdvisors: Number(raw.active_advisors ?? 0), touches7d: Number(raw.touches_7d ?? 0), openFollowups: Number(raw.open_followups ?? 0), newSignals: Number(raw.new_signals ?? 0), interventions7d: Number(raw.interventions_7d ?? 0), signals: signals.map((row) => { const item = row as Record<string, unknown>; return { id: String(item.id), memberName: String(item.member_name ?? "TVV trong Team"), signalType: String(item.signal_type ?? "support"), severity: String(item.severity ?? "medium"), summary: String(item.summary ?? "Tín hiệu Team"), status: String(item.status ?? "new"), detectedAt: String(item.detected_at ?? "") }; }) };
}

export async function fetchHeartbeatHierarchy(input: { teamId: string | null; userId: string | null }): Promise<HeartbeatHierarchy> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session) throw new Error("Hãy đăng nhập Pilot để xem Nhịp Đập.");
  const { data, error } = await client.rpc("get_heartbeat_hierarchy_v1", { p_team_id: input.teamId, p_user_id: input.userId });
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>; const teams = Array.isArray(raw.teams) ? raw.teams : []; const users = Array.isArray(raw.users) ? raw.users : []; const logs = Array.isArray(raw.logs) ? raw.logs : []; const summary = (raw.summary ?? {}) as Record<string, unknown>;
  return { scope: raw.scope === "global" || raw.scope === "agency" || raw.scope === "team" ? raw.scope : "self", teams: teams.map((row) => { const item = row as Record<string, unknown>; return { id: String(item.id), name: String(item.name ?? "Team") }; }), users: users.map((row) => { const item = row as Record<string, unknown>; const role = String(item.role ?? "advisor"); return { id: String(item.id), displayName: String(item.display_name ?? "TVV"), teamId: String(item.team_id ?? ""), role: role === "super_admin" || role === "director" || role === "leader" ? role : "advisor" }; }), logs: logs.map((row) => { const item = row as Record<string, unknown>; return { id: String(item.id), userId: String(item.user_id), displayName: String(item.display_name ?? "TVV"), teamId: String(item.team_id ?? ""), teamName: String(item.team_name ?? "Team"), serviceLevel: Number(item.service_level ?? 0), actionResult: String(item.action_result ?? ""), followUpDate: item.follow_up_date ? String(item.follow_up_date) : null, revenueAmount: Number(item.revenue_amount ?? 0), createdAt: String(item.created_at ?? "") }; }), summary: { totalLogs: Number(summary.total_logs ?? 0), completedInteractions: Number(summary.completed_interactions ?? 0), closedDeals: Number(summary.closed_deals ?? 0) } };
}

export async function fetchMyAgentMirror(): Promise<AgentMirror> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || session.profile.role !== "advisor") throw new Error("Hành trình cá nhân chỉ dành cho TVV.");
  const { data, error } = await client.rpc("get_my_agent_mirror_v1");
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>;
  return { weekStart: String(raw.week_start ?? ""), xpEarned: Number(raw.xp_earned ?? 0), learningToolsUsed: Number(raw.learning_tools_used ?? 0), giftsReceived: Number(raw.gifts_received ?? 0), recognitionsReceived: Number(raw.recognitions_received ?? 0), customerMeetings: Number(raw.customer_meetings ?? 0), closedDeals: Number(raw.closed_deals ?? 0), nextTip: String(raw.next_tip ?? "Giữ một nhịp học và một hành động thực chiến trong tuần mới.") };
}

function observedActivityStreak(events: Array<{ event_timestamp: string }>) {
  const activeDays = new Set(events.map((event) => event.event_timestamp.slice(0, 10)));
  const cursor = new Date();
  let streak = 0;
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function executiveActivityPillars(events: Array<{ event_type: ActivityEventType; metadata: JsonObject }>): ExecutiveActivityPillars {
  return events.reduce<ExecutiveActivityPillars>((pillars, event) => {
    if (event.event_type === "learning_session") pillars.learn += 1;
    else if (["meeting_completed", "meeting_logged", "proposal_sent", "policy_closed", "follow_up_completed", "followup_done"].includes(event.event_type)) pillars.execute += 1;
    else pillars.engage += 1;
    return pillars;
  }, { learn: 0, engage: 0, execute: 0 });
}

function executiveMoraleScore(observedStreak: number, activityCount: number) {
  return Math.min(100, observedStreak * 10 + Math.min(30, activityCount * 3));
}

export async function fetchExecutivePerformanceReport(hours = 24 * 7): Promise<ExecutivePerformanceReport> {
  const client = requireSupabase(); const session = await getCurrentPilotSession();
  if (!session || (session.profile.role !== "leader" && session.profile.role !== "super_admin")) throw new Error("Báo cáo Hiệu suất Cấp cao chỉ dành cho Leader hoặc Super Admin.");
  const teamId = session.profile.primary_team_id;
  const rangeStart = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const [teamResult, advisorsResult, activityResult, interventionResult] = await Promise.all([
    client.from("teams").select("name").eq("id", teamId).maybeSingle(),
    client.from("profiles").select("id, display_name").eq("primary_team_id", teamId).eq("role", "advisor").eq("is_active", true),
    client.from("activity_events").select("user_id, event_type, event_timestamp, metadata").eq("team_id", teamId).gte("event_timestamp", rangeStart),
    client.from("interventions").select("user_id, action_status").eq("team_id", teamId).gte("action_date", rangeStart),
  ]);
  const error = [teamResult.error, advisorsResult.error, activityResult.error, interventionResult.error].find(Boolean); if (error) throw error;
  const activities = (activityResult.data ?? []) as Array<{ user_id: string; event_type: ActivityEventType; event_timestamp: string; metadata: JsonObject }>;
  const interventions = (interventionResult.data ?? []) as Array<{ user_id: string; action_status: InterventionActionStatus }>;
  const activitiesByAdvisor = new Map<string, Array<{ event_type: ActivityEventType; event_timestamp: string; metadata: JsonObject }>>();
  for (const activity of activities) activitiesByAdvisor.set(activity.user_id, [...(activitiesByAdvisor.get(activity.user_id) ?? []), activity]);
  const coachingByAdvisor = new Map<string, number>();
  for (const intervention of interventions) if (intervention.action_status !== "cancelled") coachingByAdvisor.set(intervention.user_id, (coachingByAdvisor.get(intervention.user_id) ?? 0) + 1);
  const successfulRevenue = (metadata: JsonObject) => {
    if (!/ký hợp đồng|chốt hđ|thành công/i.test(String(metadata.action_result ?? ""))) return 0;
    const amount = Number(metadata.revenue_amount ?? 0);
    return Number.isFinite(amount) ? Math.max(0, amount) : 0;
  };
  const rows = (advisorsResult.data ?? []).map((advisor: { id: string; display_name: string }) => {
    const advisorActivities = activitiesByAdvisor.get(advisor.id) ?? [];
    const activityCount = advisorActivities.length;
    const observedStreak = observedActivityStreak(advisorActivities);
    const pillars = executiveActivityPillars(advisorActivities);
    const moraleScore = executiveMoraleScore(observedStreak, activityCount);
    const status: ExecutiveAdvisorCorrelation["status"] = activityCount === 0 ? "quiet" : pillars.execute === 0 && activityCount >= 6 ? "false_productivity" : moraleScore >= 70 ? "positive" : "recovering";
    return { userId: advisor.id, displayName: advisor.display_name || "TVV chưa đặt danh xưng", activityCount, pillars, moraleScore, observedStreak, coachingCount: coachingByAdvisor.get(advisor.id) ?? 0, selfReportedRevenue: advisorActivities.reduce((total, activity) => total + successfulRevenue(activity.metadata), 0), status };
  }).sort((left, right) => right.selfReportedRevenue - left.selfReportedRevenue || right.activityCount - left.activityCount);
  const teamMoraleScore = rows.length ? Math.round(rows.reduce((total, row) => total + row.moraleScore, 0) / rows.length) : 0;
  return { teamName: String(teamResult.data?.name ?? "Team chưa đặt tên"), rangeStart, rangeEnd: new Date().toISOString(), totalActivity: activities.length, leaderInterventions: interventions.filter((item) => item.action_status !== "cancelled").length, totalSelfReportedRevenue: rows.reduce((total, row) => total + row.selfReportedRevenue, 0), teamMoraleScore, rows };
}

type SupabaseContentRead<T> = { data: T[] | null; error: { message: string } | null };
type SafeContentRead<T> = { rows: T[]; error?: string };

async function safeContentRead<T>(source: ContentReadKey, request: PromiseLike<SupabaseContentRead<T>>): Promise<SafeContentRead<T>> {
  try {
    const result = await request;
    if (result.error) {
      console.warn(`[Content Library] ${source} unavailable:`, result.error.message);
      return { rows: [], error: result.error.message };
    }
    return { rows: result.data ?? [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể kết nối nguồn dữ liệu.";
    console.warn(`[Content Library] ${source} request failed:`, message);
    return { rows: [], error: message };
  }
}

export async function fetchContentLibrary(): Promise<OperationalLibrary> {
  if (!supabase) {
    throw new Error("Supabase content client is not configured.");
  }

  let isAuthenticated = false;
  try {
    const { data: sessionResult } = await supabase.auth.getSession();
    isAuthenticated = Boolean(sessionResult.session);
  } catch (error) {
    console.warn("[Content Library] Không đọc được session; dùng dữ liệu công khai an toàn.", error);
  }
  const dailyQuizPromise = isAuthenticated
    ? supabase.rpc("get_today_daily_quiz_v1")
    : supabase.from("daily_quizzes").select("code, question, option_a, option_b, option_c, correct_option, explanation, xp_reward, sort_order, is_active").eq("is_active", true).order("sort_order").limit(1);
  const [playbooks, empathy, leaderPlaybookRows, marketing, discQuestions, discProfiles, serviceLevels, xpRewards, dailyQuizzes, coverLetters, newsRows, caseRows] = await Promise.all([
    safeContentRead<PlaybookCard>("playbooks", supabase.from("playbook_cards").select("code, team_id, skill_system, required_level, situation, customer_insight, mindset, core_logic, coaching_prompts, ai_evaluation_rules, is_pro, sort_order").order("sort_order")),
    safeContentRead<EmpathyTerm>("empathy", supabase.from("empathy_dictionary").select("code, legal_term, technical_term, empathy_translation, category, sort_order").order("sort_order")),
    safeContentRead<{ id: string; type: "principle" | "coaching_script"; prefix: string | null; title: string; content: string; note: string | null; tags: string[] | null; share_text: string | null; roleplay_prompt: string | null; mini_quiz: LeadershipMiniQuiz | null; learning_carousel: LeadershipLearningCarousel | null; created_at: string }>("leadership", supabase.from("leader_playbook").select("id, type, prefix, title, content, note, tags, share_text, roleplay_prompt, mini_quiz, learning_carousel, created_at").order("created_at")),
    safeContentRead<MarketingTemplate>("marketing", supabase.from("marketing_templates").select("code, category, occasion, message_template, image_url, sort_order").order("sort_order")),
    safeContentRead<DiscQuestion>("discQuestions", supabase.from("disc_questions").select("code, question, option_d, option_i, option_s, option_c, sort_order").order("sort_order")),
    safeContentRead<DiscProfile>("discProfiles", supabase.from("disc_profiles").select("disc_type, headline, strengths, watch_out, selling_style, source_evidence").order("disc_type")),
    safeContentRead<ServiceLevel>("serviceLevels", supabase.from("service_levels").select("level, label, description, coaching_hint, sort_order").order("sort_order")),
    safeContentRead<XpReward>("xpRewards", supabase.from("xp_rewards").select("code, name, reward_type, xp_cost, status, sort_order, team_id").order("sort_order")),
    safeContentRead<Partial<DailyQuiz>>("dailyQuizzes", dailyQuizPromise),
    safeContentRead<CoverLetter>("coverLetters", supabase.from("cover_letters").select("code, situation, body_template, sort_order").order("sort_order")),
    safeContentRead<{ id: string; title: string; content: string; insight_action: string; category: string; video_url: string | null; created_at: string }>("news", supabase.from("news_90s").select("id, title, content, insight_action, category, video_url, created_at").order("created_at", { ascending: false })),
    safeContentRead<{ id: string; title: string; context_problem: string; lesson_learned: string; video_url: string | null; created_at: string }>("news", supabase.from("case_studies").select("id, title, context_problem, lesson_learned, video_url, created_at").order("created_at", { ascending: false })),
  ]);

  const leadership: SafeContentRead<LeadershipPrinciple> = {
    rows: leaderPlaybookRows.rows.map((item, index) => ({ code: item.id, prefix: item.prefix, topic: item.title, core_thinking: item.content, type: item.type, note: item.note, tags: Array.isArray(item.tags) ? item.tags : [], share_text: item.share_text, roleplay_prompt: item.roleplay_prompt, mini_quiz: item.mini_quiz, learning_carousel: item.learning_carousel, sort_order: index + 1 })),
    error: leaderPlaybookRows.error,
  };
  const news: SafeContentRead<NewsCaseStudy> = {
    rows: [
      ...newsRows.rows.map((item, index) => ({ code: item.id, kind: "news" as const, category: item.category, title: item.title, summary: item.content, field_takeaway: item.insight_action, published_at: item.created_at, sort_order: index + 1, video_url: item.video_url })),
      ...caseRows.rows.map((item, index) => ({ code: item.id, kind: "case" as const, category: "Case Study", title: item.title, summary: item.context_problem, field_takeaway: item.lesson_learned, published_at: item.created_at, sort_order: newsRows.rows.length + index + 1, video_url: item.video_url })),
    ],
    error: [newsRows.error, caseRows.error].filter(Boolean).join(" · ") || undefined,
  };

  const reads: Array<[ContentReadKey, SafeContentRead<unknown>]> = [["playbooks", playbooks], ["empathy", empathy], ["leadership", leadership], ["marketing", marketing], ["discQuestions", discQuestions], ["discProfiles", discProfiles], ["serviceLevels", serviceLevels], ["xpRewards", xpRewards], ["dailyQuizzes", dailyQuizzes], ["coverLetters", coverLetters], ["news", news]];
  const readErrors = Object.fromEntries(reads.filter(([, result]) => result.error).map(([key, result]) => [key, result.error])) as ContentReadErrors;

  return {
    playbooks: playbooks.rows,
    empathy: empathy.rows,
    leadership: leadership.rows,
    marketing: marketing.rows,
    discQuestions: discQuestions.rows,
    discProfiles: discProfiles.rows,
    serviceLevels: serviceLevels.rows,
    xpRewards: xpRewards.rows,
    dailyQuizzes: dailyQuizzes.rows.map(normalizeDailyQuiz),
    coverLetters: coverLetters.rows,
    news: news.rows,
    readErrors,
  };
}

export async function getCurrentSupabaseUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function fetchTodayDailyQuiz(): Promise<DailyQuiz | null> {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const user = await getCurrentSupabaseUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc("get_today_daily_quiz_v1");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? normalizeDailyQuiz(row as Partial<DailyQuiz>) : null;
}

export async function fetchXpLedger() {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const user = await getCurrentSupabaseUser();
  if (!user) return [] as XpLedgerEntry[];
  const { data, error } = await supabase.from("xp_ledger").select("transaction_id, xp_amount, reason, description, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAdvisorProgress(): Promise<AdvisorProgress | null> {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const user = await getCurrentSupabaseUser();
  if (!user) return null;
  const todayStart = getUtcDayStartIso();
  const [profile, quizLedger] = await Promise.all([
    supabase.from("users_profile").select("total_xp, current_streak, coin_balance").eq("user_id", user.id).maybeSingle(),
    supabase.from("xp_ledger").select("transaction_id", { count: "exact", head: true }).eq("user_id", user.id).eq("reason", "daily_quiz").gte("created_at", todayStart),
  ]);
  if (profile.error) throw profile.error;
  if (quizLedger.error) throw quizLedger.error;
  return buildAdvisorProgress(profile.data, quizLedger.count ?? 0);
}

export async function claimDailyQuizXp(): Promise<DailyQuizClaim> {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const user = await getCurrentSupabaseUser();
  if (!user) throw new Error("Hãy đăng nhập Supabase để ghi +10 XP và giữ Chuỗi.");
  const { data, error } = await supabase.rpc("claim_daily_quiz_xp");
  if (error) throw error;
  const claim = Array.isArray(data) ? data[0] : data;
  if (!claim) throw new Error("Không nhận được kết quả Daily Quiz.");
  return claim as DailyQuizClaim;
}

export async function submitDiscAssessment(input: { disc_type: DiscProfileType; score_d: number; score_i: number; score_s: number; score_c: number }) {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const user = await getCurrentSupabaseUser();
  if (!user) return false;
  const { data, error } = await supabase.from("disc_assessments").insert({ ...input, user_id: user.id }).select("assessment_id").single();
  if (error) throw error;
  return String(data.assessment_id);
}

export async function completeDiscCheckpoint(result: DiscProfileType) {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const { data, error } = await supabase.rpc("complete_my_disc_checkpoint_v1", { p_disc_result: result });
  if (error) throw error;
  return String(data ?? result) as DiscProfileType;
}

export async function fetchActiveLeadershipTest(): Promise<LeadershipTest | null> {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const { data, error } = await supabase
    .from("leadership_tests")
    .select("test_key, intro_disclaimer, questions, results")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return row as LeadershipTest;
}

export async function completeLeadershipCheckpoint(style: LeadershipTrait) {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const { data, error } = await supabase.rpc("complete_my_leadership_checkpoint_v1", { p_style: style });
  if (error) throw error;
  return String(data ?? style) as LeadershipTrait;
}

export async function submitFeedback(input: { rating: number; favorite_feature: string; suggestion: string }) {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const user = await getCurrentSupabaseUser();
  const { error } = await supabase.from("user_feedbacks").insert({ ...input, feature: input.favorite_feature, user_id: user?.id ?? null });
  if (error) throw error;
}

export async function submitDailyLog(input: { service_level: number; action_result: "Ký Hợp Đồng" | "Chốt HĐ" | "Dời lịch" | "Từ chối" | "Đã gặp & Đang bám sát"; follow_up_date: string | null; revenue_amount: number }) {
  if (!supabase) throw new Error("Supabase content client is not configured.");
  const user = await getCurrentSupabaseUser();
  if (!user) throw new Error("Hãy đăng nhập Supabase trước khi lưu Nhịp Đập.");
  const { error } = await supabase.from("daily_logs").insert({ ...input, user_id: user.id });
  if (error) throw error;
}

export async function persistAdvisorTarget(input: PersistedTarget): Promise<PersistedTarget> {
  if (!supabase) throw new Error("Supabase chưa được cấu hình để lưu Mục tiêu.");
  const user = await getCurrentSupabaseUser();
  if (!user) throw new Error("Hãy đăng nhập Supabase trước khi lưu Mục tiêu.");
  const { data, error } = await supabase
    .from("users_profile")
    .upsert({ user_id: user.id, target_income: input.targetIncome, required_meetings: input.requiredMeetings }, { onConflict: "user_id" })
    .select("target_income, required_meetings")
    .single();
  if (error) throw error;
  return {
    targetIncome: Number(data.target_income ?? input.targetIncome),
    requiredMeetings: Number(data.required_meetings ?? input.requiredMeetings),
  };
}

export async function fetchMyPlayerCoachGoal(): Promise<PlayerCoachGoal> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("get_my_player_coach_goal_v2");
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>;
  return {
    personalIncome: Number(raw.personal_income ?? 0),
    recruitmentOutreach: Number(raw.recruitment_outreach_target ?? 0),
    activeRatePercent: Number(raw.active_rate_target_percent ?? 0),
    coachingSessions: Number(raw.coaching_1on1_target ?? 0),
    xpBudget: Number(raw.xp_budget_target ?? 0),
    teamStreak7dMembers: Number(raw.team_streak_7d_members_target ?? 0),
  };
}

export async function persistPlayerCoachGoal(input: PlayerCoachGoal): Promise<PlayerCoachGoal> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("upsert_my_player_coach_goal_v2", {
    p_personal_income: Math.max(0, Math.round(input.personalIncome)),
    p_recruitment_outreach_target: Math.max(0, Math.round(input.recruitmentOutreach)),
    p_active_rate_target_percent: Math.min(100, Math.max(0, Math.round(input.activeRatePercent))),
    p_coaching_1on1_target: Math.max(0, Math.round(input.coachingSessions)),
    p_xp_budget_target: Math.max(0, Math.round(input.xpBudget)),
    p_team_streak_7d_members_target: Math.max(0, Math.round(input.teamStreak7dMembers)),
  });
  if (error) throw error;
  const raw = data as Record<string, unknown>;
  return {
    personalIncome: Number(raw.personal_income ?? 0),
    recruitmentOutreach: Number(raw.recruitment_outreach_target ?? 0),
    activeRatePercent: Number(raw.active_rate_target_percent ?? 0),
    coachingSessions: Number(raw.coaching_1on1_target ?? 0),
    xpBudget: Number(raw.xp_budget_target ?? 0),
    teamStreak7dMembers: Number(raw.team_streak_7d_members_target ?? 0),
  };
}

function radarNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function leaderGoalMetricKey(value: unknown): LeaderGoalMetricKey {
  return value === "personal_income" || value === "recruitment_outreach" || value === "active_rate" || value === "coaching_sessions"
    ? value
    : "coaching_sessions";
}

export async function fetchLeaderGoalRadarSnapshot(): Promise<LeaderGoalRadarSnapshot> {
  const client = requireSupabase();
  const session = await getCurrentPilotSession();
  if (!session || !["leader", "director"].includes(session.profile.role)) {
    throw new Error("Đánh giá mục tiêu Radar chỉ dành cho Leader hoặc Director.");
  }
  const { data, error } = await client.rpc("evaluate_my_leader_goal_radar_v1");
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, unknown>;
  const goals = (raw.goals ?? {}) as Record<string, unknown>;
  const actuals = (raw.actuals ?? {}) as Record<string, unknown>;
  const openSignals = Array.isArray(raw.open_signals) ? raw.open_signals : [];
  return {
    monthStart: String(raw.month_start ?? ""),
    monthEnd: String(raw.month_end ?? ""),
    goals: {
      personalIncome: radarNumber(goals.personal_income),
      recruitmentOutreach: radarNumber(goals.recruitment_outreach),
      activeRatePercent: radarNumber(goals.active_rate_percent),
      coachingSessions: radarNumber(goals.coaching_sessions),
    },
    actuals: {
      personalIncome: radarNumber(actuals.personal_income),
      recruitmentOutreach: radarNumber(actuals.recruitment_outreach),
      activeRatePercent: radarNumber(actuals.active_rate_percent),
      activeAdvisors: radarNumber(actuals.active_advisors),
      activeAdvisorsActual: radarNumber(actuals.active_advisors_actual),
      coachingSessions: radarNumber(actuals.coaching_sessions),
    },
    openSignals: openSignals.map((entry) => {
      const signal = entry as Record<string, unknown>;
      return {
        metricKey: leaderGoalMetricKey(signal.metric_key),
        severity: signal.severity === "critical" || signal.severity === "high" || signal.severity === "medium" ? signal.severity : "low",
        summary: String(signal.summary ?? "Mục tiêu quản trị đang cần được theo dõi."),
        actual: radarNumber(signal.actual),
        goal: radarNumber(signal.goal),
      };
    }),
  };
}

export type ActiveLearningChallenge = { id: string; playbookCode: string; playbookTitle: string; acceptedAt: string };
export type LearningChallengeProofAward = { awarded: boolean; xpAmount: number; totalXp: number; currentStreak: number };

export async function fetchMyActiveLearningChallenge(): Promise<ActiveLearningChallenge | null> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("get_my_active_learning_challenge_v1");
  if (error) throw error;
  if (!data) return null;
  const raw = data as Record<string, unknown>;
  return { id: String(raw.id), playbookCode: String(raw.playbook_code), playbookTitle: String(raw.playbook_title), acceptedAt: String(raw.accepted_at) };
}

export async function acceptLearningChallenge(playbookCode: string): Promise<ActiveLearningChallenge> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("accept_learning_challenge_v1", { p_playbook_code: playbookCode });
  if (error) throw error;
  const raw = data as Record<string, unknown>;
  return { id: String(raw.id), playbookCode: String(raw.playbook_code), playbookTitle: String(raw.playbook_title), acceptedAt: String(raw.accepted_at) };
}

export async function completeLearningChallengeProof(challengeId: string, activityId: string): Promise<LearningChallengeProofAward> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("complete_learning_challenge_proof_v1", { p_challenge_id: challengeId, p_activity_id: activityId });
  if (error) throw error;
  const raw = data as Record<string, unknown>;
  return { awarded: Boolean(raw.awarded), xpAmount: Number(raw.xp_amount ?? 0), totalXp: Number(raw.total_xp ?? 0), currentStreak: Number(raw.current_streak ?? 0) };
}
