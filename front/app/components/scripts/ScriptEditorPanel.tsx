import type { Script } from "~/models/Script";
import ScriptMetaHeader from "./ScriptMetaHeader";
import ScriptPartsList from "./parts/ScriptPartsList";
import { useListScriptParts } from "~/hooks/api/scripts/useListScriptParts";
import Shimmer from "~/components/ui/Shimmer";

interface ScriptEditorPanelProps {
    script: Script;
    projectUuid: string;
}

export default function ScriptEditorPanel({ script, projectUuid }: ScriptEditorPanelProps) {
    const { parts, isLoading } = useListScriptParts({ scriptUuid: script.uuid });

    return (
        <div className="flex-1 h-full flex flex-col overflow-hidden">
            <ScriptMetaHeader script={script} projectUuid={projectUuid} />

            {isLoading ? (
                <div className="flex flex-col gap-3 px-6 py-4">
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-16" width="w-full" />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">

                    <ScriptPartsList parts={parts} script={script} />
                </div>
            )}
        </div>
    );
}
