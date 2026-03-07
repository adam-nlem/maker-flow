import type { PostRankingItemDTO } from "~/dtos/postInsights/PostRankingItemDTO";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import PostRankingItemTile from "./PostRankingItemTile";

interface PostsRankingTableProps {
  items: PostRankingItemDTO[];
}

export default function PostsRankingCard({ items }: PostsRankingTableProps) {
  return (
    <div className="w-1/3 p-3 border border-light-gray rounded-lg flex flex-col min-h-0">
      <h1 className="text-heading-sm shrink-0">Classement des 10 précédents contenus</h1>
      <div className="overflow-auto scrollbar-none min-h-0 flex-1">
        {items.map((item, index) =>
          <PostRankingItemTile
            key={item.post.uuid}
            index={index}
            title={item.post.caption}
            subtitle={formatToFrenchRelative(item.post.publishedAt)}
            postUuid={item.post.uuid}
          />
        )}
      </div>
    </div>
  )
}
