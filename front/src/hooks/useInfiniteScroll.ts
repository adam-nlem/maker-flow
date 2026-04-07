import { useEffect } from "react"
import type { RefObject } from "react"

interface UseInfiniteScrollOptions {
    /** Direction of the scrollable container. Defaults to "vertical". */
    direction?: "vertical" | "horizontal"
}

/**
 * Listens to scroll events on a container and calls `listMore` when near the end.
 */
export function useInfiniteScroll(
    containerRef: RefObject<HTMLElement | null>,
    hasMore: boolean,
    isLoadingMore: boolean,
    listMore: () => void,
    options?: UseInfiniteScrollOptions,
): void {
    const { direction = "vertical" } = options ?? {}

    useEffect(() => {
        const element = containerRef.current
        if (!element) return

        const handleScroll = () => {
            if (!hasMore || isLoadingMore) return
            if (!element.clientHeight && !element.clientWidth) return

            const isNearEnd = direction === "vertical"
                ? Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight - 200
                : Math.ceil(element.scrollLeft + element.clientWidth) >= element.scrollWidth - 200

            if (isNearEnd) {
                listMore()
            }
        }

        handleScroll()

        element.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            element.removeEventListener("scroll", handleScroll)
        }
    })
}
