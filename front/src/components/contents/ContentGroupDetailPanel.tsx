import { SidePanel } from "~/components/ui/SidePanel"
import Shimmer from "~/components/ui/Shimmer"
import DonutChart from "~/components/ui/DonutChart"
import { useShowPostGroup } from "~/hooks/api/postGroups/useShowPostGroup"
import { useUpdatePostGroup } from "~/hooks/api/postGroups/useUpdatePostGroup"
import { useDeletePostGroup } from "~/hooks/api/postGroups/useDeletePostGroup"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { useContentsRightPanelStore, ContentsRightPanel } from "~/stores/contents/contentsRightPanelStore"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { PostInsightType, postInsightTypeToFrenchTranslation, postInsightTypeToEngagementColor, postInsightTypeToEngagementBgClass, postInsightOverviewTypes, postInsightEngagementTypes, postInsightFollowerTypes, formatPostInsightValue } from "~/models/enums/PostInsightType"
import { formatCompactNumber } from "~/utils/numberFormatters"
import { DocumentTextIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline"
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog"
import { useState } from "react"
import PostPickerModal from "./PostPickerModal"
import ContentMetricBox from "./ContentMetricBox"
import PostTile from "./PostTile"

interface ContentGroupDetailPanelProps {
    groupUuid: string | null
}

export default function ContentGroupDetailPanel({ groupUuid }: ContentGroupDetailPanelProps) {
    const closePanel = useContentsStore((s) => s.closePanel)
    const selectPost = useContentsStore((s) => s.selectPost)
    const isOpen = useContentsRightPanelStore((s) => s.activePanel === ContentsRightPanel.GroupDetail)
    const closeRightPanel = useContentsRightPanelStore((s) => s.closePanel)
    const openRightPanel = useContentsRightPanelStore((s) => s.openPanel)
    const focusedProjectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const { postGroup: group, isLoading } = useShowPostGroup(groupUuid ?? undefined)
    const { deletePostGroup, isPending: isDeleting } = useDeletePostGroup()
    const { updatePostGroup, isPending: isUpdating } = useUpdatePostGroup()
    const [isPostPickerOpen, setIsPostPickerOpen] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const handleClose = () => {
        closeRightPanel()
        closePanel()
    }

    const handleRemovePost = async (postUuid: string) => {
        if (!groupUuid) return
        await updatePostGroup({
            postGroupUuid: groupUuid,
            data: { removePostUuids: [postUuid] },
        })
    }

    const handleAddPosts = async (postUuids: string[]) => {
        if (!groupUuid) return
        await updatePostGroup({
            postGroupUuid: groupUuid,
            data: { addPostUuids: postUuids },
        })
        setIsPostPickerOpen(false)
    }

    const handleUnlinkScript = async () => {
        if (!groupUuid) return
        await updatePostGroup({
            postGroupUuid: groupUuid,
            data: { scriptUuid: null },
        })
    }

    const existingPostUuids = group?.postGroup.posts.map((p) => p.uuid) ?? []

    const overviewMetrics = group?.aggregatedInsights.filter((i) => postInsightOverviewTypes.has(i.type)) ?? []
    const engagementMetrics = group?.aggregatedInsights.filter((i) => postInsightEngagementTypes.has(i.type)) ?? []
    const followerMetrics = group?.aggregatedInsights.filter((i) => postInsightFollowerTypes.has(i.type)) ?? []

    const totalEngagement = group?.aggregatedInsights.find((i) => i.type === PostInsightType.TotalInteractions)?.value ?? 0

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
        <>
            <SidePanel
                title={group?.postGroup.title ?? ""}
                width="w-120"
                side="right"
                isOpen={isOpen}
                onClose={handleClose}
                headerActions={
                    <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        disabled={isDeleting}
                        className="text-gray hover:text-danger transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <TrashIcon className="size-4" strokeWidth={2} />
                    </button>
                }
            >
                {isLoading && (
                    <div className="p-4 flex flex-col gap-4">
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
                        <Shimmer width="w-full" height="h-10" />
                        <div className="flex flex-col gap-1">
                            <Shimmer width="w-full" height="h-10" />
                            <Shimmer width="w-full" height="h-10" />
                            <Shimmer width="w-full" height="h-10" />
                        </div>
                    </div>
                )}
                {group && (
                    <div className="p-4 flex flex-col gap-4">

                        {/* Vue d'ensemble */}
                        {(overviewMetrics.length > 0 || group.engagementByViews !== null) && (
                            <div className="flex flex-col gap-2">
                                <h3 className="text-heading-xs text-gray uppercase">Vue d'ensemble</h3>
                                <div className="grid grid-cols-3 gap-1">
                                    {overviewMetrics.map((insight) => (
                                        <ContentMetricBox
                                            key={insight.type}
                                            label={postInsightTypeToFrenchTranslation[insight.type]}
                                            value={formatPostInsightValue(insight.type, insight.value)}
                                        />
                                    ))}
                                    {group.engagementByViews !== null && (
                                        <ContentMetricBox
                                            label="Engagement"
                                            value={`${group.engagementByViews.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%`}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Répartition de l'engagement */}
                        {engagementMetrics.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h3 className="text-heading-xs text-gray uppercase">Répartition de l'engagement</h3>
                                <div className="flex flex-row items-center gap-4">
                                    <DonutChart
                                        data={engagementMetrics.map((m) => ({
                                            label: postInsightTypeToFrenchTranslation[m.type],
                                            value: m.value,
                                            color: postInsightTypeToEngagementColor[m.type] ?? "var(--color-gray)",
                                        }))}
                                        size={120}
                                        centerLabel={formatCompactNumber(totalEngagement)}
                                        centerSubLabel="actions"
                                    />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        {engagementMetrics.map((metric) => {
                                            const pct = totalEngagement > 0
                                                ? Math.round((metric.value / totalEngagement) * 100)
                                                : 0
                                            return (
                                                <div key={metric.type} className="flex flex-row items-center justify-between">
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div className={`size-2.5 rounded-sm ${postInsightTypeToEngagementBgClass[metric.type] ?? "bg-gray"}`} />
                                                        <span className="text-body-xs">{postInsightTypeToFrenchTranslation[metric.type]}</span>
                                                    </div>
                                                    <div className="flex flex-row items-center gap-2">
                                                        <span className="text-heading-xs">{formatCompactNumber(metric.value)}</span>
                                                        <span className="text-body-xs text-gray">{pct}%</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ratio like / dislike */}
                        {likesValue !== null && dislikesValue !== null && (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex flex-row items-center justify-between">
                                    <span className="text-body-xs text-gray">Ratio like / dislike</span>
                                    <span className="text-heading-xs">{likePercentage.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%</span>
                                </div>
                                <div className="w-full h-2 bg-light-gray rounded-full">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${likePercentage}%` }}
                                    />
                                </div>
                                <div className="flex flex-row justify-between">
                                    <span className="text-body-xs text-gray">{formatCompactNumber(likesValue)} positifs</span>
                                    <span className="text-body-xs text-gray">{formatCompactNumber(dislikesValue)} négatifs</span>
                                </div>
                            </div>
                        )}

                        {/* Abonnés */}
                        {followerMetrics.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h3 className="text-heading-xs text-gray uppercase">Abonnés</h3>
                                <div className="grid grid-cols-3 gap-1">
                                    {gainedInsight && (
                                        <ContentMetricBox
                                            label="Gagnés"
                                            value={`+${formatCompactNumber(gainedInsight.value)}`}
                                        />
                                    )}
                                    {lostInsight && (
                                        <ContentMetricBox
                                            label="Perdus"
                                            value={formatCompactNumber(lostInsight.value)}
                                        />
                                    )}
                                    {gainedInsight && lostInsight && (
                                        <ContentMetricBox
                                            label="Net"
                                            value={`${netFollowers >= 0 ? "+" : ""}${formatCompactNumber(netFollowers)}`}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Script section */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-heading-xs text-gray uppercase">Script</h3>
                            {group.script ? (
                                <div className="flex flex-row items-center justify-between gap-2 border border-light-gray rounded-md p-2">
                                    <div className="flex flex-row items-center gap-1.5 min-w-0">
                                        <DocumentTextIcon className="size-3.5 text-primary shrink-0" strokeWidth={2} />
                                        <span className="text-body-xs text-primary truncate">{group.script.title}</span>
                                    </div>
                                    <button
                                        onClick={handleUnlinkScript}
                                        disabled={isUpdating}
                                        className="text-gray hover:text-danger transition-colors cursor-pointer text-body-xs whitespace-nowrap disabled:opacity-50"
                                    >
                                        Délier
                                    </button>
                                </div>
                            ) : (
                                <p className="text-body-xs text-gray">Aucun script lié.</p>
                            )}
                        </div>

                        {/* Posts list */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between">
                                <h3 className="text-heading-xs text-gray uppercase">
                                    Posts ({group.postGroup.posts.length})
                                </h3>
                                <button
                                    onClick={() => setIsPostPickerOpen(true)}
                                    className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                                >
                                    <PlusIcon className="size-4" strokeWidth={2} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-1">
                                {group.postGroup.posts.map((post) => (
                                    <PostTile
                                        key={post.uuid}
                                        post={post}
                                        onRemove={() => handleRemovePost(post.uuid)}
                                        isRemoving={isUpdating}
                                        onSelect={() => {
                                            selectPost(post.uuid)
                                            openRightPanel(ContentsRightPanel.PostDetail)
                                        }}
                                    />
                                ))}
                                {group.postGroup.posts.length === 0 && (
                                    <p className="text-body-xs text-gray">Aucun post dans ce groupe.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </SidePanel>

            <ConfirmDeleteDialog
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={async () => {
                    if (!groupUuid) return
                    await deletePostGroup(groupUuid)
                    handleClose()
                }}
                isPending={isDeleting}
                message="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
            />

            <PostPickerModal
                isOpen={isPostPickerOpen}
                onClose={() => setIsPostPickerOpen(false)}
                onConfirm={handleAddPosts}
                projectUuid={focusedProjectUuid!}
                excludeUuids={existingPostUuids}
                isConfirming={isUpdating}
            />
        </>
    )
}
