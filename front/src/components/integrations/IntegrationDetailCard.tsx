import { useTranslation } from "react-i18next";
import { Platform, platformToBgFullClass, platformTranslationKeys } from "~/models/enums/Platform";
import { IntegrationInsightType, integrationInsightTypeTranslationKeys } from "~/models/enums/IntegrationInsightType";
import { formatCompactNumber } from "~/utils/numberFormatters";
import { getInsightValue, computeEngagementRate } from "~/utils/insightHelpers";
import type { IntegrationInsightsGroupedByIntegrationDTO } from "~/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO";
import IntegrationProfileInfo from "./IntegrationProfileInfo";
import { Button } from "~/components/ui/Button";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";

interface IntegrationDetailCardProps {
  platform: Platform;
  group: IntegrationInsightsGroupedByIntegrationDTO | null;
  projectUuid: string | null;
}

interface MetricRowProps {
  label: string;
  value: string;
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex flex-row justify-between items-center">
      <span className="text-body-xs">{label}</span>
      <span className="text-heading-xs">{value}</span>
    </div>
  );
}

export default function IntegrationDetailCard({ platform, group, projectUuid }: IntegrationDetailCardProps) {
  const { t } = useTranslation();
  const { createIntegration, isPending: isConnecting } = useCreateIntegration({ projectUuid: projectUuid ?? "", platform });

  const formatMetric = (type: IntegrationInsightType) =>
    group ? formatCompactNumber(getInsightValue(group.insights, type)) : "—";

  const engagementValue = (() => {
    if (!group) return "—";
    const rate = computeEngagementRate(group.insights);
    return rate !== null ? `${rate.toFixed(1)}%` : "—";
  })();

  return (
    <div className="border border-pale-gray rounded-lg p-3 flex flex-col gap-3 w-50">
      <div className={`h-1 w-full rounded ${platformToBgFullClass[platform]}`}></div>
      <IntegrationProfileInfo integration={group?.integration ?? null} platform={platform} />
      <div className="flex flex-col gap-2">
        <MetricRow
          label={t(integrationInsightTypeTranslationKeys[IntegrationInsightType.TotalFollowers])}
          value={formatMetric(IntegrationInsightType.TotalFollowers)}
        />
        <MetricRow
          label={t(integrationInsightTypeTranslationKeys[IntegrationInsightType.Views])}
          value={formatMetric(IntegrationInsightType.Views)}
        />
        <MetricRow label={t("integrations:engagement")} value={engagementValue} />
        <MetricRow
          label={t(integrationInsightTypeTranslationKeys[IntegrationInsightType.Reach])}
          value={formatMetric(IntegrationInsightType.Reach)}
        />
      </div>
      {!group && (
        <Button
          style="primary"
          width="w-full"
          height="h-6"
          isLoading={isConnecting}
          disabled={!projectUuid || isConnecting}
          onClick={() => projectUuid && createIntegration()}
        >
          {t("integrations:connectPlatform", { platform: t(platformTranslationKeys[platform]) })}
        </Button>
      )}
    </div>
  );
}
