import { EyeIcon, FireIcon, SignalIcon, UsersIcon } from "@heroicons/react/24/solid";
import InsightTile from "~/components/insights/InsightTile";
import type { IntegrationInsightsOverviewDTO } from "~/dtos/integrationInsights/IntegrationInsightsOverviewDTO";

interface HomeOverviewCardsProps {
    overview: IntegrationInsightsOverviewDTO | null;
}

export default function HomeOverviewCards({ overview }: HomeOverviewCardsProps) {
    if (!overview) return null;

    return (
        <div>
            <h2 className="text-body-xs  uppercase tracking-wider mb-3">Vue d'ensemble — Toutes plateformes</h2>
            <div className="flex flex-row flex-wrap gap-3">
                <InsightTile
                    label="Abonnés total"
                    value={overview.totalFollowers}
                    Icon={UsersIcon}
                    evolutionPercentage={overview.totalFollowersEvolution}
                />
                <InsightTile
                    label="Vues totales"
                    value={overview.totalViews}
                    Icon={EyeIcon}
                    evolutionPercentage={overview.totalViewsEvolution}
                />
                <InsightTile
                    label="Taux d'engagement"
                    value={overview.engagementRate ?? 0}
                    Icon={FireIcon}
                    evolutionPercentage={overview.engagementRateEvolution}
                />
            </div>
        </div>
    );
}
