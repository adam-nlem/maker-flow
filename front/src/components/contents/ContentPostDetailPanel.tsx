import { SidePanel } from "~/components/ui/SidePanel"
import PlatformPill from "~/components/ui/PlatformPill"
import Shimmer from "~/components/ui/Shimmer"
import { useListPaginatedPosts } from "~/hooks/api/posts/useListPaginatedPosts"
import { useShowPostThumbnail } from "~/hooks/api/posts/useShowPostThumbnail"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { useContentsRightPanelStore, ContentsRightPanel } from "~/stores/contents/contentsRightPanelStore"
import { postInsightTypeToFrenchTranslation, formatPostInsightValue } from "~/models/enums/PostInsightType"
import { formatToFrenchDateShort } from "~/utils/dateFormatters"
import { ArrowTopRightOnSquareIcon, FolderIcon } from "@heroicons/react/24/outline"
import ContentMetricBox from "./ContentMetricBox"

interface ContentPostDetailPanelProps {
    postUuid: string | null
    projectUuid: string
}

export default function ContentPostDetailPanel({ postUuid, projectUuid }: ContentPostDetailPanelProps) {
    const closePanel = useContentsStore((s) => s.closePanel)
    const closeRightPanel = useContentsRightPanelStore((s) => s.closePanel)
    const isOpen = useContentsRightPanelStore((s) => s.activePanel === ContentsRightPanel.PostDetail)
    const selectGroup = useContentsStore((s) => s.selectGroup)
    const openRightPanel = useContentsRightPanelStore((s) => s.openPanel)
    const platformFilter = useContentsStore((s) => s.platformFilter)

    const handleClose = () => {
        closeRightPanel()
        closePanel()
    }

    const { posts } = useListPaginatedPosts({
        projectUuid,
        platform: platformFilter,
    })

    const postData = posts.find((p) => p.post.uuid === postUuid)
    const { thumbnailUrl, isLoading: isLoadingThumbnail } = useShowPostThumbnail(postUuid ?? undefined)

    const caption = postData?.post.caption ?? "Sans description"

    return (
        <SidePanel
            title="Détail du post"
            width="w-96"
            side="right"
            isOpen={isOpen}
            onClose={handleClose}
        >
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
                                <span className="text-body-xs text-gray">Aucune miniature</span>
                            </div>
                        )}
                    </div>

                    {/* Platform + date */}
                    <div className="flex flex-row items-center justify-between">
                        <PlatformPill
                            platform={postData.platform}
                            isSelected={true}
                            onToggle={() => { }}
                        />
                        <span className="text-body-xs text-gray">
                            {formatToFrenchDateShort(postData.post.publishedAt)}
                        </span>
                    </div>

                    {/* Caption */}
                    <div className="flex flex-col gap-1">
                        <h3 className="text-heading-xs text-gray">Description</h3>
                        <p className="text-body-xs select-text">{caption}</p>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-heading-xs text-gray">Statistiques</h3>
                        <div className="flex flex-row flex-wrap gap-1">
                            {postData.aggregatedInsights.map((insight) => (
                                <ContentMetricBox
                                    key={insight.type}
                                    label={postInsightTypeToFrenchTranslation[insight.type]}
                                    value={formatPostInsightValue(insight.type, insight.value)}
                                />
                            ))}
                            {postData.aggregatedInsights.length === 0 && (
                                <p className="text-body-xs text-gray">Aucune statistique disponible.</p>
                            )}
                        </div>
                    </div>

                    {/* Group link */}
                    {postData.postGroupTitle && postData.postGroupUuid && (
                        <div className="flex flex-col gap-1">
                            <h3 className="text-heading-xs text-gray">Groupe</h3>
                            <button
                                onClick={() => {
                                    selectGroup(postData.postGroupUuid)
                                    openRightPanel(ContentsRightPanel.GroupDetail)
                                }}
                                className="flex flex-row items-center gap-1.5 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                            >
                                <FolderIcon className="size-3.5" strokeWidth={2} />
                                <span className="text-body-xs">{postData.postGroupTitle}</span>
                            </button>
                        </div>
                    )}

                    {/* External URL */}
                    {postData.post.externalUrl && (
                        <a
                            href={postData.post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-row items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                        >
                            <ArrowTopRightOnSquareIcon className="size-3.5" strokeWidth={2} />
                            <span className="text-body-xs">Voir sur la plateforme</span>
                        </a>
                    )}
                </div>
            )}
        </SidePanel>
    )
}
