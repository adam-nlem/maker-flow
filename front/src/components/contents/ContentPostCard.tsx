import { PostListItemDTO } from "~/dtos/posts/PostListItemDTO"
import { PostInsightType } from "~/models/enums/PostInsightType"
import { formatToFrenchDateShort } from "~/utils/dateFormatters"
import CompactMetricRow from "../ui/CompactMetricRow"
import PlatformPill from "../ui/PlatformPill"
import PostThumbnail from "../ui/PostThumbnail"

interface ContentPostCardProps {
    postDTO: PostListItemDTO
    onClick: () => void
}

export default function ContentPostCard({ postDTO, onClick }: ContentPostCardProps) {

    return (
        <div className=" w-35 flex flex-col gap-1 cursor-pointer bg-pale-gray-2/30 rounded-lg border border-pale-gray"
            onClick={onClick}>
            <div className="relative">
                <div className="absolute top-1 left-1 z-10">
                    <PlatformPill platform={postDTO.platform} />
                </div>
                <PostThumbnail postUuid={postDTO.uuid} className="h-50 rounded-tl-lg rounded-tr-lg" />
            </div>

            <div className="p-1 flex flex-col gap-3">

                <p className="text-body-xs text-muted-2 whitespace-nowrap">
                    {formatToFrenchDateShort(postDTO.publishedAt)}
                </p>



                <h3 className="text-heading-xs line-clamp-2">
                    {postDTO.caption ?? "Sans description"}
                </h3>



                <CompactMetricRow metrics={[
                    ...(postDTO.views !== null ? [{ type: PostInsightType.Views, value: postDTO.views }] : []),
                    ...(postDTO.likes !== null ? [{ type: PostInsightType.Likes, value: postDTO.likes }] : []),
                    ...(postDTO.comments !== null ? [{ type: PostInsightType.Comments, value: postDTO.comments }] : []),
                ]} />

            </div>
        </div >
    )
}
