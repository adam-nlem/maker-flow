import { DocumentTextIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useShowScriptVersion } from "~/hooks/api/scriptVersions/useShowScriptVersion";
import { useUpdateScriptVersion } from "~/hooks/api/scriptVersions/useUpdateScriptVersion";
import { ScriptVersionStatus } from "~/models/enums/ScriptVersionStatus";

interface ScriptVersionBadgeProps {
    versionUuid: string;
    scriptUuid: string;
}

export default function ScriptVersionBadge({ versionUuid, scriptUuid }: ScriptVersionBadgeProps) {
    const { scriptVersion } = useShowScriptVersion({ versionUuid });
    const { updateScriptVersion, isPending } = useUpdateScriptVersion();

    if (!scriptVersion) return null;

    const handleAccept = async () => {
        await updateScriptVersion({ versionUuid, scriptUuid, status: ScriptVersionStatus.Accepted });
    };

    const handleReject = async () => {
        await updateScriptVersion({ versionUuid, scriptUuid, status: ScriptVersionStatus.Rejected });
    };

    return (
        <div className="flex flex-row items-center gap-2 mt-2 px-3 py-2 rounded-xl border border-light-gray">
            <DocumentTextIcon className="size-4 text-primary shrink-0" strokeWidth={2} />
            <span className="text-heading-xs flex-1">Nouvelle version</span>

            {scriptVersion.status === ScriptVersionStatus.Draft && (
                <div className={`flex flex-row items-center gap-3 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
                    <SimpleTextButton onClick={handleAccept} color="text-green" hoverColor="hover:text-green">
                        Accepter
                    </SimpleTextButton>
                    <SimpleTextButton onClick={handleReject} color="text-danger" hoverColor="hover:text-danger">
                        Rejeter
                    </SimpleTextButton>
                </div>
            )}

            {scriptVersion.status === ScriptVersionStatus.Accepted && (
                <div className="flex flex-row items-center gap-1">
                    <CheckCircleIcon className="size-3.5 text-green" strokeWidth={2} />
                    <span className="text-body-xs text-green">Accepté</span>
                </div>
            )}

            {scriptVersion.status === ScriptVersionStatus.Rejected && (
                <div className="flex flex-row items-center gap-1">
                    <XCircleIcon className="size-3.5 text-danger" strokeWidth={2} />
                    <span className="text-body-xs text-danger">Rejeté</span>
                </div>
            )}
        </div>
    );
}
