import type { ReactNode } from "react";
import type { SocialAnalyticsPostInsightWithEvolutionDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";
import SocialAnalyticsPostEvolutionBadge from "./SocialAnalyticsPostEvolutionBadge";

interface SocialAnalyticsPostNumericCellProps {
    insight: SocialAnalyticsPostInsightWithEvolutionDTO | undefined;
    tooltip?: ReactNode;
}

export default function SocialAnalyticsPostNumericCell({ insight, tooltip }: SocialAnalyticsPostNumericCellProps) {
    if (!insight) return <span>—</span>;

    return (
        <div className={`flex flex-row items-center gap-1 ${tooltip ? "relative group" : ""}`}>
            {insight.insight.value}
            <SocialAnalyticsPostEvolutionBadge evolutionPercentage={insight.evolutionPercentage} />
            {tooltip && (
                <div className="invisible group-hover:visible absolute right-full mr-1 bg-clear border border-light-gray text-xs rounded-lg p-2 whitespace-nowrap z-20 shadow-md">
                    {tooltip}
                </div>
            )}
        </div>
    );
}
