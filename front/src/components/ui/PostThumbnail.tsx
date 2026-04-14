import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail"
import Shimmer from "./Shimmer"

interface PostThumbnailProps {
    postUuid?: string
    className?: string
}

export default function PostThumbnail({ postUuid, className = "" }: PostThumbnailProps) {
    const { thumbnailUrl, isLoading } = useShowPostThumbnail(postUuid)

    return (
        <div className={`bg-light-gray overflow-hidden ${className}`}>
            {isLoading
                ? <Shimmer width="w-full" height="h-full" radius="rounded-none" />
                : thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />}
        </div>
    )
}
