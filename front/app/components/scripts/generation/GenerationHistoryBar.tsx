import { XMarkIcon } from "@heroicons/react/24/outline";
import Pill from "~/components/ui/Pill";
import { useListScriptGenerations } from "~/hooks/api/scriptGenerations/useListScriptGenerations";
import { useDeleteScriptGeneration } from "~/hooks/api/scriptGenerations/useDeleteScriptGeneration";
import { ScriptGenerationStatus, scriptGenerationStatusToBgClass, scriptGenerationStatusToBorderClass, scriptGenerationStatusToIcon } from "~/models/enums/ScriptGenerationStatus";

interface GenerationHistoryBarProps {
    scriptUuid: string;
    selectedGenerationUuid: string | undefined;
    onSelectGeneration: (generationUuid: string | undefined) => void;
}

export default function GenerationHistoryBar({ scriptUuid, selectedGenerationUuid, onSelectGeneration }: GenerationHistoryBarProps) {
    const { generations } = useListScriptGenerations({ scriptUuid });
    const { deleteScriptGeneration } = useDeleteScriptGeneration();

    if (generations.length === 0) return null;

    const handleDelete = async (generationUuid: string) => {
        if (selectedGenerationUuid === generationUuid) {
            onSelectGeneration(undefined);
        }
        await deleteScriptGeneration({ generationUuid, scriptUuid });
    };

    return (
        <div className="flex flex-row items-center gap-2 px-6 py-2 border-b border-light-gray overflow-x-auto scrollbar-none">
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
                    label={gen.topic.length > 20 ? gen.topic.substring(0, 20) + '...' : gen.topic}
                    icon={scriptGenerationStatusToIcon[gen.status]}
                    suffixIcon={gen.status !== ScriptGenerationStatus.Pending && gen.status !== ScriptGenerationStatus.Processing ? XMarkIcon : undefined}
                    isSelected={selectedGenerationUuid === gen.uuid}
                    bgColorClassName={scriptGenerationStatusToBgClass[gen.status]}
                    borderColorClassName={scriptGenerationStatusToBorderClass[gen.status]}
                    onClick={() => onSelectGeneration(gen.uuid)}
                    onSuffixClick={() => handleDelete(gen.uuid)}
                />
            ))}
        </div>
    );
}
