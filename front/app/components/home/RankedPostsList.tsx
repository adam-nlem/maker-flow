import PostRankingItemTile from "~/components/insights/posts/PostRankingItemTile"
import { useListRankedPosts } from "~/hooks/api/posts/useListRankedPosts"
import { formatToFrenchRelative } from "~/utils/dateFormatters"

interface RankedPostsListProps {
    integrationUuid: string
}

export default function RankedPostsList({ integrationUuid }: RankedPostsListProps) {
    const { posts, isLoading } = useListRankedPosts({ integrationUuid })

    if (isLoading) return null

    if (posts.length === 0) {
        return <p className="text-body-sm text-medium-gray">Aucun post trouvé.</p>
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-heading-sm mb-2">Classement des posts</h2>
            {posts.map((post, index) => (
                <PostRankingItemTile
                    key={post.post.uuid}
                    index={index}
                    title={post.post.caption}
                    subtitle={formatToFrenchRelative(post.post.publishedAt)}
                    postUuid={post.post.uuid}
                />
            ))}
        </div>
    )
}
