import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { PostInsightType, postInsightTypeToFrenchTranslation } from "~/models/enums/PostInsightType";
import { formatDurationToFrench } from "~/utils/durationFormatters";
import { formatCompactNumber } from "~/utils/numberFormatters";
import type { PostInsightWithEvolutionDTO } from "~/dtos/posts/PostInsightWithEvolutionDTO";

interface PostInsightSummaryCardProps {
    title: string;
    insights: PostInsightWithEvolutionDTO[];
}

const WATCH_TIME_TYPES: PostInsightType[] = [
    PostInsightType.AverageWatchTime,
    PostInsightType.TotalWatchTime,
];

function formatInsightValue(type: PostInsightType, value: number): string {
    if (WATCH_TIME_TYPES.includes(type)) {
        return formatDurationToFrench(value);
    }
    return formatCompactNumber(value);
}

export default function PostInsightSummaryCard({ title, insights }: PostInsightSummaryCardProps) {
    return (
        <div className="bg-clear border border-light-gray rounded-xl p-3 w-full">
            
                <h1 className="text-heading-md mb-3">{title}</h1>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                {insights.map((insight, index) => {
                    const percentage = insight.evolutionPercentage;
                    const isPositive = percentage?.startsWith('+');
                    const hasEvolution = percentage !== undefined && percentage !== null;
                    const isRightColumn = index % 2 !== 0;

                    return (
                        <div
                            key={insight.insight.type}
                            className={`flex flex-col justify-between ${isRightColumn ? 'md:border-l md:border-light-gray md:pl-6' : ''}`}
                        >
                            <div className="flex flex-row justify-between items-start mb-2">
                                <h2 className="text-body-sm">
                                    {postInsightTypeToFrenchTranslation[insight.insight.type]}
                                </h2>

                                {hasEvolution && (
                                    <div className={`flex items-center text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                        <span className="mr-1">{percentage}</span>
                                        {isPositive ? <ArrowUpIcon className="size-5" /> : <ArrowDownIcon className="size-5" />}
                                    </div>
                                )}
                            </div>

                            <div className="mb-1">
                                <h3 className="text-heading-md">
                                    {formatInsightValue(insight.insight.type, insight.insight.value)}
                                </h3>
                            </div>

                            <p className="text-body-xs ">
                                Comparé au contenu précédent
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
