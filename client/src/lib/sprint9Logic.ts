import { containsPotentialContactPii } from "./sprint6Logic";

export type AdvisorRank = "newbie" | "specialist" | "manager";

export const rankProfiles: Record<AdvisorRank, { label: string; closeRate: number; meetingValue: number }> = {
  newbie: { label: "Newbie 1 tháng", closeRate: 0.025, meetingValue: 750_000 },
  specialist: { label: "Chuyên viên 1 năm", closeRate: 0.04, meetingValue: 1_050_000 },
  manager: { label: "Quản lý", closeRate: 0.06, meetingValue: 1_350_000 },
};

export function calculateFlexibleTarget(bhntIncome: number, pntIncome: number, rank: AdvisorRank) {
  const profile = rankProfiles[rank];
  const totalIncome = Math.max(0, bhntIncome) + Math.max(0, pntIncome);
  const requiredMeetings = totalIncome ? Math.max(1, Math.ceil(totalIncome / (profile.meetingValue * profile.closeRate))) : 0;
  return { totalIncome, requiredMeetings, closeRate: profile.closeRate, rankLabel: profile.label };
}

export function validateJournalEntry(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 8) return "Hãy chia sẻ ít nhất 8 ký tự về trải nghiệm của bạn.";
  if (containsPotentialContactPii(trimmed)) return "Nhật Ký không thể chứa email hoặc số điện thoại khách hàng.";
  return null;
}

export type CustomerStage = "pre_sale" | "post_sale";
export type NurtureContext = "expecting" | "new_parent" | "health_recovery" | "financial_goal" | "renewal" | "other";

export const customerStages: Record<CustomerStage, { label: string; description: string }> = {
  pre_sale: { label: "Trước Bán", description: "Đang tìm hiểu hoặc được chăm sóc; ưu tiên tạo thiện cảm, không ép chốt." },
  post_sale: { label: "Sau Bán", description: "Đã có hợp đồng; ưu tiên đồng hành, hướng dẫn quyền lợi và giữ liên hệ bền vững." },
};

export const nurtureContexts: Record<NurtureContext, string> = {
  expecting: "Chuẩn bị đón em bé",
  new_parent: "Cha/mẹ có con nhỏ",
  health_recovery: "Đang hồi phục sức khỏe",
  financial_goal: "Đang lập kế hoạch tài chính",
  renewal: "Chuẩn bị rà soát quyền lợi",
  other: "Khác / bối cảnh riêng",
};

export function validateCustomerJournalEntry(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 8) return "Hãy ghi ít nhất 8 ký tự về hành động chăm sóc, không dùng tên khách hàng.";
  if (containsPotentialContactPii(trimmed)) return "Nhật Ký Khách Hàng không thể chứa email hoặc số điện thoại.";
  return null;
}

export function getNurtureSuggestion(stage: CustomerStage, context: NurtureContext) {
  const suggestions: Record<NurtureContext, { title: string; action: string; cadence: string }> = {
    expecting: { title: "Chăm sóc trước khi tư vấn", action: "Đừng chốt sale vội. Hãy chia sẻ Cẩm nang đi sinh hoặc lời chúc ngắn phù hợp với sự cho phép của khách.", cadence: "Gợi ý chạm lại sau 7 ngày" },
    new_parent: { title: "Ưu tiên sự thấu hiểu", action: "Gửi một mẹo nhỏ về chăm sóc gia đình hoặc nhắc quyền lợi thiết thực; giữ nội dung ngắn và không tạo áp lực phản hồi.", cadence: "Gợi ý chạm lại sau 10 ngày" },
    health_recovery: { title: "Hỏi thăm trước, tư vấn sau", action: "Gửi lời hỏi thăm chân thành và một nội dung phục hồi sức khỏe đáng tin cậy. Chỉ chuyển sang tư vấn khi khách chủ động.", cadence: "Gợi ý chạm lại sau 14 ngày" },
    financial_goal: { title: "Gỡ rối bằng một bước nhỏ", action: "Chia sẻ một checklist quản trị dòng tiền hoặc câu hỏi tự đánh giá mục tiêu, thay vì gửi ngay bảng minh họa.", cadence: "Gợi ý chạm lại sau 5 ngày" },
    renewal: { title: "Chủ động đồng hành quyền lợi", action: "Nhắc khách rà soát quyền lợi, cập nhật thay đổi quan trọng và chuẩn bị câu hỏi trước kỳ rà soát.", cadence: "Gợi ý chạm lại sau 7 ngày" },
    other: { title: "Lắng nghe trước khi thiết kế bước tiếp theo", action: "Ghi lại hành động không định danh đã được khách đồng ý; dùng một câu hỏi mở và chỉ hẹn lại khi khách thấy phù hợp.", cadence: "Gợi ý chạm lại sau 7 ngày" },
  };
  const suggestion = suggestions[context];
  return { ...suggestion, stageLabel: customerStages[stage].label };
}

