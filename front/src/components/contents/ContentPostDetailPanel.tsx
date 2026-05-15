import { useTranslation } from "react-i18next"
import { SidePanel } from "~/components/ui/SidePanel"
import PlatformPill from "~/components/ui/PlatformPill"
import Shimmer from "~/components/ui/Shimmer"
import DonutChart from "~/components/ui/DonutChart"
import { useShowPost } from "~/hooks/api/posts/useShowPost"
import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { useContentsRightPanelStore, ContentsRightPanel } from "~/stores/contents/contentsRightPanelStore"
import { PostInsightType, postInsightTypeTranslationKeys, postInsightTypeToEngagementColor, postInsightTypeToEngagementBgClass, postInsightOverviewTypes, postInsightEngagementTypes, postInsightFollowerTypes, formatPostInsightValue } from "~/models/enums/PostInsightType"
import { formatCompactNumber } from "~/utils/numberFormatters"
import { formatToFrenchDateShort } from "~/utils/dateFormatters"
import { ArrowTopRightOnSquareIcon, FolderIcon } from "@heroicons/react/24/outline"
import ContentMetricBox from "./ContentMetricBox"

interface ContentPostDetailPanelProps {
    postUuid: string | null
}

export default function ContentPostDetailPanel({ postUuid }: ContentPostDetailPanelProps) {
    const { t } = useTranslation()
    const closePanel = useContentsStore((s) => s.closePanel)
    const closeRightPanel = useContentsRightPanelStore((s) => s.closePanel)
    const isOpen = useContentsRightPanelStore((s) => s.activePanel === ContentsRightPanel.PostDetail)
    const selectGroup = useContentsStore((s) => s.selectGroup)
    const openRightPanel = useContentsRightPanelStore((s) => s.openPanel)

    const handleClose = () => {
        closeRightPanel()
        closePanel()
    }

    const { post: postData, isLoading } = useShowPost(postUuid ?? undefined)
    const { thumbnailUrl, isLoading: isLoadingThumbnail } = useShowPostThumbnail(postUuid ?? undefined)

    const caption = postData?.post.caption ?? t("contents:post.noCaption")

    const overviewMetrics = postData?.aggregatedInsights.filter((i) => postInsightOverviewTypes.has(i.type)) ?? []
    const engagementMetrics = postData?.aggregatedInsights.filter((i) => postInsightEngagementTypes.has(i.type)) ?? []
    const followerMetrics = postData?.aggregatedInsights.filter((i) => postInsightFollowerTypes.has(i.type)) ?? []

    const totalEngagement = postData?.aggregatedInsights.find((i) => i.type === PostInsightType.TotalInteractions)?.value ?? 0

    const likesInsight = engagementMetrics.find((m) => m.type === PostInsightType.Likes)
    const dislikesInsight = engagementMetrics.find((m) => m.type === PostInsightType.Dislikes)
    const likesValue = likesInsight?.value ?? null
    const dislikesValue = dislikesInsight?.value ?? null
    const likeRatioTotal = (likesValue ?? 0) + (dislikesValue ?? 0)
    const likePercentage = likeRatioTotal > 0 ? ((likesValue ?? 0) / likeRatioTotal) * 100 : 0

    const gainedInsight = followerMetrics.find((m) => m.type === PostInsightType.FollowersGained)
    const lostInsight = followerMetrics.find((m) => m.type === PostInsightType.FollowersLost)
    const netFollowers = (gainedInsight?.value ?? 0) - (lostInsight?.value ?? 0)

    return (
        <SidePanel
            title={t("contents:post.detailTitle")}
            width="w-120"
            side="right"
            isOpen={isOpen}
            onClose={handleClose}
        >
            {isLoading && (
                <div className="p-4 flex flex-col gap-4">
                    <Shimmer width="w-full" height="h-48" radius="rounded-lg" />
                    <div className="flex flex-row items-center justify-between">
                        <Shimmer width="w-24" height="h-6" />
                        <Shimmer width="w-20" height="h-4" />
                    </div>
                    <Shimmer width="w-full" height="h-12" />
                    <div className="grid grid-cols-3 gap-1">
                        <Shimmer width="w-full" height="h-14" />
                        <Shimmer width="w-full" height="h-14" />
                        <Shimmer width="w-full" height="h-14" />
                        <Shimmer width="w-full" height="h-14" />
                        <Shimmer width="w-full" height="h-14" />
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <Shimmer width="w-30" height="h-30" radius="rounded-full" />
                        <div className="flex flex-col gap-2 flex-1">
                            <Shimmer width="w-full" height="h-4" />
                            <Shimmer width="w-full" height="h-4" />
                            <Shimmer width="w-full" height="h-4" />
                        </div>
                    </div>
                </div>
            )}
            {postData && (
                <div className="p-4 flex flex-col gap-4">
                    {/* Thumbnail */}
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-dark-bg-secondary">
                        {isLoadingThumbnail ? (
                            <Shimmer width="w-full" height="h-full" radius="rounded-lg" />
                        ) : thumbnailUrl ? (
                            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-body-xs text-muted-2">{t("contents:post.noThumbnail")}</span>
                            </div>
                        )}
                    </div>

                    {/* Platform + date */}
                    <div className="flex flex-row items-center justify-between">
                        <PlatformPill platform={postData.platform} />
                        <span className="text-body-xs text-muted-2">
                            {formatToFrenchDateShort(postData.post.publishedAt)}
                        </span>
                    </div>

                    {/* Caption */}
                    <p className="text-body-xs select-text">{caption}</p>

                    {(overviewMetrics.length > 0 || postData.engagementByViews !== null) && (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-heading-xs text-muted-2 uppercase">{t("contents:post.overview")}</h3>
                            <div className="grid grid-cols-3 gap-1">
                                {overviewMetrics.map((insight) => (
                                    <ContentMetricBox
                                        key={insight.type}
                                        label={t(postInsightTypeTranslationKeys[insight.type])}
                                        value={formatPostInsightValue(insight.type, insight.value)}
                                    />
                                ))}
                                {postData.engagementByViews !== null && (
                                    <ContentMetricBox
                                        label={t("contents:post.engagement")}
                                        value={`${postData.engagementByViews.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%`}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {engagementMetrics.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-heading-xs text-muted-2 uppercase">{t("contents:post.engagementDistribution")}</h3>
                            <div className="flex flex-row items-center gap-4">
                                <DonutChart
                                    data={engagementMetrics.map((m) => ({
                                        label: t(postInsightTypeTranslationKeys[m.type]),
                                        value: m.value,
                                        color: postInsightTypeToEngagementColor[m.type] ?? "var(--color-muted-2)",
                                    }))}
                                    size={120}
                                    centerLabel={formatCompactNumber(totalEngagement)}
                                    centerSubLabel={t("contents:post.engagementCenter")}
                                />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    {engagementMetrics.map((metric) => {
                                        const pct = totalEngagement > 0
                                            ? Math.round((metric.value / totalEngagement) * 100)
                                            : 0
                                        return (
                                            <div key={metric.type} className="flex flex-row items-center justify-between">
                                                <div className="flex flex-row items-center gap-2">
                                                    <div className={`size-2.5 rounded-sm ${postInsightTypeToEngagementBgClass[metric.type] ?? "bg-muted-2"}`} />
                                                    <span className="text-body-xs">{t(postInsightTypeTranslationKeys[metric.type])}</span>
                                                </div>
                                                <div className="flex flex-row items-center gap-2">
                                                    <span className="text-heading-xs">{formatCompactNumber(metric.value)}</span>
                                                    <span className="text-body-xs text-muted-2">{pct}%</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {likesValue !== null && dislikesValue !== null && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex flex-row items-center justify-between">
                                <span className="text-body-xs text-muted-2">{t("contents:post.likeRatio")}</span>
                                <span className="text-heading-xs">{likePercentage.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%</span>
                            </div>
                            <div className="w-full h-2 bg-pale-gray-2 rounded-full">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${likePercentage}%` }}
                                />
                            </div>
                            <div className="flex flex-row justify-between">
                                <span className="text-body-xs text-muted-2">{t("contents:post.likesPositive", { count: likesValue })}</span>
                                <span className="text-body-xs text-muted-2">{t("contents:post.dislikesNegative", { count: dislikesValue })}</span>
                            </div>
                        </div>
                    )}

                    {followerMetrics.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-heading-xs text-muted-2 uppercase">{t("contents:post.followers")}</h3>
                            <div className="grid grid-cols-3 gap-1">
                                {gainedInsight && (
                                    <ContentMetricBox
                                        label={t("contents:post.gained")}
                                        value={`+${formatCompactNumber(gainedInsight.value)}`}
                                    />
                                )}
                                {lostInsight && (
                                    <ContentMetricBox
                                        label={t("contents:post.lost")}
                                        value={formatCompactNumber(lostInsight.value)}
                                    />
                                )}
                                {gainedInsight && lostInsight && (
                                    <ContentMetricBox
                                        label={t("contents:post.net")}
                                        value={`${netFollowers >= 0 ? "+" : ""}${formatCompactNumber(netFollowers)}`}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {postData.postGroupTitle && postData.postGroupUuid && (
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => {
                                    selectGroup(postData.postGroupUuid)
                                    openRightPanel(ContentsRightPanel.GroupDetail)
                                }}
                                className="flex flex-row items-center gap-1.5 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                            >
                                <FolderIcon className="size-3.5" strokeWidth={2} />
                                <span className="text-body-xs">{t("contents:post.groupPrefix")} <strong>{postData.postGroupTitle}</strong></span>
                            </button>
                        </div>
                    )}

                    {postData.post.externalUrl && (
                        <a
                            href={postData.post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-row items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                        >
                            <ArrowTopRightOnSquareIcon className="size-3.5" strokeWidth={2} />
                            <span className="text-body-xs">{t("contents:post.viewOnPlatform")}</span>
                        </a>
                    )}
                </div>
            )}
        </SidePanel>
    )
}
