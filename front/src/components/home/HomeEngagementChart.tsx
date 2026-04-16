import HorizontalBarChart from "~/components/ui/HorizontalBarChart";
import type { IntegrationInsightsGroupedByIntegrationDTO } from "~/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO";
import { platformToChartColor, platformToFrenchTranslation } from "~/models/enums/Platform";
import { computeEngagementRate } from "~/utils/insightHelpers";

interface HomeEngagementChartProps {
    groups: IntegrationInsightsGroupedByIntegrationDTO[];
}

export default function HomeEngagementChart({ groups }: HomeEngagementChartProps) {
    const data = groups
        .map((group) => {
            const engagementRate = computeEngagementRate(group.insights);
            if (engagementRate === null) return null;

            return {
                label: platformToFrenchTranslation[group.integration.platform],
                value: engagementRate,
                color: platformToChartColor[group.integration.platform],
            };
        })
        .filter((d): d is NonNullable<typeof d> => d !== null);

    if (data.length === 0) return null;

    return (
        <div className="border border-light-gray rounded-lg p-3">
            <h2 className="text-heading-sm mb-3">Engagement par plateforme</h2>
            <HorizontalBarChart data={data} />
        </div>
    );
}
