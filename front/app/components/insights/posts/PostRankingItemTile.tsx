import Shimmer from "~/components/ui/Shimmer";
import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail";

interface PostRankingItemTileProps {
  index: number;
  title: string | null;
  subtitle: string;
  postUuid?: string;
}

export default function PostRankingItemTile({ index, title, subtitle, postUuid }: PostRankingItemTileProps) {
  const { thumbnailUrl } = useShowPostThumbnail(postUuid);

  return (
    <div className="flex flex-row gap-3 hover:bg-surface-hover cursor-pointer p-1 overflow-auto border-t border-light-gray items-center">
      <h1 className="text-heading-sm">{index + 1}</h1>
      {postUuid && (
        thumbnailUrl
          ? <img src={thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
          : <Shimmer width="w-10" height="h-10" radius="rounded" />
      )}

      <div className="flex flex-col min-w-0 max-w-xs">
        {title && (
          <p className="text-xs truncate">{title}</p>
        )}
        <p className="text-body-xs text-gray">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
