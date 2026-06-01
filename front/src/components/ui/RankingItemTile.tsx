import type { PostInsightType } from "~/models/enums/PostInsightType"
import CompactMetricRow from "~/components/ui/CompactMetricRow"
import PostThumbnail from "~/components/ui/PostThumbnail"

interface RankingItemTileProps {
  index: number
  postUuid?: string
  title: string | null
  subtitle?: string
  metrics: { type: PostInsightType; value: number }[]
  isLast: boolean
}

export default function RankingItemTile({
  index,
  postUuid,
  title,
  subtitle,
  metrics,
  isLast,
}: RankingItemTileProps) {
  return (
    <div className="flex flex-row gap-1 items-stretch">
      <div className="flex flex-col items-center w-6 shrink-0">
        <span className="text-heading-sm">{index + 1}.</span>
        {!isLast && (
          <div className="flex-1 border-l border-dashed border-pale-gray" />
        )}
      </div>

      <div className="flex flex-row py-1 gap-1 items-stretch">

        {postUuid && (
          <PostThumbnail postUuid={postUuid} className="w-13 h-13 rounded shrink-0" />
        )}

        <div className="flex flex-col min-w-0 max-w-xs justify-center">
          {title && <p className="text-xs truncate">{title}</p>}
          {subtitle && (
            <p className="text-body-xs text-muted-2">{subtitle}</p>
          )}

          <CompactMetricRow metrics={metrics} />
        </div>
      </div>
    </div>
  )
}
