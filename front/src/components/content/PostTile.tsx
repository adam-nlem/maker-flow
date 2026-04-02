import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail"
import { formatToFrenchDateShort } from "~/utils/dateFormatters"
import { TrashIcon } from "@heroicons/react/24/outline"
import Shimmer from "~/components/ui/Shimmer"
import type { Post } from "~/models/Post"

interface PostTileProps {
    post: Post
    onRemove?: () => void
    isRemoving?: boolean
    isSelected?: boolean
    onSelect?: () => void
}

export default function PostTile({ post, onRemove, isRemoving = false, isSelected = false, onSelect }: PostTileProps) {
    const { thumbnailUrl, isLoading } = useShowPostThumbnail(post.uuid)

    const caption = post.caption
        ? post.caption.length > 50
            ? post.caption.substring(0, 50) + "..."
            : post.caption
        : "Sans description"

    return (
        <div
            onClick={onSelect}
            className={`flex flex-row items-center gap-2 p-2 rounded-lg transition-colors group ${
                onSelect ? "cursor-pointer" : ""
            } ${
                isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-light-gray/30"
            }`}
        >
            {isLoading ? (
                <Shimmer width="w-10" height="h-10" radius="rounded-md" />
            ) : thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" className="size-10 rounded-md object-cover shrink-0" />
            ) : (
                <div className="size-10 rounded-md bg-dark-bg-secondary shrink-0" />
            )}
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-body-xs truncate">{caption}</span>
                <span className="text-body-xs text-gray">{formatToFrenchDateShort(post.publishedAt)}</span>
            </div>

            {onRemove && (
                <button
                    onClick={onRemove}
                    disabled={isRemoving}
                    className="text-gray hover:text-danger transition-colors cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                    <TrashIcon className="size-3.5" strokeWidth={2} />
                </button>
            )}
        </div>
    )
}
