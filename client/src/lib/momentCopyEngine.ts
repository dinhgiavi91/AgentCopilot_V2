export type MomentType = "recovery" | "consistency" | "leader_recognition";
export type Tone = "calm" | "warm" | "proud" | "encouraging" | "grateful";

export const SYSTEM_MESSAGES = {
  recovery: {
    title: "BẠN ĐÃ TÌM LẠI NHỊP",
    proof: "Ghi nhận hoạt động đầu tiên sau chuỗi ngày chững lại.",
    tones: {
      calm: "Có những lúc mình chậm lại là chuyện bình thường. Điều đáng ghi nhận là bạn đã chủ động quay lại.",
      warm: "Những cố gắng nhỏ để bắt nhịp lại luôn đáng được nhìn thấy.",
      proud: "Một bước lùi nhỏ để lấy đà cho sự trở lại mạnh mẽ. Tự hào vì bạn đã bước tiếp.",
      encouraging: "Không phải ngày nào cũng cần bứt phá. Quan trọng là mình đã không bỏ cuộc.",
      grateful: "Cảm ơn vì bạn đã không chọn cách im lặng mà quyết định quay trở lại đường đua.",
    },
  },
} as const;
