import { useNavigate } from "react-router-dom";
import { scriptsPath } from "~/routes/routePaths";
import type { Script } from "~/models/Script";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
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

    if (!script) return null;

    const handleOpenEditor = () => {
        setFocusedScriptUuid(script.uuid);
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
