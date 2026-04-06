import { useMemo } from "react"
import { useListScriptGenerations } from "./useListScriptGenerations"
import { ScriptGenerationStatus } from "~/models/enums/ScriptGenerationStatus"

interface UseLatestScriptGenerationParams {
    scriptUuid: string
}

export function useLatestScriptGeneration({ scriptUuid }: UseLatestScriptGenerationParams) {
    const { generations, isLoading } = useListScriptGenerations({ scriptUuid })

    const inProgressGeneration = useMemo(() =>
        generations.find(
            (g) => g.status === ScriptGenerationStatus.Pending || g.status === ScriptGenerationStatus.Processing,
        ) ?? null,
        [generations],
    )

    const latestCompletedGeneration = useMemo(() =>
        generations.find((g) => g.status === ScriptGenerationStatus.Completed) ?? null,
        [generations],
    )

    return { inProgressGeneration, latestCompletedGeneration, isLoading }
}
