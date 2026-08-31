import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("Agent Celebration mount contract", () => {
  it("gắn modal tại root Dashboard TVV với Recognition Realtime thay cho nút test", () => {
    for (const token of [
      'import AgentMomentCelebrationModal from "../components/AgentMomentCelebrationModal"',
      "const [showCelebration, setShowCelebration] = useState(false)",
      "const [incomingRecognition, setIncomingRecognition] = useState<RecognitionRecord | null>(null)",
      "subscribeIncomingRecognitions(pilotSession.userId",
      "fetchLatestPendingRecognition(pilotSession.userId)",
      "const fulfilled = await claimRecognition(incomingRecognition.id)",
      "coin_balance: fulfilled.coinBalance",
      "coins={pilotSession?.profile.role === \"leader\" ? Number(pilotSession.profile.xp_balance) : advisorCoins}",
      "Ting Ting! Bạn vừa nhận một Thẻ Vinh Danh từ Leader.",
      "<AgentMomentCelebrationModal",
      "isOpen={showCelebration}",
      "cardData={incomingRecognition ?",
      "claimRecognition(incomingRecognition.id)",
    ]) {
      expect(home).toContain(token);
    }
    expect(home).not.toContain("celebration-test-trigger");
  });
});
