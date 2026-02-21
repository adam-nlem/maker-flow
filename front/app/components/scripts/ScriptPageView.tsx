import { useEffect } from "react";
import { useListScripts } from "~/hooks/api/scripts/useListScripts";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import ScriptListPanel from "./ScriptListPanel";
import ScriptEditorPanel from "./ScriptEditorPanel";

interface Props {
    projectUuid: string;
}

export default function ScriptPageView({ projectUuid }: Props) {
    const { scripts } = useListScripts({ projectUuid });
    const focusedScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);

    // Auto-select first script if none is selected or the stored UUID is no longer in the list
    useEffect(() => {
        if (scripts.length === 0) return;
        const isValid = scripts.some((s) => s.uuid === focusedScriptUuid);
        if (!isValid) setFocusedScriptUuid(scripts[0].uuid);
    }, [scripts, focusedScriptUuid, setFocusedScriptUuid]);

    const focusedScript = scripts.find((s) => s.uuid === focusedScriptUuid) ?? null;

    return (
        <div className="flex flex-row h-screen overflow-hidden">
            <ScriptListPanel scripts={scripts} projectUuid={projectUuid} />

            <div className="flex-1 overflow-hidden">
                {focusedScript ? (
                    <ScriptEditorPanel key={focusedScript.uuid} script={focusedScript} projectUuid={projectUuid} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray">
                        <p className="text-body-md">Sélectionnez ou créez un script.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
