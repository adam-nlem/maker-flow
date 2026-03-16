import type { ReactNode } from "react";
import type { PostInsightWithEvolutionDTO } from "~/dtos/posts/PostInsightWithEvolutionDTO";
import { formatCompactNumber } from "~/utils/numberFormatters";
import PostEvolutionBadge from "./PostEvolutionBadge";

interface PostNumericCellProps {
    insight: PostInsightWithEvolutionDTO | undefined;
    tooltip?: ReactNode;
}

export default function PostNumericCell({ insight, tooltip }: PostNumericCellProps) {
    if (!insight) return <span>—</span>;

    return (
        <div className={`flex flex-row items-center gap-1 ${tooltip ? "relative group" : ""}`}>
            {formatCompactNumber(insight.insight.value)}
            <PostEvolutionBadge evolutionPercentage={insight.evolutionPercentage} />
            {tooltip && (
                <div className="invisible group-hover:visible absolute right-full mr-1 bg-clear border border-light-gray text-xs rounded-lg p-2 whitespace-nowrap z-20 shadow-md">
                    {tooltip}
                </div>
            )}
        </div>
    );
}
