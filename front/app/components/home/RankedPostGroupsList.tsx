import PostRankingItemTile from "~/components/insights/posts/PostRankingItemTile"
import { useListRankedPostGroups } from "~/hooks/api/postGroups/useListRankedPostGroups"

interface RankedPostGroupsListProps {
    projectUuid: string
}

export default function RankedPostGroupsList({ projectUuid }: RankedPostGroupsListProps) {
    const { postGroups, isLoading } = useListRankedPostGroups({ projectUuid })

    if (isLoading) return null

    if (postGroups.length === 0) {
        return <p className="text-body-sm text-medium-gray">Aucun groupe de posts trouvé.</p>
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-heading-sm mb-2">Classement des groupes de posts</h2>
            {postGroups.map((group, index) => (
                <PostRankingItemTile
                    key={group.postGroup.uuid}
                    index={index}
                    title={group.postGroup.title}
                    subtitle={`${group.postGroup.posts.length} post${group.postGroup.posts.length > 1 ? 's' : ''}`}
                    postUuid={group.postGroup.posts[0]?.uuid}
                />
            ))}
        </div>
    )
}
