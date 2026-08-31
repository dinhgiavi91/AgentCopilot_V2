import { useMemo } from "react";
import { type MarketingTemplate } from "../lib/supabaseContent";
import { PilotAdminCMS } from "./PilotAdminCMS";

const MARKETING_SCHEMA = ["marketing"] as const;

type MarketingManagerProps = {
  templates: MarketingTemplate[];
  onTemplatesChanged: () => Promise<void> | void;
};

/** Contextual Admin for the Marketing 1-Chạm module. */
export function MarketingManager({ templates, onTemplatesChanged }: MarketingManagerProps) {
  const initialRecords = useMemo(
    () => templates.map((template) => ({ ...template, image_url: template.image_url ?? "" })),
    [templates]
  );
  return (
    <div className="screen-enter marketing-manager-view">
      <div className="mx-auto mb-5 max-w-5xl rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900 sm:px-5">
        <strong>Quản lý phôi theo ngữ cảnh.</strong> Thay đổi dưới đây sẽ đồng bộ ngay cho Marketing Studio. Hiện có {templates.length} phôi trong thư viện.
      </div>
      <PilotAdminCMS
        allowedSchemas={MARKETING_SCHEMA}
        defaultSchema="marketing"
        title="Quản lý Phôi Marketing"
        description="Thêm, chỉnh sửa hoặc xóa phôi Marketing 1-Chạm và xem trước trước khi đồng bộ cho TVV."
        initialRecords={initialRecords}
        onContentChanged={onTemplatesChanged}
      />
    </div>
  );
}
