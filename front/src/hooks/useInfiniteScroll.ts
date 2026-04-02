import { useEffect, useRef } from "react"
import type { RefObject } from "react"

interface UseInfiniteScrollOptions {
    /** Direction of the scrollable container. Defaults to "vertical". */
    direction?: "vertical" | "horizontal"
    /** When false, the observer is disconnected. Defaults to true. */
    enabled?: boolean
    /** Optional scrollable container to scope the observer to. */
    root?: RefObject<HTMLElement | null>
}

/**
 * Observes a sentinel element and calls `listMore` when it enters the viewport.
 * Returns a ref to attach to the sentinel element.
 */
export function useInfiniteScroll(
    hasMore: boolean,
    isLoadingMore: boolean,
    listMore: () => void,
    options?: UseInfiniteScrollOptions,
): RefObject<HTMLDivElement | null> {
    const sentinelRef = useRef<HTMLDivElement>(null)
    const { direction = "vertical", enabled = true, root } = options ?? {}

    useEffect(() => {
        if (!enabled) return

        const sentinel = sentinelRef.current
        if (!sentinel) return

        const rootMargin = direction === "vertical"
            ? "0px 0px 200px 0px"
            : "0px 200px 0px 0px"

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    listMore()
                }
            },
            { root: root?.current ?? null, rootMargin },
        )

        observer.observe(sentinel)

        return () => {
            observer.disconnect()
        }
    }, [hasMore, isLoadingMore, listMore, enabled, direction, root])

    return sentinelRef
}
