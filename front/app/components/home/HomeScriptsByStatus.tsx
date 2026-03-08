import { useNavigate } from "react-router"
import Shimmer from "~/components/ui/Shimmer"
import { useListScriptsByStatus } from "~/hooks/api/scripts/useListScriptsByStatus"
import type { Script } from "~/models/Script"
import { colorToBgClass } from "~/models/enums/Color"
import type { Platform } from "~/models/enums/Platform"
import { platformToIcon } from "~/models/enums/Platform"
import { scriptStatusToBgClass, scriptStatusToBorderClass, scriptStatusToFrenchTranslation, scriptStatusToIcon, scriptStatusToTextClass } from "~/models/enums/ScriptStatus"
import type { ScriptsGroupedByStatusDTO } from "~/dtos/scripts/ScriptsGroupedByStatusDTO"
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore"
import ScriptListItem from "../scripts/ScriptListItem"

interface HomeScriptsByStatusProps {
    projectUuid: string
}

export default function HomeScriptsByStatus({ projectUuid }: HomeScriptsByStatusProps) {
    const { scriptsByStatus, isLoading } = useListScriptsByStatus({ projectUuid })
    const navigate = useNavigate()
    const setFocusedScriptUuid = useFocusScriptStore((state) => state.setFocusedScriptUuid)

    const handleScriptClick = (scriptUuid: string) => {
        setFocusedScriptUuid(scriptUuid)
        navigate("/scripts")
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <Shimmer width="w-24" height="h-4" />
                        <div className="flex flex-row gap-2">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex-1 border border-light-gray rounded-lg p-2">
                                    <Shimmer width="w-full" height="h-3" />
                                    <div className="flex flex-row gap-1 mt-1">
                                        <Shimmer width="w-3" height="h-3" radius="rounded-sm" />
                                        <Shimmer width="w-3" height="h-3" radius="rounded-sm" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (scriptsByStatus.length === 0) {
        return <p className="text-body-sm text-medium-gray">Aucun script trouvé.</p>
    }

    return (
        <div className="flex flex-col gap-4">
            {scriptsByStatus.map((group) => {
                const StatusIcon = scriptStatusToIcon[group.status]
                return (

                    <div className="flex flex-col gap-2" >
                        <div className={`flex flex-row items-center gap-1.5 p-1 rounded ${scriptStatusToBorderClass[group.status]} ${scriptStatusToBgClass[group.status]}`}>
                            <StatusIcon className={`size-4 ${scriptStatusToTextClass[group.status]}`} strokeWidth={2} />
                            <h3 className={`text-heading-xs ${scriptStatusToTextClass[group.status]}`}>
                                {scriptStatusToFrenchTranslation[group.status]}
                            </h3>
                        </div>
                        <div className="flex flex-row gap-2">
                            {group.scripts.map((script) => (
                                <ScriptListItem
                                    isSelected={false}
                                    key={script.uuid}
                                    script={script}
                                    onClick={() => handleScriptClick(script.uuid)}
                                />
                            ))}
                        </div>
                    </div>
                )
            }
            )
            }
        </div >
    )
}
