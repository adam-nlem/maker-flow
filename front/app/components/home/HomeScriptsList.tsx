import { useEffect, useRef, useState } from "react"
import Pill from "~/components/ui/Pill"
import Shimmer from "~/components/ui/Shimmer"
import ScriptCard from "~/components/scripts/ScriptCard"
import ScriptDetailModal from "~/components/scripts/ScriptDetailModal"
import type { Script } from "~/models/Script"
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts"
import { scriptStatusOptions, scriptStatusToBgClass, scriptStatusToBorderClass, scriptStatusToFrenchTranslation, scriptStatusToIcon, scriptStatusToTextClass } from "~/models/enums/ScriptStatus"
import { useScriptFilterStore } from "~/stores/scripts/scriptFilterStore"

interface HomeScriptsListProps {
    projectUuid: string
}

export default function HomeScriptsList({ projectUuid }: HomeScriptsListProps) {
    const focusedScriptStatus = useScriptFilterStore((state) => state.focusedScriptStatus)
    const setFocusedScriptStatus = useScriptFilterStore((state) => state.setFocusedScriptStatus)
    const [selectedScript, setSelectedScript] = useState<Script | null>(null)

    const { scripts, isLoading, isLoadingMore, hasMore, listMore } = useListPaginatedScripts({
        projectUuid,
        status: focusedScriptStatus,
        limit: 10,
    })

    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    listMore()
                }
            },
            { rootMargin: "0px 200px 0px 0px" },
        )

        observer.observe(sentinel)

        return () => {
            observer.disconnect()
        }
    }, [hasMore, isLoadingMore, listMore])

    return (
        <div className="flex flex-col gap-3 h-35">
            <div className="flex flex-row gap-2 flex-wrap">
                {scriptStatusOptions.map((status) => (
                    <Pill
                        key={status}
                        icon={scriptStatusToIcon[status]}
                        label={scriptStatusToFrenchTranslation[status]}
                        isSelected={status === focusedScriptStatus}
                        onClick={() => setFocusedScriptStatus(status)}
                        bgColorClassName={scriptStatusToBgClass[status]}
                        borderColorClassName={scriptStatusToBorderClass[status]}
                        textColorClassName={scriptStatusToTextClass[status]}
                    />
                ))}
            </div>

            {isLoading ? <div className="flex flex-row gap-2 overflow-x-auto scrollbar-none">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="border border-light-gray rounded-xl p-2.5 w-44">
                        <Shimmer width="w-full" height="h-3" />
                        <div className="flex flex-row gap-1 mt-1.5">
                            <Shimmer width="w-3" height="h-3" radius="rounded-sm" />
                            <Shimmer width="w-3" height="h-3" radius="rounded-sm" />
                        </div>
                    </div>
                ))}
            </div> :
                scripts.length === 0 ? (
                    <p className="text-body-sm text-medium-gray">Aucun script trouvé pour ce statut.</p>
                ) : (
                    <div className="flex flex-row gap-2 overflow-x-auto scrollbar-none flex-1 min-h-0">
                        {scripts.map((script) => (
                            <ScriptCard
                                key={script.uuid}
                                script={script}
                                isSelected={false}
                                onClick={() => setSelectedScript(script)}
                            />
                        ))}
                        <div ref={sentinelRef} className="w-1 shrink-0" />
                    </div>
                )
            }
            <ScriptDetailModal script={selectedScript} projectUuid={projectUuid} onClose={() => setSelectedScript(null)} />
        </div>
    )
}
