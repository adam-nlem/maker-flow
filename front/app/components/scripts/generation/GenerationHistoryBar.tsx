import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Pill from "~/components/ui/Pill";
import { useListScriptGenerations } from "~/hooks/api/scriptGenerations/useListScriptGenerations";
import { useDeleteScriptGeneration } from "~/hooks/api/scriptGenerations/useDeleteScriptGeneration";
import { ScriptGenerationStatus, scriptGenerationStatusToBgClass, scriptGenerationStatusToBorderClass, scriptGenerationStatusToIcon } from "~/models/enums/ScriptGenerationStatus";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { aiModelToFrenchTranslation } from "~/models/enums/AiModel";
import { formatToFrenchRelative, formatToNumericDate } from "~/utils/dateFormatters";

interface GenerationHistoryBarProps {
    scriptUuid: string;
    selectedGenerationUuid: string | undefined;
    onSelectGeneration: (generationUuid: string | undefined) => void;
}

export default function GenerationHistoryBar({ scriptUuid, selectedGenerationUuid, onSelectGeneration }: GenerationHistoryBarProps) {
    const { generations, hasMore, isLoadingMore, listMore } = useListScriptGenerations({ scriptUuid });
    const { deleteScriptGeneration } = useDeleteScriptGeneration();
    const [pendingDeleteUuid, setPendingDeleteUuid] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = containerRef.current;
        if (!sentinel || !container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    listMore();
                }
            },
            { root: container, rootMargin: "0px 200px 0px 0px" },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoadingMore, listMore]);

    if (generations.length === 0) return null;

    const handleConfirmDelete = async () => {
        if (!pendingDeleteUuid) return;
        if (selectedGenerationUuid === pendingDeleteUuid) {
            onSelectGeneration(undefined);
        }
        await deleteScriptGeneration({ generationUuid: pendingDeleteUuid, scriptUuid });
        setPendingDeleteUuid(null);
    };

    return (
        <>
            <div ref={containerRef} className="flex flex-row items-center gap-2 px-6 py-2 border-b border-light-gray overflow-x-auto scrollbar-none">
                <Pill
                    label="Manuel"
                    isSelected={selectedGenerationUuid === undefined}
                    bgColorClassName="bg-primary/10"
                    borderColorClassName="border border-primary/30"
                    onClick={() => onSelectGeneration(undefined)}
                />
                {generations.map((gen) => (
                    <Pill
                        key={gen.uuid}
                        label={`${aiModelToFrenchTranslation[gen.aiModel]} - ${formatToFrenchRelative(gen.createdAt)}`}
                        icon={scriptGenerationStatusToIcon[gen.status]}
                        suffixIcon={gen.status !== ScriptGenerationStatus.Pending && gen.status !== ScriptGenerationStatus.Processing ? XMarkIcon : undefined}
                        isSelected={selectedGenerationUuid === gen.uuid}
                        bgColorClassName={scriptGenerationStatusToBgClass[gen.status]}
                        borderColorClassName={scriptGenerationStatusToBorderClass[gen.status]}
                        onClick={() => onSelectGeneration(gen.uuid)}
                        onSuffixClick={() => setPendingDeleteUuid(gen.uuid)}
                    />
                ))}
                <div ref={sentinelRef} className="w-1 shrink-0" />
            </div>

            <ConfirmDeleteDialog
                isOpen={!!pendingDeleteUuid}
                onClose={() => setPendingDeleteUuid(null)}
                onConfirm={handleConfirmDelete}
                message="Êtes-vous sûr de vouloir supprimer cette génération ? Cette action est irréversible."
            />
        </>
    );
}
