import type { SocialAnalyticsPostInsightWithEvolutionDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";
import { formatDurationToFrench } from "~/utils/durationFormatters";
import SocialAnalyticsPostEvolutionBadge from "./SocialAnalyticsPostEvolutionBadge";

interface SocialAnalyticsPostDurationCellProps {
    insight: SocialAnalyticsPostInsightWithEvolutionDTO | undefined;
}

export default function SocialAnalyticsPostDurationCell({ insight }: SocialAnalyticsPostDurationCellProps) {
    if (!insight) return <span>—</span>;

    return (
        <div className="flex flex-row items-center gap-1">
            {formatDurationToFrench(insight.insight.value)}
            <SocialAnalyticsPostEvolutionBadge evolutionPercentage={insight.evolutionPercentage} />
        </div>
    );
}
