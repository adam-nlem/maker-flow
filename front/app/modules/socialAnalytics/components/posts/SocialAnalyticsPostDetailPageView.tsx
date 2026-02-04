import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useShowSocialAnalyticsPostInsightDetail } from "../../hooks/api/socialAnalyticsPostInsights/useShowSocialAnalyticsPostInsightDetail";
import { useShowSocialAnalyticsPostThumbnail } from "../../hooks/api/socialAnalyticsPosts/useShowSocialAnalyticsPostThumbnail";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsPostInsightType";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import LineChart from "~/components/ui/LineChart";
import Shimmer from "~/components/ui/Shimmer";
import type { SocialAnalyticsPostInsightTimelineDTO } from "../../dtos/socialAnalyticsPostInsights/SocialAnalyticsPostInsightTimelineDTO";
import FilterTile from "../FilterTile";
import { CalendarDaysIcon, ChartBarSquareIcon, ChevronRightIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import SelectDropdown from "~/components/ui/SelectDropdown";
import SocialAnalyticsPostInsightSummaryCard from "./SocialAnalyticsPostInsightSummaryCard";

interface SocialAnalyticsPostDetailPageViewProps {
    postUuid: string;
}

function findTimeline(
    timelines: SocialAnalyticsPostInsightTimelineDTO[],
    type: SocialAnalyticsPostInsightType,
): SocialAnalyticsPostInsightTimelineDTO | undefined {
    return timelines.find((timeline) => timeline.type === type);
}

type WatchTimeType = SocialAnalyticsPostInsightType.AverageWatchTime | SocialAnalyticsPostInsightType.TotalWatchTime;
type EngagementType = SocialAnalyticsPostInsightType.Likes | SocialAnalyticsPostInsightType.Comments | SocialAnalyticsPostInsightType.Shares;

export default function SocialAnalyticsPostDetailPageView({ postUuid }: SocialAnalyticsPostDetailPageViewProps) {

    const { detail, isLoading } = useShowSocialAnalyticsPostInsightDetail({ postUuid });
    const { thumbnailUrl } = useShowSocialAnalyticsPostThumbnail(postUuid);
    const [lineChartInsightType, setLineChartInsightType] = useState<SocialAnalyticsPostInsightType>(SocialAnalyticsPostInsightType.Views);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-body-sm">Chargement...</p>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-heading-lg">Post introuvable</p>
            </div>
        );
    }

    const visibilitySummaryInsightTypes = [
        SocialAnalyticsPostInsightType.Views,
        SocialAnalyticsPostInsightType.AverageWatchTime,
        SocialAnalyticsPostInsightType.Reach,
        SocialAnalyticsPostInsightType.TotalWatchTime,
    ];

    const engagementSummaryInsightTypes = [
        SocialAnalyticsPostInsightType.Saved,
        SocialAnalyticsPostInsightType.Shares,
        SocialAnalyticsPostInsightType.Likes,
        SocialAnalyticsPostInsightType.Comments,
    ];

    const visibilitySummaryInsights = detail.insightsWithEvolution.filter(
        (i) => visibilitySummaryInsightTypes.includes(i.insight.type)
    );

    const engagementSummaryInsights = detail.insightsWithEvolution.filter(
        (i) => engagementSummaryInsightTypes.includes(i.insight.type)
    );

    const getWidthClass = (value: number) => {
        if (value >= 100) return 'w-full';
        if (value >= 75) return 'w-3/4';
        if (value >= 66) return 'w-2/3';
        if (value >= 50) return 'w-1/2';
        if (value >= 33) return 'w-1/3';
        if (value >= 25) return 'w-1/4';
        if (value > 0) return 'w-1/12';
        return 'w-0';
    };

    return (
        <div className="h-screen overflow-auto p-6 flex flex-col gap-5">

            <nav aria-label="Breadcrumb" className="flex">
                <ol role="list" className="flex items-center space-x-2 text-body-xs">
                    <li>
                        <div className="flex">
                            <a href="/modules/social_analytics" className="hover:text-gray-700  ">
                                Plateformes
                            </a>
                        </div>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-gray" />
                            <a href="#" className="ml-2 hover:text-gray-700">
                                Detail de contenu
                            </a>
                        </div>
                    </li>
                </ol>
            </nav>
            <div className="flex flex-row gap-3 items-center">
                {thumbnailUrl
                    ? <a
                        href={detail.post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                    >
                        <img src={thumbnailUrl} alt="" className="w-15 h-15 rounded object-cover shrink-0" />
                    </a>
                    : <Shimmer width="w-15" height="h-15" radius="rounded" />
                }

                <div>
                    {detail.post.caption && (
                        <h1 className="text-heading-md line-clamp-2">{detail.post.caption}</h1>
                    )}
                    <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="size-4 shrink-0 text-gray" />
                        <p className="text-body-xs text-gray">
                            {formatToFrenchRelative(detail.post.publishedAt)}
                        </p>
                    </div>
                </div>
            </div>


            <div className="flex flex-row gap-3 w-full px-3">
                <SocialAnalyticsPostInsightSummaryCard title="Résumé de la visibilité" insights={visibilitySummaryInsights} />
                <SocialAnalyticsPostInsightSummaryCard title="Résumé des intéractions" insights={engagementSummaryInsights} />

                <div className="flex flex-col gap-1 w-1/3 border border-light-gray rounded-xl p-3">
                    <h1 className="text-heading-md mb-3">Résumé de l'engagement</h1>
                    <h2 className="text-body-sm">Par Abonnés</h2>
                    <h3 className="text-heading-md">{detail.engagementByFollowers}%</h3>
                    <div className="w-full h-2 bg-zinc-200 rounded-full mb-3" >
                        <div className={`${getWidthClass(detail.engagementByFollowers!)} h-full bg-primary rounded-full`}></div>
                    </div>

                    <h2 className="text-body-sm">Par comptes touchés Abonnés</h2>
                    <h3 className="text-heading-md">{detail.engagementByReach}%</h3>
                    <div className="w-full h-2 bg-zinc-200 rounded-full">
                        <div className={`${getWidthClass(detail.engagementByReach!)} h-full bg-primary rounded-full`}></div>
                    </div>
                </div>
            </div>

            {/* <div className="flex flex-row flex-wrap gap-3">
                        {insightTypes.map((type) => {
                            const insight = findInsight(detail.insightsWithEvolution, type);
                            if (!insight) return null;

                            const Icon = socialAnalyticsPostInsightTypeToIcon[type];
                            const isWatchTime = type === SocialAnalyticsPostInsightType.AverageWatchTime || type === SocialAnalyticsPostInsightType.TotalWatchTime;

                            return (
                                <SocialAnalyticsInsightTile
                                    key={type}
                                    label={socialAnalyticsPostInsightTypeToFrenchTranslation[type]}
                                    value={isWatchTime ? formatDurationToFrench(insight.insight.value) as unknown as number : insight.insight.value}
                                    Icon={Icon}
                                    evolutionPercentage={insight.evolutionPercentage}
                                />
                            );
                        })}

                        {detail.engagementByFollowers !== null && (
                            <div className="flex flex-row gap-3 border border-light-gray rounded-lg p-2 w-fit items-center">
                                <div>
                                    <p className="text-xs whitespace-nowrap">Engagement / Abonnés</p>
                                    <h1 className="text-heading-sm">{detail.engagementByFollowers}%</h1>
                                </div>
                            </div>
                        )}

                        {detail.engagementByReach !== null && (
                            <div className="flex flex-row gap-3 border border-light-gray rounded-lg p-2 w-fit items-center">
                                <div>
                                    <p className="text-xs whitespace-nowrap">Engagement / Portée</p>
                                    <h1 className="text-heading-sm">{detail.engagementByReach}%</h1>
                                </div>
                            </div>
                        )}
                    </div> */}

            <div className="w-2/3 p-3 border border-light-gray rounded-lg flex flex-col gap-3">
                <div className="flex flex-row justify-between">
                    <p className="text-heading-sm">Contenu actuel en fonction de la moyenne des 10 contenus précédents</p>
                    <SelectDropdown<SocialAnalyticsPostInsightType>
                        items={detail.timelines.map((tl) => tl.type)}
                        selectedItemId={lineChartInsightType}
                        getItemId={(item) => item}
                        onSelect={(item) => setLineChartInsightType(item)}
                        renderTrigger={({ onClick }) => (
                            <FilterTile
                                icon={ChartBarSquareIcon}
                                label={socialAnalyticsPostInsightTypeToFrenchTranslation[lineChartInsightType]}
                                rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                                onClick={onClick}
                            />
                        )}
                        renderItem={({ item, isSelected, onSelect }) => (
                            <FilterTile
                                label={socialAnalyticsPostInsightTypeToFrenchTranslation[item]}
                                isSelected={isSelected}
                                onClick={onSelect}
                            />
                        )}
                    />
                </div>
                <LineChart
                    data={findTimeline(detail.timelines, lineChartInsightType)!.points}
                />
            </div>

        </div>
    );
}