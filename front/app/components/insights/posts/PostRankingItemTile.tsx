import Shimmer from "~/components/ui/Shimmer";
import type { PostRankingItemDTO } from "~/dtos/postInsights/PostRankingItemDTO";
import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail";
import { formatToFrenchRelative } from "~/utils/dateFormatters";

interface PostRankingItemTileProps {
  item: PostRankingItemDTO;
  index: number;
}

export default function PostRankingItemTile({ item, index }: PostRankingItemTileProps) {
  const { thumbnailUrl } = useShowPostThumbnail(item.post.uuid);

  return (
    <div className="flex flex-row gap-3 hover:bg-surface-hover cursor-pointer p-1 overflow-auto border-t border-light-gray items-center">
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
