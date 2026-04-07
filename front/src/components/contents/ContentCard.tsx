import { PostGroupWithInsightsAndScriptDTO } from "~/dtos/postGroups/PostGroupWithInsightsAndScriptDTO"
import type { PostWithPlatformAndInsightsDTO } from "~/dtos/posts/PostWithPlatformAndInsightsDTO"
import { PostInsightType, postInsightTypeToFrenchTranslation } from "~/models/enums/PostInsightType"
import { platformToFrenchTranslation, platformToIcon } from "~/models/enums/Platform"
import { formatCompactNumber } from "~/utils/numberFormatters"
import { formatToFrenchDateShort } from "~/utils/dateFormatters"
import { DocumentTextIcon } from "@heroicons/react/24/outline"
import ContentMetricBox from "./ContentMetricBox"

interface ContentCardProps {
    data: PostGroupWithInsightsAndScriptDTO | PostWithPlatformAndInsightsDTO
    isSelected: boolean
    onClick: () => void
}

export default function ContentCard({ data, isSelected, onClick }: ContentCardProps) {
    const isGroup = data instanceof PostGroupWithInsightsAndScriptDTO

    const views = data.aggregatedInsights.find((i) => i.type === PostInsightType.Views)?.value ?? null
    const totalInteractions = data.aggregatedInsights.find((i) => i.type === PostInsightType.TotalInteractions)?.value ?? null

    return (
        <div
            onClick={onClick}
            className={`flex flex-col gap-2 border rounded-lg p-2 cursor-pointer transition-colors hover:border-gray w-100 max-h-fit ${isSelected ? "border-primary" : "border-light-gray"}`}
        >
            {/* Header */}
            {isGroup ? (
                <>
                    <div className="flex flex-row items-center justify-between gap-2">
                        <h3 className="text-heading-sm truncate">{data.postGroup.title}</h3>
                        <span className="text-body-xs text-gray whitespace-nowrap">
                            {formatToFrenchDateShort(data.postGroup.createdAt)}
                        </span>
                    </div>
                    <span className="text-body-xs text-gray">
                        {data.postGroup.posts.length} post{data.postGroup.posts.length > 1 ? "s" : ""}
                    </span>
                </>
            ) : (
                <div className="flex flex-row items-start gap-2">
                    <img
                        src={platformToIcon[data.platform]}
                        alt={platformToFrenchTranslation[data.platform]}
                        className={"size-5 rounded-md object-cover"}
                    />

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <h3 className="text-heading-sm truncate">
                            {data.post.caption
                                ? data.post.caption.length > 80
                                    ? data.post.caption.substring(0, 80) + "..."
                                    : data.post.caption
                                : "Sans description"}
                        </h3>

                    </div>
                    <span className="text-body-xs text-gray whitespace-nowrap">
                        {formatToFrenchDateShort(data.post.publishedAt)}
                    </span>
                </div>
            )}

            {/* Metrics row */}
            <div className="flex flex-row gap-2">
                <ContentMetricBox
                    label={postInsightTypeToFrenchTranslation[PostInsightType.Views]}
                    value={views !== null ? formatCompactNumber(views) : "-"}
                />
                <ContentMetricBox
                    label="Engagement"
                    value={data.engagementByViews !== null ? `${data.engagementByViews}%` : "-"}
                />
                <ContentMetricBox
                    label={postInsightTypeToFrenchTranslation[PostInsightType.TotalInteractions]}
                    value={totalInteractions !== null ? formatCompactNumber(totalInteractions) : "-"}
                />
            </div>

            {/* Script badge - group only */}
            {isGroup && (
                <div className="border-t border-light-gray pt-2">
                    {data.script ? (
                        <div className="flex flex-row items-center gap-1.5">
                            <DocumentTextIcon className="size-3.5 text-primary" strokeWidth={2} />
                            <span className="text-body-xs text-primary truncate">{data.script.title}</span>
                        </div>
                    ) : (
                        <span className="text-body-xs text-gray">Aucun script lié</span>
                    )}
                </div>
            )}
        </div>
    )
}
