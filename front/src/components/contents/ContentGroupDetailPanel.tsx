import { SidePanel } from "~/components/ui/SidePanel"
import { useListPaginatedPostGroups } from "~/hooks/api/postGroups/useListPaginatedPostGroups"
import { useUpdatePostGroup } from "~/hooks/api/postGroups/useUpdatePostGroup"
import { useDeletePostGroup } from "~/hooks/api/postGroups/useDeletePostGroup"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { postInsightTypeToFrenchTranslation, formatPostInsightValue } from "~/models/enums/PostInsightType"
import { DocumentTextIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline"
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog"
import { useState } from "react"
import PostPickerModal from "./PostPickerModal"
import ContentMetricBox from "./ContentMetricBox"
import PostTile from "./PostTile"

interface ContentGroupDetailPanelProps {
    groupUuid: string
    projectUuid: string
}

export default function ContentGroupDetailPanel({ groupUuid, projectUuid }: ContentGroupDetailPanelProps) {
    const closePanel = useContentsStore((s) => s.closePanel)
    const { postGroups } = useListPaginatedPostGroups({ projectUuid })
    const { deletePostGroup, isPending: isDeleting } = useDeletePostGroup()
    const { updatePostGroup, isPending: isUpdating } = useUpdatePostGroup()
    const [isPostPickerOpen, setIsPostPickerOpen] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const group = postGroups.find((g) => g.postGroup.uuid === groupUuid)

    const handleRemovePost = async (postUuid: string) => {
        await updatePostGroup({
            postGroupUuid: groupUuid,
            data: { removePostUuids: [postUuid] },
        })
    }

    const handleAddPosts = async (postUuids: string[]) => {
        await updatePostGroup({
            postGroupUuid: groupUuid,
            data: { addPostUuids: postUuids },
        })
        setIsPostPickerOpen(false)
    }

    const handleUnlinkScript = async () => {
        await updatePostGroup({
            postGroupUuid: groupUuid,
            data: { scriptUuid: null },
        })
    }

    if (!group) return null

    const existingPostUuids = group.postGroup.posts.map((p) => p.uuid)

    return (
        <>
            <SidePanel
                title={group.postGroup.title}
                width="w-96"
                side="right"
                isOpen={true}
                onClose={closePanel}
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
                <div className="p-4 flex flex-col gap-4">

                    {/* Metrics summary */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-heading-xs text-gray">Statistiques</h3>
                        <div className="flex flex-row flex-wrap gap-1">
                            {group.aggregatedInsights.map((insight) => (

                                <ContentMetricBox
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
            </SidePanel>

            <ConfirmDeleteDialog
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={async () => {
                    await deletePostGroup(groupUuid)
                    closePanel()
                }}
                isPending={isDeleting}
                message="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
            />

            <PostPickerModal
                isOpen={isPostPickerOpen}
                onClose={() => setIsPostPickerOpen(false)}
                onConfirm={handleAddPosts}
                projectUuid={projectUuid}
                excludeUuids={existingPostUuids}
                isConfirming={isUpdating}
            />
        </>
    )
}
