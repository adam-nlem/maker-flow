import { useRef } from "react"
import Shimmer from "~/components/ui/Shimmer"
import { useListPaginatedPostGroups } from "~/hooks/api/postGroups/useListPaginatedPostGroups"
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { useContentsRightPanelStore, ContentsRightPanel } from "~/stores/contents/contentsRightPanelStore"
import ContentGroupCard from "./ContentGroupCard"

interface ContentGroupListProps {
    projectUuid: string;
}

export default function ContentGroupList({ projectUuid }: ContentGroupListProps) {

    const searchTerm = useContentsStore((s) => s.searchTerm)
    const selectGroup = useContentsStore((s) => s.selectGroup)
    const openRightPanel = useContentsRightPanelStore((s) => s.openPanel)

    const {
        postGroups,
        isLoading,
        isLoadingMore,
        hasMore,
        listMore,
    } = useListPaginatedPostGroups({
        projectUuid: projectUuid,
        searchTerm: searchTerm || undefined,
    })

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    useInfiniteScroll(scrollContainerRef, hasMore, isLoadingMore, listMore)


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

    if (postGroups.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-body-sm text-gray">
                    Aucun groupe de contenu trouvé.
                </p>
            </div>
        )
    }

    return (
        <div ref={scrollContainerRef} className="flex flex-row flex-wrap gap-2 p-4 overflow-y-auto scrollbar-none ">
            {postGroups.map((postGroup) => {
                const uuid = postGroup.uuid

                return (
                    <ContentGroupCard
                        key={uuid}
                        postGroupDTO={postGroup}
                        onClick={() => {
                            selectGroup(uuid)
                            openRightPanel(ContentsRightPanel.GroupDetail)
                        }}
                    />
                )
            })}
        </div>
    )
}
