import { useTranslation } from "react-i18next";
import HorizontalBarChart from "~/components/ui/HorizontalBarChart";
import type { IntegrationInsightsGroupedByIntegrationDTO } from "~/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO";
import { platformToChartColor, platformTranslationKeys } from "~/models/enums/Platform";
import { computeEngagementRate } from "~/utils/insightHelpers";

interface HomeEngagementChartProps {
    groups: IntegrationInsightsGroupedByIntegrationDTO[];
}

export default function HomeEngagementChart({ groups }: HomeEngagementChartProps) {
    const { t } = useTranslation();

    const data = groups
        .map((group) => {
            const engagementRate = computeEngagementRate(group.insights);
            if (engagementRate === null) return null;

            return {
                label: t(platformTranslationKeys[group.integration.platform]),
                value: engagementRate,
                color: platformToChartColor[group.integration.platform],
            };
        })
        .filter((d): d is NonNullable<typeof d> => d !== null);

    return (
        <div className="border border-pale-gray rounded-lg p-3">
            <h2 className="text-heading-sm mb-3">{t("home:engagementByPlatform")}</h2>
            {data.length > 0 ? (
                <HorizontalBarChart data={data} />
            ) : (
                <div className="w-full h-30 flex items-center justify-center">
                    <p className="text-body-sm text-muted-2">{t("home:engagementByPlatformEmpty")}</p>
                </div>
            )}
        </div>
    );
}
