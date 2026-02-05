import DataTable from "~/components/ui/DataTable";
import type { SocialAnalyticsPostRankingItemDTO } from "../../dtos/socialAnalyticsPostInsights/SocialAnalyticsPostRankingItemDTO";
import SocialAnalyticsPostDescriptionCell from "./SocialAnalyticsPostDescriptionCell";
import { useNavigate } from "react-router";

interface SocialAnalyticsPostsRankingTableProps {
  items: SocialAnalyticsPostRankingItemDTO[];
}

export default function SocialAnalyticsPostsRankingTable({ items }: SocialAnalyticsPostsRankingTableProps) {
  const navigate = useNavigate();
  return (
    <div className="border border-light-gray rounder-lg p-3 w-1/3">
      <DataTable<SocialAnalyticsPostRankingItemDTO>
        columns={
          [{
            header: "Contenus",
            render: (rankingItem) => <SocialAnalyticsPostDescriptionCell post={rankingItem.post} />,
          }]
        }

        data={items}
        getRowKey={(rankingItem) => rankingItem.post.uuid}
        onRowClick={(post) => navigate(`/modules/social_analytics/posts/${post.post.uuid}`)}

      />
    </div>
  )
}
