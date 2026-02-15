import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsPostInsightType";
import { formatDurationToFrench } from "~/utils/durationFormatters";
import type { SocialAnalyticsPostInsightWithEvolutionDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";

interface SocialAnalyticsPostInsightSummaryCardProps {
    title: string;
    insights: SocialAnalyticsPostInsightWithEvolutionDTO[];
}

const WATCH_TIME_TYPES: SocialAnalyticsPostInsightType[] = [
    SocialAnalyticsPostInsightType.AverageWatchTime,
    SocialAnalyticsPostInsightType.TotalWatchTime,
];

function formatInsightValue(type: SocialAnalyticsPostInsightType, value: number): string {
    if (WATCH_TIME_TYPES.includes(type)) {
        return formatDurationToFrench(value);
    }
    return String(value);
}

export default function SocialAnalyticsPostInsightSummaryCard({ title, insights }: SocialAnalyticsPostInsightSummaryCardProps) {
    return (
        <div className="bg-white border border-light-gray rounded-xl p-3 w-full">
            
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
                            className={`flex flex-col justify-between ${isRightColumn ? 'md:border-l md:border-gray-200 md:pl-6' : ''}`}
                        >
                            <div className="flex flex-row justify-between items-start mb-2">
                                <h2 className="text-body-sm">
                                    {socialAnalyticsPostInsightTypeToFrenchTranslation[insight.insight.type]}
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
