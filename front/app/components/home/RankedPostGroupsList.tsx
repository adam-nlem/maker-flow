import RankingItemTile from "~/components/ui/RankingItemTile"
import Shimmer from "~/components/ui/Shimmer"
import { useListRankedPostGroups } from "~/hooks/api/postGroups/useListRankedPostGroups"
import { PostInsightType } from "~/models/enums/PostInsightType"

const DISPLAYED_METRIC_TYPES = [PostInsightType.Views, PostInsightType.Likes, PostInsightType.Comments] as const

interface RankedPostGroupsListProps {
  projectUuid: string
}

export default function RankedPostGroupsList({ projectUuid }: RankedPostGroupsListProps) {
  const { postGroups, isLoading } = useListRankedPostGroups({ projectUuid })

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
              <Shimmer width="w-20" height="h-3" />
            </div>
            <Shimmer width="w-14" height="h-4" />
          </div>
        ))}
      </div>
    )
  }

  if (postGroups.length === 0) {
    return <p className="text-body-sm text-medium-gray">Aucun groupe de posts trouvé.</p>
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-heading-sm mb-2">Classement des groupes de posts</h2>
      {postGroups.map((group, index) => (
        <RankingItemTile
          key={group.postGroup.uuid}
          index={index}
          postUuid={group.postGroup.posts[0]?.uuid}
          title={group.postGroup.title}
          subtitle={`${group.postGroup.posts.length} post${group.postGroup.posts.length > 1 ? 's' : ''}`}
          metrics={DISPLAYED_METRIC_TYPES.map((type) => ({
            type,
            value: group.aggregatedInsights.find((i) => i.type === type)?.value ?? 0,
          }))}
          isLast={index === postGroups.length - 1}
        />
      ))}
    </div>
  )
}
