import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { SocialAnalyticsPostWithInsightsDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsPostInsightType";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import SocialAnalyticsPostsTableRow from "./SocialAnalyticsPostsTableRow";

interface SocialAnalyticsPostsTableProps {
    posts: SocialAnalyticsPostWithInsightsDTO[];
    hasMore: boolean;
    onLoadMore: () => void;
}

export default function SocialAnalyticsPostsTable({ posts, hasMore, onLoadMore }: SocialAnalyticsPostsTableProps) {

    console.log(posts)
    return (
        <div className="flex flex-col gap-2 flex-1 min-h-0 w-2/3">
            <h1 className="text-heading-sm">Derniers contenus</h1>
            <div className="border border-light-gray rounded-lg overflow-auto scrollbar-none flex-1 min-h-0">
                <table className="w-full table-auto">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-light-gray text-body-xs">
                            <th className=" text-left px-3 py-2">Description</th>
                            <th className="text-right px-3 py-2">{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Views]}</th>
                            <th className="text-right px-3 py-2">{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.TotalInteractions]}</th>
                            <th className="text-right px-3 py-2">{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.AverageWatchTime]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <SocialAnalyticsPostsTableRow key={post.uuid} post={post} />
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <SimpleTextButton onClick={onLoadMore}>
                    <ArrowPathIcon className="size-3.5" strokeWidth={2} />
                    <p>Charger plus de contenus</p>
                </SimpleTextButton>
            )}
        </div>
    );
}
