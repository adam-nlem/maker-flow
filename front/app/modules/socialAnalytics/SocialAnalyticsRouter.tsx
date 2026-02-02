import { Routes, Route } from "react-router";
import type { ModuleWidgetProps } from "~/modules/registry";
import SocialAnalyticsPageView from "./components/SocialAnalyticsPageView";
import SocialAnalyticsPostDetailPage from "./pages/SocialAnalyticsPostDetailPage";

export default function SocialAnalyticsRouter(props: ModuleWidgetProps) {
    return (
        <Routes>
            <Route index element={<SocialAnalyticsPageView {...props} />} />
            <Route path="posts/:postUuid" element={<SocialAnalyticsPostDetailPage {...props} />} />
        </Routes>
    );
}
