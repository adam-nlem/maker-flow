import DataTable from "~/components/ui/DataTable";
import type { PostRankingItemDTO } from "~/dtos/postInsights/PostRankingItemDTO";
import PostDescriptionCell from "./PostDescriptionCell";
import { useNavigate } from "react-router";
import PostRankingItemTile from "./PostRankingItemTile";

interface PostsRankingTableProps {
  items: PostRankingItemDTO[];
}

export default function PostsRankingCard({ items }: PostsRankingTableProps) {
  const navigate = useNavigate();
  return (
    <div className="w-1/3 p-3 border border-light-gray rounded-lg flex flex-col min-h-0">
      <h1 className="text-heading-sm shrink-0">Classement des 10 précédents contenus</h1>
      <div className="overflow-auto scrollbar-none min-h-0 flex-1">
        {items.map((item, index) =>
          <PostRankingItemTile item={item} index={index} />)}
      </div>
    </div>
  )
}