export function getJournalNextSteps(note: string, stage: CustomerStage, context: NurtureContext) {
  const normalized = note.toLocaleLowerCase("vi-VN");
  const foundation = getNurtureSuggestion(stage, context);
  const steps = [foundation.action];
  if (/dời|hẹn lại|follow.?up|ngày|tuần sau/.test(normalized)) steps.unshift("Xác nhận lại một khung giờ cụ thể, sau đó ghi ngày follow-up thay vì lưu thông tin liên lạc.");
  else if (/cân nhắc|suy nghĩ|lo lắng|phí|so sánh/.test(normalized)) steps.unshift("Gửi một câu hỏi mở ngắn để hiểu điều cần cân nhắc; chưa gửi thêm bảng minh họa hay thúc ép phản hồi.");
  else if (/quyền lợi|hợp đồng|bảo hiểm|rà soát/.test(normalized)) steps.unshift("Mời khách tự chuẩn bị một câu hỏi về quyền lợi, rồi hẹn một chạm rà soát ngắn.");
  else steps.unshift("Giữ cuộc chạm tiếp theo ngắn, chỉ nhắc lại điều khách đã đồng ý và kết thúc bằng một lựa chọn thời điểm phù hợp.");
  return { title: "Gợi ý hành động tiếp theo", cadence: foundation.cadence, steps };
}

export function nextNurtureStreak(currentStreak: number, didCompleteTouch: boolean) {
  return didCompleteTouch ? Math.max(1, currentStreak + 1) : Math.max(0, currentStreak);
}

export type RadarSignal = "rejection" | "streak" | "reschedule";

export function getEmpathySuggestion(signal: RadarSignal) {
  const suggestions: Record<RadarSignal, { tone: "critical" | "warm" | "watch"; message: string; action: string }> = {
    rejection: { tone: "critical", message: "Gặp 5 KH nhưng bị từ chối 100%.", action: "Rủ đi thực chiến cùng để quan sát kỹ năng chốt và mở câu hỏi." },
    streak: { tone: "warm", message: "Mất chuỗi 5 ngày sau một tuần năng nổ.", action: "Hẹn uống cafe, hỏi thăm sức khỏe và tinh thần trước khi bàn KPI." },
    reschedule: { tone: "watch", message: "Dời lịch lặp lại trong tuần.", action: "Coaching cách chốt thời điểm follow-up và xác nhận cam kết nhỏ." },
  };
  return suggestions[signal];
}

export function buildDirectorSummary(signals: Array<{ type: RadarSignal }>) {
  const rejectionCount = signals.filter((signal) => signal.type === "rejection").length;
  const streakCount = signals.filter((signal) => signal.type === "streak").length;
  const focus = rejectionCount ? "kỹ năng chuyển đổi sau cuộc gặp" : streakCount ? "duy trì nhịp và tinh thần" : "kỷ luật follow-up";
  return `Điểm nghẽn ưu tiên là ${focus}. Chiến lược tuần tới: phân cặp coaching, theo dõi một hành động nhỏ mỗi ngày và review tín hiệu Radar vào cuối tuần.`;
}
