import { EyeIcon, FireIcon, UsersIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import InsightTile from "~/components/insights/InsightTile";
import type { IntegrationInsightsOverviewDTO } from "~/dtos/integrationInsights/IntegrationInsightsOverviewDTO";

interface HomeOverviewCardsProps {
    overview: IntegrationInsightsOverviewDTO | null;
}

export default function HomeOverviewCards({ overview }: HomeOverviewCardsProps) {
    const { t } = useTranslation();

    if (!overview) return null;

    return (
        <div>
            <h2 className="text-body-xs  uppercase tracking-wider mb-3">{t("home:overview.header")}</h2>
            <div className="flex flex-row flex-wrap gap-3">
                <InsightTile
                    label={t("home:overview.totalFollowers")}
                    value={overview.totalFollowers}
                    Icon={UsersIcon}
                    evolutionPercentage={overview.totalFollowersEvolution}
                />
                <InsightTile
                    label={t("home:overview.totalViews")}
                    value={overview.totalViews}
                    Icon={EyeIcon}
                    evolutionPercentage={overview.totalViewsEvolution}
                />
                <InsightTile
                    label={t("home:overview.engagement")}
                    value={overview.engagementRate ?? 0}
                    Icon={FireIcon}
                    evolutionPercentage={overview.engagementRateEvolution}
                />
            </div>
        </div>
    );
}
