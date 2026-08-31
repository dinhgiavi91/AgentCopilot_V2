import { describe, expect, it } from "vitest";
import { buildAiRoleplayPayload } from "../client/src/components/BaoBoiStudio";
import type { PlaybookCard } from "../client/src/lib/supabaseContent";

const playbook: PlaybookCard = {
  code: "W001",
  skill_system: "Pháp lý & Tuân thủ",
  required_level: "Rookie",
  situation: "Khách ngại đồng ý ghi âm tư vấn.",
  customer_insight: "Khách sợ lộ thông tin và bị gài bẫy.",
  mindset: "Ghi âm bảo vệ quyền lợi khách hàng.",
  core_logic: "Dùng góc nhìn bảo vệ thay vì áp đặt quy định.",
  coaching_prompts: "Dạ em xin phép ghi âm để bảo vệ quyền lợi của mình.",
  is_pro: false,
  sort_order: 1,
};

describe("BaoBoi AI Roleplay payload", () => {
  it("ánh xạ đủ tình huống Iceberg và bản nháp vào hợp đồng API-ready", () => {
    const payload = buildAiRoleplayPayload(playbook, "  Dạ em hiểu băn khoăn của anh/chị.  ");

    expect(payload).toEqual({
      system_prompt: expect.stringContaining("ba tiêu chí"),
      context: {
        situation: playbook.situation,
        customer_insight: playbook.customer_insight,
        mindset: playbook.mindset,
        core_logic: playbook.core_logic,
        standard_script: playbook.coaching_prompts,
      },
      user_transcript: "Dạ em hiểu băn khoăn của anh/chị.",
    });
  });
});
