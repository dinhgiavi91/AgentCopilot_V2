import { useMemo } from "react";
import { type PlaybookCard } from "../lib/supabaseContent";
import { PilotAdminCMS } from "./PilotAdminCMS";

const PLAYBOOK_SCHEMA = ["playbooks"] as const;

type BaoBoiCMSProps = {
  playbooks: PlaybookCard[];
  onPlaybooksChanged: () => Promise<void> | void;
};

/** Contextual CMS for playbook_cards. Existing Supabase columns are preserved. */
export function BaoBoiCMS({ playbooks, onPlaybooksChanged }: BaoBoiCMSProps) {
  const initialRecords = useMemo(
	  () => playbooks.map(({ is_pro: _isPro, ai_evaluation_rules: _aiEvaluationRules, ...playbook }) => ({
      ...playbook,
      customer_insight: playbook.customer_insight ?? "",
      core_logic: playbook.core_logic ?? "",
      coaching_prompts: playbook.coaching_prompts ?? "",
    })),
    [playbooks]
  );

  return (
    <div className="screen-enter baoboi-manager-view">
      <div className="mx-auto mb-5 max-w-5xl rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-950 sm:px-5">
        <strong>Quản lý Bảo Bối theo Hệ Kỹ Năng.</strong> Thay đổi sẽ đồng bộ cho La Bàn Kỹ Năng ngay sau khi lưu. Hiện có {playbooks.length} thẻ trong thư viện.
      </div>
      <PilotAdminCMS
        allowedSchemas={PLAYBOOK_SCHEMA}
        defaultSchema="playbooks"
        title="Quản lý Bảo Bối"
        description="Tạo, cập nhật hoặc xóa Bảo Bối trên playbook_cards; quản trị đủ Insight, Mindset, Logic cốt lõi và Kịch bản mà không cần triển khai mã nguồn."
        initialRecords={initialRecords}
        onContentChanged={onPlaybooksChanged}
      />
    </div>
  );
}
