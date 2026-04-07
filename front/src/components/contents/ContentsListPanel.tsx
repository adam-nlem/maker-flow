import { useRef } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import { Button } from "~/components/ui/Button"
import Pill from "~/components/ui/Pill"
import Shimmer from "~/components/ui/Shimmer"
import { useListPaginatedPostGroups } from "~/hooks/api/postGroups/useListPaginatedPostGroups"
import { useListPaginatedPosts } from "~/hooks/api/posts/useListPaginatedPosts"
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll"
import { ContentsTab, contentsTabOptions, contentsTabToFrenchTranslation } from "~/models/enums/ContentsTab"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { useContentsRightPanelStore, ContentsRightPanel } from "~/stores/contents/contentsRightPanelStore"
import ContentCard from "./ContentCard"
import ContentsPlatformFilter from "./ContentsPlatformFilter"
import CreateGroupModal from "./CreateGroupModal"

interface ContentsListPanelProps {
    projectUuid: string
}

export default function ContentsListPanel({ projectUuid }: ContentsListPanelProps) {
    const activeTab = useContentsStore((s) => s.activeTab)
    const setActiveTab = useContentsStore((s) => s.setActiveTab)
    const platformFilter = useContentsStore((s) => s.platformFilter)
    const setPlatformFilter = useContentsStore((s) => s.setPlatformFilter)
    const selectedGroupUuid = useContentsStore((s) => s.selectedGroupUuid)
    const selectedPostUuid = useContentsStore((s) => s.selectedPostUuid)
    const selectGroup = useContentsStore((s) => s.selectGroup)
    const selectPost = useContentsStore((s) => s.selectPost)
    const isCreateGroupModalOpen = useContentsStore((s) => s.isCreateGroupModalOpen)
    const setIsCreateGroupModalOpen = useContentsStore((s) => s.setIsCreateGroupModalOpen)
    const openRightPanel = useContentsRightPanelStore((s) => s.openPanel)
    const closeRightPanel = useContentsRightPanelStore((s) => s.closePanel)

    const isGroupTab = activeTab === ContentsTab.Groups

    const {
        postGroups,
        isLoading: isGroupsLoading,
        isLoadingMore: isGroupsLoadingMore,
        hasMore: hasMoreGroups,
        listMore: listMoreGroups,
    } = useListPaginatedPostGroups({
        projectUuid: isGroupTab ? projectUuid : null,
    })

    const {
        posts,
        isLoading: isPostsLoading,
        isLoadingMore: isPostsLoadingMore,
        hasMore: hasMorePosts,
        listMore: listMorePosts,
    } = useListPaginatedPosts({
        projectUuid: isGroupTab ? null : projectUuid,
        platform: platformFilter,
    })

    const isLoading = isGroupTab ? isGroupsLoading : isPostsLoading
    const isLoadingMore = isGroupTab ? isGroupsLoadingMore : isPostsLoadingMore
    const hasMore = isGroupTab ? hasMoreGroups : hasMorePosts
    const listMore = isGroupTab ? listMoreGroups : listMorePosts
    const items = isGroupTab ? postGroups : posts

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    useInfiniteScroll(scrollContainerRef, hasMore, isLoadingMore, listMore)

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-row flex-wrap gap-3 p-4 flex-1">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="flex flex-col w-100 justify-between border border-light-gray rounded-lg p-4">
                            <div className="flex flex-row justify-between">
                                <Shimmer width="w-40" height="h-7" />
                                <Shimmer width="w-24" height="h-5" />
                            </div>
                            <Shimmer width="w-16" height="h-5" />
                            <div className="flex flex-row gap-2">
                                <Shimmer width="w-full" height="h-18" />
                                <Shimmer width="w-full" height="h-18" />
                                <Shimmer width="w-full" height="h-18" />
                            </div>
                            <Shimmer width="w-32" height="h-5" />
                        </div>
                    ))}
                </div>
            )
        }

        if (items.length === 0) {
            return (
                <div className="flex items-center justify-center py-20">
                    <p className="text-body-sm text-gray">
                        {isGroupTab ? "Aucun groupe de contenu trouvé." : "Aucun post trouvé."}
                    </p>
                </div>
            )
        }

        return (
            <div ref={scrollContainerRef} className="flex flex-row flex-wrap gap-3 p-4 overflow-y-auto scrollbar-none flex-1 min-h-0">
                {items.map((item) => {
                    const uuid = item.uuid

                    return (
                        <ContentCard
                            key={uuid}
                            data={item}
                            isSelected={isGroupTab ? selectedGroupUuid === uuid : selectedPostUuid === uuid}
                            onClick={() => {
                                if (isGroupTab) {
                                    selectGroup(uuid)
                                    openRightPanel(ContentsRightPanel.GroupDetail)
                                } else {
                                    selectPost(uuid)
                                    openRightPanel(ContentsRightPanel.PostDetail)
                                }
                            }}
                        />
                    )
                })}

                {isLoadingMore && (
                    <div className="flex flex-row flex-wrap gap-3 p-4 flex-1">
                        {[...Array(3)].map((_, i) => (
                            <Shimmer key={i} width="w-100" height="h-20" radius="rounded-lg" />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex-1 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-row items-center justify-between px-6 py-4 border-b border-light-gray">
                <h1 className="text-heading-xl">Contenus</h1>
                <Button
                    style="primary"
                    width="w-fit"
                    onClick={() => setIsCreateGroupModalOpen(true)}
                >
                    <div className="flex flex-row items-center gap-2">
                        <PlusIcon className="size-4" strokeWidth={2} />
                        <p className="text-sm">Nouveau groupe</p>
                    </div>
                </Button>
            </div>

            {/* Tab bar */}
            <div className="flex flex-row items-center gap-2 px-6 py-3 border-b border-light-gray">
                {contentsTabOptions.map((tab) => (
                    <Pill
                        key={tab}
                        label={contentsTabToFrenchTranslation[tab]}
                        isSelected={activeTab === tab}
                        onClick={() => {
                            setActiveTab(tab)
                            closeRightPanel()
                        }}
                        bgColorClassName="bg-primary/10"
                        borderColorClassName="border-primary/30"
                        textColorClassName="text-primary"
                    />
                ))}
            </div>

            {/* Platform filter */}
            <div className="px-6 py-3">
                <ContentsPlatformFilter
                    projectUuid={projectUuid}
                    platformFilter={platformFilter}
                    onPlatformChange={setPlatformFilter}
                />
            </div>

            {/* Content list */}
            {renderContent()}

            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={() => setIsCreateGroupModalOpen(false)}
                projectUuid={projectUuid}
            />
        </div>
    )
}
