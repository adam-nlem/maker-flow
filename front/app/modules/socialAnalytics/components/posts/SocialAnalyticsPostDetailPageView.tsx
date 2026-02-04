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
import { getWidthClassFromPercentage } from "~/helpers/percentageHelper";
import { BreadCrumbNavbar } from "~/components/ui/BreadCrumbNavBar";

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

  return (
    <div className="h-screen overflow-auto p-6 flex flex-col gap-5">
      <BreadCrumbNavbar pages={
        [{
          route: "/modules/social_analytics",
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
        <SocialAnalyticsPostInsightSummaryCard title="Résumé de la visibilité" insights={visibilitySummaryInsights} />
        <SocialAnalyticsPostInsightSummaryCard title="Résumé des intéractions" insights={engagementSummaryInsights} />

        <div className="flex flex-col gap-1 w-1/3 border border-light-gray rounded-xl p-3">
          <h1 className="text-heading-md mb-3">Résumé de l'engagement</h1>
          <h2 className="text-body-sm">Par Abonnés</h2>
          <h3 className="text-heading-md">{detail.engagementByFollowers}%</h3>
          <div className="w-full h-2 bg-zinc-200 rounded-full mb-3" >
            <div className={`${getWidthClassFromPercentage(detail.engagementByFollowers!)} h-full bg-primary rounded-full`}></div>
          </div>

          <h2 className="text-body-sm">Par comptes touchés Abonnés</h2>
          <h3 className="text-heading-md">{detail.engagementByReach}%</h3>
          <div className="w-full h-2 bg-zinc-200 rounded-full">
            <div className={`${getWidthClassFromPercentage(detail.engagementByReach!)} h-full bg-primary rounded-full`}></div>
          </div>
        </div>
      </div>

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
