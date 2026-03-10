import { useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import DataTable, { type DataTableColumn } from "~/components/ui/DataTable";
import { PostInsightType, postInsightTypeToFrenchTranslation } from "~/models/enums/PostInsightType";
import { useListPaginatedPosts } from "~/hooks/api/posts/useListPaginatedPosts";
import { formatCompactNumber } from "~/utils/numberFormatters";
import { useInsightsFilterStore } from "~/stores/insights/insightsFilterStore";
import { timePeriodToDays } from "~/models/enums/TimePeriod";
import { filterPostsByDays } from "~/helpers/postFilterHelper";
import type { PostWithInsightsDTO } from "~/dtos/posts/PostWithInsightsDTO";
import type { PostInsightWithEvolutionDTO } from "~/dtos/posts/PostInsightWithEvolutionDTO";
import PostDescriptionCell from "./PostDescriptionCell";
import PostNumericCell from "./PostNumericCell";
import PostDurationCell from "./PostDurationCell";

function findInsight(
  insights: PostInsightWithEvolutionDTO[],
  type: PostInsightType,
): PostInsightWithEvolutionDTO | undefined {
  return insights.find((insight) => insight.insight.type === type);
}

const columns: DataTableColumn<PostWithInsightsDTO>[] = [
  {
    header: "Description",
    render: (postWithInsights) => <PostDescriptionCell post={postWithInsights.post} />,
  },
  {
    header: postInsightTypeToFrenchTranslation[PostInsightType.Views],
    render: (postWithInsights) => (
      <PostNumericCell insight={findInsight(postWithInsights.insights, PostInsightType.Views)} />
    ),
  },
  {
    header: postInsightTypeToFrenchTranslation[PostInsightType.TotalInteractions],
    render: (postWithInsights) => {
      const likesInsight = findInsight(postWithInsights.insights, PostInsightType.Likes);
      const commentsInsight = findInsight(postWithInsights.insights, PostInsightType.Comments);
      const sharesInsight = findInsight(postWithInsights.insights, PostInsightType.Shares);

      return (
        <PostNumericCell
          insight={findInsight(postWithInsights.insights, PostInsightType.TotalInteractions)}
          tooltip={
            <div className="flex flex-col gap-1">
              <p>{postInsightTypeToFrenchTranslation[PostInsightType.Likes]}: {likesInsight ? formatCompactNumber(likesInsight.insight.value) : "—"}</p>
              <p>{postInsightTypeToFrenchTranslation[PostInsightType.Comments]}: {commentsInsight ? formatCompactNumber(commentsInsight.insight.value) : "—"}</p>
              <p>{postInsightTypeToFrenchTranslation[PostInsightType.Shares]}: {sharesInsight ? formatCompactNumber(sharesInsight.insight.value) : "—"}</p>
            </div>
          }
        />
      );
    },
  },
  {
    header: postInsightTypeToFrenchTranslation[PostInsightType.AverageWatchTime],
    render: (postWithInsights) => (
      <PostDurationCell insight={findInsight(postWithInsights.insights, PostInsightType.AverageWatchTime)} />
    ),
  },
];

interface ListPostsTableProps {
  integrationUuid: string;
}

export default function ListPostsTable({ integrationUuid }: ListPostsTableProps) {
  const navigate = useNavigate();
  const timePeriod = useInsightsFilterStore((state) => state.timePeriod);
  const days = timePeriodToDays[timePeriod];

  const { posts, isLoadingMore, hasMore, listMore } = useListPaginatedPosts({
    integrationUuid,
    limit: 10,
  });

  const filteredPosts = filterPostsByDays(posts, days)
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          listMore();
        }
      },
      { rootMargin: "0px 0px 200px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, listMore]);
  console.log(filteredPosts);
  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0 w-2/3">
      <h1 className="text-heading-sm">Derniers contenus</h1>
      <DataTable<PostWithInsightsDTO>
        columns={columns}
        data={filteredPosts}
        getRowKey={(postWithInsights) => postWithInsights.post.uuid}
        onRowClick={(postWithInsights) => navigate(`/insights/posts/${postWithInsights.post.uuid}`)}
        afterTable={<div ref={sentinelRef} className="h-1" />}
        className="flex-1 min-h-0"
      />
    </div>
  );
}
