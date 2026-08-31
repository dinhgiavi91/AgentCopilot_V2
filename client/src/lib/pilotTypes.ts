/**
 * Pilot Data Loop domain contracts. These types deliberately have no UI dependency.
 * They mirror `supabase/migrations/20260818143000_pilot_data_loop_step1.sql`.
 */

export type PilotRole = "super_admin" | "director" | "leader" | "advisor";
export type PilotTeamStatus = "active" | "paused" | "archived";
export type ActivityEventType = "daily_checkin" | "service_touch" | "meeting_completed" | "proposal_sent" | "policy_closed" | "follow_up_completed" | "heartbeat" | "meeting_logged" | "followup_created" | "followup_done" | "learning_session" | "other";
export type ServiceStage = "prospecting" | "discovery" | "proposal" | "underwriting" | "issued" | "after_sales" | "other";
export type FollowupStatus = "open" | "done" | "overdue" | "cancelled";
export type SignalType = "low_activity" | "followup_overdue" | "conversion_drop" | "streak_break" | "high_rejection" | "intervention_due" | "other";
export type SignalSeverity = "low" | "medium" | "high" | "critical";
export type SignalStatus = "new" | "reviewed" | "dismissed" | "acted_on";
export type SignalEngineRuleKey = "activity_drop" | "followup_gap";
export type ReviewOutcome = "relevant" | "not_relevant" | "need_more_context";
export type InterventionType = "checkin" | "coaching_1on1" | "roleplay" | "goal_reset" | "shadow_support" | "other";
export type InterventionActionStatus = "planned" | "done" | "cancelled";
export type InterventionCheckpointDay = "d1" | "d7" | "d14" | "d30";
export type RecoveryStatus = "recovered" | "not_recovered" | "insufficient_data";

export type JsonObject = Record<string, unknown>;

export type Team = {
  id: string;
  name: string;
  parent_team_id?: string | null;
  status: PilotTeamStatus;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: PilotRole;
  primary_team_id: string;
  is_active: boolean;
  xp_balance: number;
  onboarding_completed_at: string | null;
  disc_result: string | null;
  leadership_style?: "Visionary" | "Architect" | "Nurturer" | "Coach" | null;
  leadership_style_description?: string | null;
  created_at: string;
};

export type ActivityEvent = {
  id: string;
  user_id: string;
  team_id: string;
  event_type: ActivityEventType;
  event_date: string;
  event_timestamp: string;
  quantity: number;
  metadata: JsonObject;
  created_at: string;
};

export type Followup = {
  id: string;
  user_id: string;
  team_id: string;
  /** A non-identifying alias only; customer names, phones and emails are prohibited. */
  alias_label: string;
  service_stage: ServiceStage;
  due_date: string;
  completed_at: string | null;
  status: FollowupStatus;
  created_at: string;
};

export type Signal = {
  id: string;
  user_id: string;
  team_id: string;
  signal_type: SignalType;
  window_days: number;
  threshold_version: string;
  severity: SignalSeverity;
  summary: string;
  detected_at: string;
  status: SignalStatus;
  metadata: JsonObject;
  created_at: string;
};

export type SignalReview = {
  id: string;
  signal_id: string;
  reviewer_id: string;
  review_outcome: ReviewOutcome;
  note: string | null;
  reviewed_at: string;
  created_at: string;
};

export type SignalEngineRuleConfig = {
  rule_key: SignalEngineRuleKey;
  is_enabled: boolean;
  evaluation_window_hours: number;
  severity: SignalSeverity;
  threshold_version: string;
  updated_at: string;
  updated_by: string | null;
};

export type SignalEngineRun = {
  run_id: string | null;
  dry_run: boolean;
  evaluated_at: string;
  candidate_count: number;
  created_count: number;
  activity_drop_candidates: number;
  followup_gap_candidates: number;
  activity_drop_created: number;
  followup_gap_created: number;
  threshold_versions: Record<SignalEngineRuleKey, string>;
};

export type OutcomeEvaluatorRun = {
  run_id: string | null;
  dry_run: boolean;
  checkpoint_day: InterventionCheckpointDay;
  checkpoint_hours: number;
  evaluated_at: string;
  candidate_count: number;
  recovered_count: number;
  not_recovered_count: number;
  created_count: number;
};

export type Intervention = {
  id: string;
  signal_id: string | null;
  user_id: string;
  team_id: string;
  leader_id: string;
  intervention_type: InterventionType;
  action_status: InterventionActionStatus;
  action_date: string;
  rationale: string;
  note: string | null;
  created_at: string;
};

export type InterventionOutcome = {
  id: string;
  intervention_id: string;
  checkpoint_day: InterventionCheckpointDay;
  recovery_status: RecoveryStatus;
  note: string | null;
  measured_at: string;
  created_at: string;
};

export type PilotDataLoop = {
  activity: ActivityEvent;
  signal: Signal;
  review: SignalReview;
  intervention: Intervention;
  outcome: InterventionOutcome;
};

export type NewActivityEvent = Omit<ActivityEvent, "id" | "created_at" | "event_timestamp"> & { event_timestamp?: string };
export type NewFollowup = Omit<Followup, "id" | "created_at" | "completed_at" | "status"> & Partial<Pick<Followup, "completed_at" | "status">>;
export type NewSignalReview = Omit<SignalReview, "id" | "created_at" | "reviewed_at"> & { reviewed_at?: string };
export type NewIntervention = Omit<Intervention, "id" | "created_at">;
export type NewInterventionOutcome = Omit<InterventionOutcome, "id" | "created_at" | "measured_at"> & { measured_at?: string };
