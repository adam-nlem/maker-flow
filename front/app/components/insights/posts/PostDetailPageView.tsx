import { useState } from "react";
import { useShowPostInsightDetail } from "~/hooks/api/postInsights/useShowPostInsightDetail";
import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail";
import { PostInsightType, postInsightTypeToFrenchTranslation } from "~/models/enums/PostInsightType";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import LineChart from "~/components/ui/LineChart";
import Shimmer from "~/components/ui/Shimmer";
import type { PostInsightTimelineDTO } from "~/dtos/postInsights/PostInsightTimelineDTO";
import FilterTile from "../FilterTile";
import { CalendarDaysIcon, ChartBarSquareIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import SelectDropdown from "~/components/ui/SelectDropdown";
import PostInsightSummaryCard from "./PostInsightSummaryCard";
import { BreadCrumbNavbar } from "~/components/ui/BreadCrumbNavBar";
import { PercentageProgressBar } from "~/components/ui/PercentageProgressBar";
import PostsRankingCard from "./PostsRankingCard";

interface PostDetailPageViewProps {
  postUuid: string;
}

function findTimeline(
  timelines: PostInsightTimelineDTO[],
  type: PostInsightType,
): PostInsightTimelineDTO | undefined {
  return timelines.find((timeline) => timeline.type === type);
}

type WatchTimeType = PostInsightType.AverageWatchTime | PostInsightType.TotalWatchTime;
type EngagementType = PostInsightType.Likes | PostInsightType.Comments | PostInsightType.Shares;

export default function PostDetailPageView({ postUuid }: PostDetailPageViewProps) {

  const { detail, isLoading } = useShowPostInsightDetail({ postUuid });
  const { thumbnailUrl } = useShowPostThumbnail(postUuid);
  const [lineChartInsightType, setLineChartInsightType] = useState<PostInsightType>(PostInsightType.Views);

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
    PostInsightType.Views,
    PostInsightType.AverageWatchTime,
    PostInsightType.Reach,
    PostInsightType.TotalWatchTime,
  ];

  const engagementSummaryInsightTypes = [
    PostInsightType.Saved,
    PostInsightType.Shares,
    PostInsightType.Likes,
    PostInsightType.Comments,
  ];

  const visibilitySummaryInsights = detail.insightsWithEvolution.filter(
    (i) => visibilitySummaryInsightTypes.includes(i.insight.type)
  );

  const engagementSummaryInsights = detail.insightsWithEvolution.filter(
    (i) => engagementSummaryInsightTypes.includes(i.insight.type)
  );

  const selectedTimeline = findTimeline(detail.timelines, lineChartInsightType);

  return (
    <div className="h-screen overflow-auto p-6 flex flex-col gap-5">
      <BreadCrumbNavbar pages={
        [{
          route: "/insights",
          name: "Plateformes"
        },
        { route: "#", name: "Detail de contenu" }]
      } />

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


      <div className="flex flex-row gap-3 w-full">

        {/* Visibility */}
        <PostInsightSummaryCard title="Résumé de la visibilité" insights={visibilitySummaryInsights} />
        <PostInsightSummaryCard title="Résumé des intéractions" insights={engagementSummaryInsights} />

        {/* Engagement */}
        <div className="flex flex-col gap-1 w-1/3 border border-light-gray rounded-xl p-3">
          <h1 className="text-heading-md mb-3">Résumé de l'engagement</h1>
          <PercentageProgressBar name="Par abonnés" percentage={detail.engagementByFollowers ?? 0} />
          <PercentageProgressBar name="Par comptes touchés" percentage={detail.engagementByReach ?? 0} />
        </div>
      </div>
      <div className="flex flex-row gap-3 min-h-0">
        <div className="w-2/3 min-h-0 p-3 border border-light-gray rounded-lg flex flex-col gap-3">
          <div className="flex flex-row justify-between">
            <p className="text-heading-sm">Contenu actuel en fonction de la moyenne des 10 contenus précédents</p>
            <SelectDropdown<PostInsightType>
              items={detail.timelines.map((tl) => tl.type)}
              selectedItemId={lineChartInsightType}
              getItemId={(item) => item}
              onSelect={(item) => setLineChartInsightType(item)}
              renderTrigger={({ onClick }) => (
                <FilterTile
                  icon={ChartBarSquareIcon}
                  label={postInsightTypeToFrenchTranslation[lineChartInsightType]}
                  rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                  onClick={onClick}
                />
              )}
              renderItem={({ item, isSelected, onSelect }) => (
                <FilterTile
                  label={postInsightTypeToFrenchTranslation[item]}
                  isSelected={isSelected}
                  onClick={onSelect}
                />
              )}
            />
          </div>

          {selectedTimeline && (
            <LineChart
              data={selectedTimeline.points}
            />
          )}
        </div>
        <PostsRankingCard items={detail.ranking} />
      </div>

    </div>
  );
}
