import { PostGroupListItemDTO } from "~/dtos/postGroups/PostGroupListItemDTO"
import { PostInsightType } from "~/models/enums/PostInsightType"
import { formatToFrenchDateShort } from "~/utils/dateFormatters"
import CompactMetricRow from "../ui/CompactMetricRow"
import PostThumbnail from "../ui/PostThumbnail"

interface ContentGroupCardProps {
    postGroupDTO: PostGroupListItemDTO
    onClick: () => void
}

export default function ContentGroupCard({ postGroupDTO, onClick }: ContentGroupCardProps) {

    const displayUuids = postGroupDTO.postUuids.slice(0, 3)
    const extraCount = postGroupDTO.postUuids.length - 3

    return (
        <div className="w-55 flex flex-col gap-1 cursor-pointer bg-light-gray/30 rounded-lg border border-light-gray"
            onClick={onClick}>
            <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-50 rounded-t-lg overflow-hidden">
                <PostThumbnail postUuid={displayUuids[0]} className="row-span-2" />
                <PostThumbnail postUuid={displayUuids[1]} className={displayUuids.length < 3 ? "row-span-2" : ""} />
                {displayUuids.length >= 3 && (
                    <div className="relative">
                        <PostThumbnail postUuid={displayUuids[2]} />
                        {extraCount > 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-heading-sm font-semibold">+{extraCount}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-1 flex flex-col gap-1">
                <p className="text-body-xs text-gray whitespace-nowrap">
                    {formatToFrenchDateShort(postGroupDTO.createdAt)}
                </p>

                <h3 className="text-heading-xs line-clamp-2">
                    {postGroupDTO.title ?? "Sans description"}
                </h3>

                <CompactMetricRow metrics={[
                    ...(postGroupDTO.views !== null ? [{ type: PostInsightType.Views, value: postGroupDTO.views }] : []),
                    ...(postGroupDTO.likes !== null ? [{ type: PostInsightType.Likes, value: postGroupDTO.likes }] : []),
                    ...(postGroupDTO.comments !== null ? [{ type: PostInsightType.Comments, value: postGroupDTO.comments }] : []),
                ]} />
            </div>
        </div>
    )
}
