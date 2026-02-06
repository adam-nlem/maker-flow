import DataTable from "~/components/ui/DataTable";
import type { SocialAnalyticsPostRankingItemDTO } from "../../dtos/socialAnalyticsPostInsights/SocialAnalyticsPostRankingItemDTO";
import SocialAnalyticsPostDescriptionCell from "./SocialAnalyticsPostDescriptionCell";
import { useNavigate } from "react-router";
import SocialAnalyticsPostRankingItemTile from "./SocialAnalyticsPostRankingItemTile";

interface SocialAnalyticsPostsRankingTableProps {
  items: SocialAnalyticsPostRankingItemDTO[];
}

export default function SocialAnalyticsPostsRankingCard({ items }: SocialAnalyticsPostsRankingTableProps) {
  const navigate = useNavigate();
  return (
    <div className="w-1/3 p-3 border border-light-gray rounded-lg flex flex-col min-h-0">
      <h1 className="text-heading-sm shrink-0">Classement des 10 précédents contenus</h1>
      <div className="overflow-auto scrollbar-none min-h-0 flex-1">
        {items.map((item, index) =>
          <SocialAnalyticsPostRankingItemTile item={item} index={index} />)}
      </div>
    </div>
  )
}
