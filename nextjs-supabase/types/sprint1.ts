export type UserPlan = "Gói Khởi Động" | "Gói Tăng Tốc";
export type ActionResult = "Chốt HĐ" | "Dời lịch" | "Từ chối";

export type UserProfile = {
  user_id: string;
  role: UserPlan;
  target_income: number;
  required_meetings: number;
  current_streak: number;
  total_xp: number;
};

export type DailyLog = {
  log_id: string;
  service_level: 1 | 2 | 3 | 4 | 5 | 6;
  action_result: ActionResult;
  follow_up_date: string | null;
  revenue_amount: number;
};
