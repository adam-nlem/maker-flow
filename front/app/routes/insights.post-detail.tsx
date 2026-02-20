import { useParams } from "react-router";
import SideBar from "~/components/sidebar/SideBar";
import PostDetailPageView from "~/components/insights/posts/PostDetailPageView";

export default function InsightsPostDetailPage() {
  const { postUuid } = useParams<{ postUuid: string }>();

  if (!postUuid) {
    return null;
  }

  return (
    <div className="w-full">
      <SideBar />
      <div className="w-full pl-16">
        <PostDetailPageView postUuid={postUuid} />
      </div>
    </div>
  );
}
