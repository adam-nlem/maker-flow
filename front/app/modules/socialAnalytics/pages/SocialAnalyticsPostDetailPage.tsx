import { useParams } from "react-router";
import type { ModuleWidgetProps } from "~/modules/registry";
import SocialAnalyticsPostDetailPageView from "../components/posts/SocialAnalyticsPostDetailPageView";

export default function SocialAnalyticsPostDetailPage(_props: ModuleWidgetProps) {
    const { postUuid } = useParams<{ postUuid: string }>();

    if (!postUuid) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-heading-lg">Post introuvable</p>
            </div>
        );
    }

    return <SocialAnalyticsPostDetailPageView postUuid={postUuid} />;
}
