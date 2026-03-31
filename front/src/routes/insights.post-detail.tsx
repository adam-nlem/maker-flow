import { useParams } from "react-router-dom";
import SideBar from "~/components/sidebar/SideBar";
import PostDetailPageView from "~/components/insights/posts/PostDetailPageView";

export default function InsightsPostDetailPage() {
  const { postUuid } = useParams<{ postUuid: string }>();

  if (!postUuid) {
    return null;
  }

  return (
    <div className="flex w-full">
      <SideBar />
      <div className="flex-1 min-w-0">
        <PostDetailPageView postUuid={postUuid} />
      </div>
    </div>
  );
}
