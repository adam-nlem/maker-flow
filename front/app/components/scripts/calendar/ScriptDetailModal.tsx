import type { Script } from "~/models/Script";
import ModalOverlay from "~/components/ui/ModalOverlay";
import ScriptEditorPanel from "../ScriptEditorPanel";

interface ScriptDetailModalProps {
    script: Script | null;
    projectUuid: string;
    onClose: () => void;
}

export default function ScriptDetailModal({ script, projectUuid, onClose }: ScriptDetailModalProps) {
    if (!script) return null;

    return (
        <ModalOverlay isOpen={!!script} onClose={onClose} className="justify-center items-center">
            <div
                className="border rounded-xl border-light-gray w-[700px] max-h-[85vh] flex flex-col shadow-lg bg-clear overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} />
            </div>
        </ModalOverlay>
    );
}
