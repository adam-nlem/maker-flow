import { useTranslation } from "react-i18next";
import { platformToBgFullClass } from "~/models/enums/Platform";
import { IntegrationInsightType, integrationInsightTypeTranslationKeys } from "~/models/enums/IntegrationInsightType";
import { formatCompactNumber } from "~/utils/numberFormatters";
import { getInsightValue, computeEngagementRate } from "~/utils/insightHelpers";
import type { IntegrationInsightsGroupedByIntegrationDTO } from "~/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO";
import IntegrationProfileInfo from "../integrations/IntegrationProfileInfo";

interface IntegrationDetailCardRowProps {
    groups: IntegrationInsightsGroupedByIntegrationDTO[];
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

export default function IntegrationDetailCardRow({ groups }: IntegrationDetailCardRowProps) {
    const { t } = useTranslation();

    if (groups.length === 0) return null;

    return (
            <div className="flex flex-row gap-3">
                {groups.map((group) => {
                    const { integration, insights } = group;
                    const engagementRate = computeEngagementRate(insights);
                    return (
                        <div key={integration.uuid} className={`border border-pale-gray rounded-lg p-3 flex flex-col gap-3 w-50`}>
                            <div className={`h-1 w-full rounded ${platformToBgFullClass[integration.platform]}`}></div>
                            <IntegrationProfileInfo integration={integration} />

                            <div className="flex flex-col gap-2">
                                <MetricRow label={t(integrationInsightTypeTranslationKeys[IntegrationInsightType.TotalFollowers])} value={formatCompactNumber(getInsightValue(insights, IntegrationInsightType.TotalFollowers))} />
                                <MetricRow label={t(integrationInsightTypeTranslationKeys[IntegrationInsightType.Views])} value={formatCompactNumber(getInsightValue(insights, IntegrationInsightType.Views))} />
                                <MetricRow label={t("integrations:engagement")} value={engagementRate !== null ? `${engagementRate.toFixed(1)}%` : "—"} />
                                <MetricRow label={t(integrationInsightTypeTranslationKeys[IntegrationInsightType.Reach])} value={formatCompactNumber(getInsightValue(insights, IntegrationInsightType.Reach))} />
                            </div>
                        </div>
                    );
                })}
            </div>
    );
}
