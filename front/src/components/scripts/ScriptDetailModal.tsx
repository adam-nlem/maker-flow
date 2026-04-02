import { useNavigate } from "react-router-dom";
import { scriptsPath } from "~/routes/routePaths";
import type { Script } from "~/models/Script";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { useScriptGenerationStore } from "~/stores/scripts/scriptGenerationStore";
import ModalOverlay from "~/components/ui/ModalOverlay";
import ScriptEditorPanel from "./ScriptEditorPanel";

interface ScriptDetailModalProps {
    script: Script | null;
    projectUuid: string;
    onClose: () => void;
}

export default function ScriptDetailModal({ script, projectUuid, onClose }: ScriptDetailModalProps) {
    const navigate = useNavigate();
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);
    const setFocusedGenerationUuid = useScriptGenerationStore((s) => s.setFocusedGenerationUuid);
    const focusedGenerationUuid = useScriptGenerationStore((s) => s.focusedGenerationUuid);

    if (!script) return null;

    const handleOpenEditor = () => {
        const generationUuid = focusedGenerationUuid;
        setFocusedScriptUuid(script.uuid); // clears focusedGenerationUuid internally
        setFocusedGenerationUuid(generationUuid); // restore the selected generation
        navigate(scriptsPath);
        onClose();
    };

    return (
        <ModalOverlay isOpen={!!script} onClose={onClose}>
            <div className="flex-1 min-h-0 overflow-hidden">
                <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} isReadOnly onOpenEditor={handleOpenEditor} />
            </div>
        </ModalOverlay>
    );
}
