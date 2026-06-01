import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import FilterChip from "~/components/ui/FilterChip";
import SearchBar from "~/components/ui/SearchBar";
import Shimmer from "~/components/ui/Shimmer";
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import type { Script } from "~/models/Script";
import { ScriptStatus, scriptStatusTranslationKeys } from "~/models/enums/ScriptStatus";
import ScriptPickerItem from "./ScriptPickerItem";

interface ScriptPickerProps {
    projectUuid: string;
    selectedUuid: string | null;
    onSelect: (script: Script) => void;
}

export default function ScriptPicker({ projectUuid, selectedUuid, onSelect }: ScriptPickerProps) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<ScriptStatus | null>(null);

    const { scripts, isLoading, isLoadingMore, hasMore, listMore } = useListPaginatedScripts({
        projectUuid,
        status: statusFilter ?? undefined,
        searchTerm: searchTerm || undefined,
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollRef, hasMore, isLoadingMore, listMore);

    const isFiltered = statusFilter !== null || searchTerm.trim() !== "";

    return (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
            <SearchBar
                placeholder={t("scripts:picker.searchPlaceholder")}
                setDebouncedSearchTerm={setSearchTerm}
                focusShortcut={{ key: "f", label: "F" }}
            />

            <div className="flex flex-wrap gap-1">
                <FilterChip
                    label={t("scripts:picker.statusAll")}
                    isSelected={statusFilter === null}
                    onClick={() => setStatusFilter(null)}
                />
                {Object.values(ScriptStatus).map((status) => (
                    <FilterChip
                        key={status}
                        label={t(scriptStatusTranslationKeys[status])}
                        isSelected={statusFilter === status}
                        onClick={() => setStatusFilter(status)}
                    />
                ))}
            </div>

            <div ref={scrollRef} className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto scrollbar-none">
                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        {[...Array(5)].map((_, i) => (
                            <Shimmer key={i} width="w-full" height="h-12" radius="rounded-md" />
                        ))}
                    </div>
                ) : scripts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                        <h3 className="text-heading-sm text-dark">
                            {isFiltered ? t("scripts:picker.noResults.title") : t("scripts:picker.empty.title")}
                        </h3>
                        <p className="text-body-sm text-muted-2">
                            {isFiltered ? t("scripts:picker.noResults.subtitle") : t("scripts:picker.empty.subtitle")}
                        </p>
                    </div>
                ) : (
                    <>
                        {scripts.map((script) => (
                            <ScriptPickerItem
                                key={script.uuid}
                                script={script}
                                isSelected={script.uuid === selectedUuid}
                                onClick={() => onSelect(script)}
                            />
                        ))}

                        {isLoadingMore && <Shimmer width="w-full" height="h-12" radius="rounded-md" />}
                    </>
                )}
            </div>
        </div>
    );
}
