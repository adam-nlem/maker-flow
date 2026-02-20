import type { Post } from "~/models/Post";
import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import Shimmer from "~/components/ui/Shimmer";

interface PostDescriptionCellProps {
    post: Post;
}

export default function PostDescriptionCell({ post }: PostDescriptionCellProps) {
    const { thumbnailUrl } = useShowPostThumbnail(post.uuid);

    return (
        <div className="flex flex-row items-center gap-2">
            {thumbnailUrl
                ? <img src={thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                : <Shimmer width="w-10" height="h-10" radius="rounded" />
            }
            <div className="flex flex-col min-w-0 max-w-xs">
                {post.caption && (
                    <p className="text-xs truncate">{post.caption}</p>
                )}
                <p className="text-body-xs text-gray">
                    {formatToFrenchRelative(post.publishedAt)}
                </p>
            </div>
        </div>
    );
}
