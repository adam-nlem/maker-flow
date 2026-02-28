import Pill from "~/components/ui/Pill";
import { useListScriptGenerations } from "~/hooks/api/scriptGenerations/useListScriptGenerations";
import { ScriptGenerationStatus, scriptGenerationStatusToBgClass, scriptGenerationStatusToBorderClass, scriptGenerationStatusToIcon } from "~/models/enums/ScriptGenerationStatus";

interface GenerationHistoryBarProps {
    scriptUuid: string;
    selectedGenerationUuid: string | undefined;
    onSelectGeneration: (generationUuid: string | undefined) => void;
}

const statusToDotClass: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "bg-yellow",
    [ScriptGenerationStatus.Processing]: "bg-blue animate-pulse",
    [ScriptGenerationStatus.Completed]: "bg-green",
    [ScriptGenerationStatus.Failed]: "bg-red",
};

export default function GenerationHistoryBar({ scriptUuid, selectedGenerationUuid, onSelectGeneration }: GenerationHistoryBarProps) {
    const { generations } = useListScriptGenerations({ scriptUuid });

    if (generations.length === 0) return null;

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
                    isSelected={selectedGenerationUuid === gen.uuid}
                    bgColorClassName={scriptGenerationStatusToBgClass[gen.status]}
                    borderColorClassName={scriptGenerationStatusToBorderClass[gen.status]}
                    onClick={() => onSelectGeneration(gen.uuid)}
                />
            ))}
        </div>
    );
}
