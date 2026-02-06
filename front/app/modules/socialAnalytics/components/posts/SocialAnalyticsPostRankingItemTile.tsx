import Shimmer from "~/components/ui/Shimmer";
import type { SocialAnalyticsPostRankingItemDTO } from "../../dtos/socialAnalyticsPostInsights/SocialAnalyticsPostRankingItemDTO";
import { useShowSocialAnalyticsPostThumbnail } from "../../hooks/api/socialAnalyticsPosts/useShowSocialAnalyticsPostThumbnail";
import { formatToFrenchRelative } from "~/utils/dateFormatters";

interface SocialAnalyticsPostRankingItemTileProps {
  item: SocialAnalyticsPostRankingItemDTO;
  index: number;
}

export default function SocialAnalyticsPostRankingItemTile({ item, index }: SocialAnalyticsPostRankingItemTileProps) {
  const { thumbnailUrl } = useShowSocialAnalyticsPostThumbnail(item.post.uuid);

  return (
    <div className="flex flex-row gap-3 hover:bg-gray-50 cursor-pointer p-1 overflow-auto border-t border-light-gray items-center">
      <h1 className="text-heading-sm">{index + 1}</h1>
      {thumbnailUrl
        ? <img src={thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
        : <Shimmer width="w-10" height="h-10" radius="rounded" />
      }

      <div className="flex flex-col min-w-0 max-w-xs">
        {item.post.caption && (
          <p className="text-xs truncate">{item.post.caption}</p>
        )}
        <p className="text-body-xs text-gray">
          {formatToFrenchRelative(item.post.publishedAt)}
        </p>
      </div>
    </div>
  )
}
