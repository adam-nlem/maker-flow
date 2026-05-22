import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import FilterChip from "~/components/ui/FilterChip";
import SearchBar from "~/components/ui/SearchBar";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { useListPaginatedReviews } from "~/hooks/api/reviews/useListPaginatedReviews";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { useReviewFilterStore } from "~/stores/reviews/reviewFilterStore";
import { ReviewStatus, reviewStatusTranslationKeys } from "~/models/enums/ReviewStatus";
import ReviewTile from "./ReviewTile";

interface ReviewsListProps {
    projectUuid: string;
    /**
     * When provided, the empty state shows a primary CTA button. Agency-only
     * surfaces pass an `openCreatePanel` callback; the client surface omits it.
     */
    onCreateReview?: () => void;
}

export default function ReviewsList({ projectUuid, onCreateReview }: ReviewsListProps) {
    const { t } = useTranslation();

    const selectedReviewUuid = useReviewsStore((s) => s.selectedReviewUuid);
    const selectReview = useReviewsStore((s) => s.selectReview);

    const selectedStatus = useReviewFilterStore((s) => s.selectedStatus);
    const searchTerm = useReviewFilterStore((s) => s.searchTerm);
    const setSelectedStatus = useReviewFilterStore((s) => s.setSelectedStatus);
    const setSearchTerm = useReviewFilterStore((s) => s.setSearchTerm);

    const { reviews, isLoading, isLoadingMore, hasMore, listMore } = useListPaginatedReviews({
        projectUuid,
        status: selectedStatus ?? undefined,
        searchTerm: searchTerm || undefined,
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollRef, hasMore, isLoadingMore, listMore);

    const isFiltered = selectedStatus !== null || searchTerm.trim() !== "";

    return (
        <div className="flex flex-col h-full">
            <div className="px-3 pt-3 pb-2">
                <SearchBar
                    placeholder={t("reviews:search.placeholder")}
                    setDebouncedSearchTerm={setSearchTerm}
                    focusShortcut={{ key: "f", label: "F" }}
                />
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-1">
                <FilterChip
                    label={t("reviews:filters.all")}
                    isSelected={selectedStatus === null}
                    onClick={() => setSelectedStatus(null)}
                />
                {Object.values(ReviewStatus).map((status) => (
                    <FilterChip
                        key={status}
                        label={t(reviewStatusTranslationKeys[status])}
                        isSelected={selectedStatus === status}
                        onClick={() => setSelectedStatus(status)}
                    />
                ))}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none px-3 pb-3 flex flex-col gap-1">
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && reviews.length === 0 && !isFiltered && (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <h3 className="text-heading-md text-dark">{t("reviews:emptyState.title")}</h3>
                        <p className="text-body-sm text-muted-2">{t("reviews:emptyState.subtitle")}</p>
                        {onCreateReview && (
                            <Button type="button" style="primary" width="w-auto" onClick={onCreateReview}>
                                {t("reviews:emptyState.cta")}
                            </Button>
                        )}
                    </div>
                )}

                {!isLoading && reviews.length === 0 && isFiltered && (
                    <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                        <h3 className="text-heading-md text-dark">{t("reviews:emptyState.noResults.title")}</h3>
                        <p className="text-body-sm text-muted-2">{t("reviews:emptyState.noResults.subtitle")}</p>
                    </div>
                )}

                {reviews.map((reviewDTO) => (
                    <ReviewTile
                        key={reviewDTO.review.uuid}
                        reviewDTO={reviewDTO}
                        isSelected={selectedReviewUuid === reviewDTO.review.uuid}
                        onSelect={() => selectReview(reviewDTO.review.uuid)}
                    />
                ))}

                {isLoadingMore && (
                    <div className="flex items-center justify-center py-4">
                        <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
