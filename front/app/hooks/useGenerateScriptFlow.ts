import { useState, useEffect } from "react"

import { useCreateScript } from "~/hooks/api/scripts/useCreateScript"
import { useCreateScriptGeneration } from "~/hooks/api/scriptGenerations/useCreateScriptGeneration"
import { useShowScriptGeneration } from "~/hooks/api/scriptGenerations/useShowScriptGeneration"
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts"
import { GenerateScriptPhase } from "~/models/enums/GenerateScriptPhase"
import { ScriptGenerationStatus } from "~/models/enums/ScriptGenerationStatus"
import type { ScriptBriefValues } from "~/components/scripts/generation/ScriptBriefForm"

const GENERATING_MESSAGES = [
    "Analyse du sujet...",
    "Structure du script...",
    "Rédaction du hook...",
    "Développement des parties...",
    "Ajout des détails...",
    "Finalisation...",
]

interface UseGenerateScriptFlowParams {
    projectUuid: string
    initialScriptUuid: string | null
}

export function useGenerateScriptFlow({ projectUuid, initialScriptUuid }: UseGenerateScriptFlowParams) {
    const [phase, setPhase] = useState(GenerateScriptPhase.Brief)
    const [scriptUuid, setScriptUuid] = useState<string | null>(initialScriptUuid)
    const [generationUuid, setGenerationUuid] = useState<string | null>(null)
    const [messageIndex, setMessageIndex] = useState(0)

    const { createScript, isPending: isCreatingScript } = useCreateScript()
    const { createScriptGeneration, isPending: isCreatingGeneration } = useCreateScriptGeneration()
    const { generation } = useShowScriptGeneration({ generationUuid, scriptUuid: scriptUuid ?? "" })
    const { scripts } = useListPaginatedScripts({ projectUuid, limit: 1 })

    const isPending = isCreatingScript || isCreatingGeneration
    const script = scripts.find((s) => s.uuid === scriptUuid) ?? scripts[0] ?? null
    const isFailed = generation?.status === ScriptGenerationStatus.Failed

    // Recover scriptUuid on reload from fetched scripts
    useEffect(() => {
        if (!scriptUuid && script) {
            setScriptUuid(script.uuid)
        }
    }, [scriptUuid, script])

    // Rotate generating messages
    useEffect(() => {
        if (phase !== GenerateScriptPhase.Generating) return
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % GENERATING_MESSAGES.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [phase])

    // Transition to preview when generation completes
    useEffect(() => {
        if (generation?.status === ScriptGenerationStatus.Completed) {
            setPhase(GenerateScriptPhase.Preview)
        }
    }, [generation?.status])

    const handleBriefSubmit = async (values: ScriptBriefValues) => {
        let effectiveScriptUuid = scriptUuid

        if (!effectiveScriptUuid) {
            const newScript = await createScript({ projectUuid, title: values.topic })
            effectiveScriptUuid = newScript.uuid
            setScriptUuid(effectiveScriptUuid)
        }

        const gen = await createScriptGeneration({
            scriptUuid: effectiveScriptUuid,
            topic: values.topic,
            goal: values.goal,
            keyPoints: values.keyPoints || undefined,
            openingStyle: values.openingStyle,
            duration: values.duration,
            extraContext: values.extraContext || undefined,
            activeSkills: [],
            skillInputs: {},
            aiModel: values.aiModel,
        })
        setGenerationUuid(gen.uuid)
        setPhase(GenerateScriptPhase.Generating)
    }

    return {
        phase,
        script,
        isPending,
        isFailed,
        messageIndex,
        handleBriefSubmit,
    }
}
