import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import FilterChip from "~/components/ui/FilterChip";
import SearchBar from "~/components/ui/SearchBar";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { useListPaginatedPostDrafts } from "~/hooks/api/postDrafts/useListPaginatedPostDrafts";
import { usePostDraftsStore } from "~/stores/postDrafts/postDraftsStore";
import { usePostDraftFilterStore } from "~/stores/postDrafts/postDraftFilterStore";
import { PostDraftStatus, postDraftStatusTranslationKeys } from "~/models/enums/PostDraftStatus";
import PostDraftListItem from "./PostDraftListItem";

interface PostDraftsListProps {
    projectUuid: string;
}

export default function PostDraftsList({ projectUuid }: PostDraftsListProps) {
    const { t } = useTranslation();

    const selectedDraftUuid = usePostDraftsStore((s) => s.selectedDraftUuid);
    const selectDraft = usePostDraftsStore((s) => s.selectDraft);
    const openCreatePanel = usePostDraftsStore((s) => s.openCreatePanel);

    const selectedStatus = usePostDraftFilterStore((s) => s.selectedStatus);
    const searchTerm = usePostDraftFilterStore((s) => s.searchTerm);
    const setSelectedStatus = usePostDraftFilterStore((s) => s.setSelectedStatus);
    const setSearchTerm = usePostDraftFilterStore((s) => s.setSearchTerm);

    const { postDrafts, isLoading, isLoadingMore, hasMore, listMore } = useListPaginatedPostDrafts({
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
                    placeholder={t("postDrafts:search.placeholder")}
                    setDebouncedSearchTerm={setSearchTerm}
                    focusShortcut={{ key: "f", label: "F" }}
                />
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-1">
                <FilterChip
                    label={t("postDrafts:filters.all")}
                    isSelected={selectedStatus === null}
                    onClick={() => setSelectedStatus(null)}
                />
                {Object.values(PostDraftStatus).map((status) => (
                    <FilterChip
                        key={status}
                        label={t(postDraftStatusTranslationKeys[status])}
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

                {!isLoading && postDrafts.length === 0 && !isFiltered && (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <h3 className="text-heading-md text-dark">{t("postDrafts:emptyState.title")}</h3>
                        <p className="text-body-sm text-muted-2">{t("postDrafts:emptyState.subtitle")}</p>
                        <Button type="button" style="primary" width="w-auto" onClick={openCreatePanel}>
                            {t("postDrafts:emptyState.cta")}
                        </Button>
                    </div>
                )}

                {!isLoading && postDrafts.length === 0 && isFiltered && (
                    <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                        <h3 className="text-heading-md text-dark">{t("postDrafts:emptyState.noResults.title")}</h3>
                        <p className="text-body-sm text-muted-2">{t("postDrafts:emptyState.noResults.subtitle")}</p>
                    </div>
                )}

                {postDrafts.map((postDraft) => (
                    <PostDraftListItem
                        key={postDraft.uuid}
                        postDraft={postDraft}
                        isSelected={selectedDraftUuid === postDraft.uuid}
                        onSelect={() => selectDraft(postDraft.uuid)}
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

