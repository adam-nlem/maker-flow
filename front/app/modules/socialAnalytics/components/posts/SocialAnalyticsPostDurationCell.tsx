import type { SocialAnalyticsPostInsightWithEvolutionDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";
import { formatDurationToFrenchHumanReadable } from "~/utils/durationFormatters";
import SocialAnalyticsPostEvolutionBadge from "./SocialAnalyticsPostEvolutionBadge";

interface SocialAnalyticsPostDurationCellProps {
    insight: SocialAnalyticsPostInsightWithEvolutionDTO | undefined;
}

export default function SocialAnalyticsPostDurationCell({ insight }: SocialAnalyticsPostDurationCellProps) {
    if (!insight) return <td className="px-3 py-2 text-center text-sm">—</td>;

    return (
        <td className="px-3 py-2 text-left text-sm ">
            <div className="flex flex-row items-center gap-1">
                {formatDurationToFrenchHumanReadable(insight.value)}
                <SocialAnalyticsPostEvolutionBadge evolutionPercentage={insight.evolutionPercentage} />
            </div>
        </td>
    );
}
