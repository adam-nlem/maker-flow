import { platformToBgFullClass } from "~/models/enums/Platform";
import { IntegrationInsightType, integrationInsightTypeToFrenchTranslation } from "~/models/enums/IntegrationInsightType";
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
    if (groups.length === 0) return null;

    return (
            <div className="flex flex-col gap-3 md:flex-row">
                {groups.map((group) => {
                    const { integration, insights } = group;
                    const engagementRate = computeEngagementRate(insights);
                    return (
                        <div key={integration.uuid} className={`border border-light-gray rounded-lg p-3 flex flex-col gap-3 w-50`}>
                            <div className={`h-1 w-full rounded ${platformToBgFullClass[integration.platform]}`}></div>
                            <IntegrationProfileInfo integration={integration} />

                            <div className="flex flex-col gap-2">
                                <MetricRow label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.TotalFollowers]} value={formatCompactNumber(getInsightValue(insights, IntegrationInsightType.TotalFollowers))} />
                                <MetricRow label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.Views]} value={formatCompactNumber(getInsightValue(insights, IntegrationInsightType.Views))} />
                                <MetricRow label="Engagement" value={engagementRate !== null ? `${engagementRate.toFixed(1)}%` : "—"} />
                                <MetricRow label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.Reach]} value={formatCompactNumber(getInsightValue(insights, IntegrationInsightType.Reach))} />
                            </div>
                        </div>
                    );
                })}
            </div>
    );
}
