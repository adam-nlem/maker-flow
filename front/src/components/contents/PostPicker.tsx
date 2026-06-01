import { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import Shimmer from "~/components/ui/Shimmer"
import { useListPaginatedPosts } from "~/hooks/api/posts/useListPaginatedPosts"
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll"
import { Platform } from "~/models/enums/Platform"
import ContentsPlatformFilter from "./ContentsPlatformFilter"
import PostTile from "./PostTile"
import SearchBar from "../ui/SearchBar"

interface PostPickerProps {
  projectUuid: string
  selectedUuids: string[]
  onSelectionChange: (uuids: string[]) => void
  excludeUuids?: string[]
}

export default function PostPicker({ projectUuid, selectedUuids, onSelectionChange, excludeUuids = [] }: PostPickerProps) {
  const { t } = useTranslation()
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null)
  const [searchTerm, setSerachTerm] = useState("")

  const { posts, isLoading, isLoadingMore, hasMore, listMore } = useListPaginatedPosts({
    projectUuid,
    platform: platformFilter,
    searchTerm: searchTerm || undefined,
  })

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useInfiniteScroll(scrollContainerRef, hasMore, isLoadingMore, listMore)

  const handleToggle = (uuid: string) => {
    if (selectedUuids.includes(uuid)) {
      onSelectionChange(selectedUuids.filter((id) => id !== uuid))
    } else {
      onSelectionChange([...selectedUuids, uuid])
    }
  }

  const items = posts.filter((p) => !excludeUuids.includes(p.uuid))

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <ContentsPlatformFilter
        projectUuid={projectUuid}
        platformFilter={platformFilter}
        onPlatformChange={setPlatformFilter}
      />

      <SearchBar setDebouncedSearchTerm={setSerachTerm} />

      {/* Posts list */}
      <div ref={scrollContainerRef} className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto scrollbar-none">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <Shimmer key={i} width="w-full" height="h-10" radius="rounded-md" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-body-xs text-muted-2 py-4 text-center">{t("contents:noPosts")}</p>
        ) : (
          <>
            {items.map((item) => (
              <PostTile
                key={item.uuid}
                post={item}
                isSelected={selectedUuids.includes(item.uuid)}
                onSelect={() => handleToggle(item.uuid)}
              />
            ))}

            {isLoadingMore && <Shimmer width="w-full" height="h-10" radius="rounded-md" />}
          </>
        )}
      </div>
    </div>
  )
}
