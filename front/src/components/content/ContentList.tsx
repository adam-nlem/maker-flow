import Shimmer from "~/components/ui/Shimmer"
import { PostGroupWithInsightsAndScriptDTO } from "~/dtos/postGroups/PostGroupWithInsightsAndScriptDTO"
import { useListPaginatedPostGroups } from "~/hooks/api/postGroups/useListPaginatedPostGroups"
import { useListPaginatedPosts } from "~/hooks/api/posts/useListPaginatedPosts"
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll"
import { ContentTab } from "~/models/enums/ContentTab"
import { useContentStore } from "~/stores/content/contentStore"
import ContentCard from "./ContentCard"

interface ContentListProps {
    projectUuid: string
}

export default function ContentList({ projectUuid }: ContentListProps) {
    const activeTab = useContentStore((s) => s.activeTab)
    const platformFilter = useContentStore((s) => s.platformFilter)
    const selectedGroupUuid = useContentStore((s) => s.selectedGroupUuid)
    const selectedPostUuid = useContentStore((s) => s.selectedPostUuid)
    const selectGroup = useContentStore((s) => s.selectGroup)
    const selectPost = useContentStore((s) => s.selectPost)

    const isGroupTab = activeTab === ContentTab.Groups

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

    const sentinelRef = useInfiniteScroll(hasMore, isLoadingMore, listMore)

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
        <div className={"flex flex-row flex-wrap gap-3 p-4 overflow-y-auto scrollbar-none flex-1 min-h-0"}>
            {items.map((item) => {
                const isGroup = item instanceof PostGroupWithInsightsAndScriptDTO
                const uuid = isGroup ? item.postGroup.uuid : item.post.uuid

                return (
                    <ContentCard
                        key={uuid}
                        data={item}
                        isSelected={isGroupTab ? selectedGroupUuid === uuid : selectedPostUuid === uuid}
                        onClick={() => (isGroupTab ? selectGroup(uuid) : selectPost(uuid))}
                    />
                )
            })}
            <div ref={sentinelRef} className="h-1" />
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
