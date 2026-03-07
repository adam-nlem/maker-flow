import RankingItemTile from "~/components/ui/RankingItemTile"
import Shimmer from "~/components/ui/Shimmer"
import { useListRankedPosts } from "~/hooks/api/posts/useListRankedPosts"
import { PostInsightType } from "~/models/enums/PostInsightType"
import { formatToFrenchRelative } from "~/utils/dateFormatters"

const DISPLAYED_METRIC_TYPES = [PostInsightType.Views, PostInsightType.Likes, PostInsightType.Comments] as const

interface RankedPostsListProps {
  integrationUuid: string
}

export default function RankedPostsList({ integrationUuid }: RankedPostsListProps) {
  const { posts, isLoading } = useListRankedPosts({ integrationUuid })

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Shimmer width="w-48" height="h-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-row gap-4 items-center py-2">
            <Shimmer width="w-6" height="h-5" />
            <Shimmer width="w-16" height="h-16" radius="rounded-lg" />
            <div className="flex flex-col gap-1 flex-1">
              <Shimmer width="w-40" height="h-3" />
            </div>
            <Shimmer width="w-14" height="h-4" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return <p className="text-body-sm text-medium-gray">Aucun post trouvé.</p>
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-heading-sm mb-2">Classement des posts</h2>
      {posts.map((post, index) => (
        <RankingItemTile
          key={post.post.uuid}
          index={index}
          postUuid={post.post.uuid}
          title={post.post.caption}
          subtitle={formatToFrenchRelative(post.post.publishedAt)}
          metrics={DISPLAYED_METRIC_TYPES.map((type) => ({
            type,
            value: post.aggregatedInsights.find((i) => i.type === type)?.value ?? 0,
          }))}
          isLast={index === posts.length - 1}
        />
      ))}
    </div>
  )
}
