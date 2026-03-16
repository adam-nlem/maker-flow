import Shimmer from "~/components/ui/Shimmer"
import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail"
import { type PostInsightType, postInsightTypeToIcon } from "~/models/enums/PostInsightType"
import { formatCompactNumber } from "~/utils/numberFormatters"

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
  const { thumbnailUrl } = useShowPostThumbnail(postUuid)

  return (
    <div className="flex flex-row gap-1 items-stretch">
      <div className="flex flex-col items-center w-6 shrink-0">
        <span className="text-heading-sm">{index + 1}.</span>
        {!isLast && (
          <div className="flex-1 border-l border-dashed border-light-gray" />
        )}
      </div>

      <div className="flex flex-row py-1 gap-1 items-stretch">

        {postUuid && (
          thumbnailUrl
            ? <img src={thumbnailUrl} alt="" className="w-13 h-13 rounded object-cover shrink-0" />
            : <Shimmer width="w-10" height="h-10" radius="rounded" />
        )}

        <div className="flex flex-col min-w-0 max-w-xs justify-center">
          {title && <p className="text-xs truncate">{title}</p>}
          {subtitle && (
            <p className="text-body-xs text-gray">{subtitle}</p>
          )}

          {metrics.length > 0 && (
            <div className="flex flex-row items-center gap-2">
              {metrics.map((metric) => {
                const Icon = postInsightTypeToIcon[metric.type]
                return (
                  <div key={metric.type} className="flex flex-row items-center gap-1">
                    <Icon className="size-3 text-dark" />
                    <span className="text-heading-xs">{formatCompactNumber(metric.value)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
