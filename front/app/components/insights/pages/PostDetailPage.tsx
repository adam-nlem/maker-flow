import { useParams } from "react-router";
import PostDetailPageView from "../posts/PostDetailPageView";

export default function PostDetailPage(_props: { projectUuid: string }) {
    const { postUuid } = useParams<{ postUuid: string }>();

    if (!postUuid) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-heading-lg">Post introuvable</p>
            </div>
        );
    }

    return <PostDetailPageView postUuid={postUuid} />;
}
