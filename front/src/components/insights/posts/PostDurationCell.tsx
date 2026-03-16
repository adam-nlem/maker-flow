import type { PostInsightWithEvolutionDTO } from "~/dtos/posts/PostInsightWithEvolutionDTO";
import { formatDurationToFrench } from "~/utils/durationFormatters";
import PostEvolutionBadge from "./PostEvolutionBadge";

interface PostDurationCellProps {
    insight: PostInsightWithEvolutionDTO | undefined;
}

export default function PostDurationCell({ insight }: PostDurationCellProps) {
    if (!insight) return <span>—</span>;

    return (
        <div className="flex flex-row items-center gap-1">
            {formatDurationToFrench(insight.insight.value)}
            <PostEvolutionBadge evolutionPercentage={insight.evolutionPercentage} />
        </div>
    );
}
