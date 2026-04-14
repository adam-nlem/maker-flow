import { SidePanel } from "~/components/ui/SidePanel"
import Shimmer from "~/components/ui/Shimmer"
import { useShowPostGroup } from "~/hooks/api/postGroups/useShowPostGroup"
import { useUpdatePostGroup } from "~/hooks/api/postGroups/useUpdatePostGroup"
import { useDeletePostGroup } from "~/hooks/api/postGroups/useDeletePostGroup"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { useContentsRightPanelStore, ContentsRightPanel } from "~/stores/contents/contentsRightPanelStore"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { postInsightTypeToFrenchTranslation, formatPostInsightValue } from "~/models/enums/PostInsightType"
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
    const isOpen = useContentsRightPanelStore((s) => s.activePanel === ContentsRightPanel.GroupDetail)
    const closeRightPanel = useContentsRightPanelStore((s) => s.closePanel)
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
                        <Shimmer width="w-full" height="h-16" />
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

                        {/* Metrics summary */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-heading-xs text-gray">Statistiques</h3>
                            <div className="flex flex-row flex-wrap gap-1">
                                {group.aggregatedInsights.map((insight) => (
                                    <ContentMetricBox
                                        key={insight.type}
                                        label={postInsightTypeToFrenchTranslation[insight.type]}
                                        value={formatPostInsightValue(insight.type, insight.value)}
                                    />
                                ))}
                                {group.aggregatedInsights.length === 0 && (
                                    <p className="text-body-xs text-gray">Aucune statistique disponible.</p>
                                )}
                            </div>
                        </div>

                        {/* Script section */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-heading-xs text-gray">Script</h3>
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
                                <h3 className="text-heading-xs text-gray">
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
