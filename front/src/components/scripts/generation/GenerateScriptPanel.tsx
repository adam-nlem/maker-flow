import { useRef, useState } from "react"
import { SparklesIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { settingsCreatorProfilePath } from "~/routes/routePaths"
import { Button } from "~/components/ui/Button"
import { SidePanel } from "~/components/ui/SidePanel"
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog"
import ScriptBriefForm, { type ScriptBriefValues } from "./ScriptBriefForm"
import SkillModuleToggles from "./SkillModuleToggles"
import { useCreateScriptGeneration } from "~/hooks/api/scriptGenerations/useCreateScriptGeneration"
import { useUpdateScriptGeneration } from "~/hooks/api/scriptGenerations/useUpdateScriptGeneration"
import { useShowScriptGeneration } from "~/hooks/api/scriptGenerations/useShowScriptGeneration"
import { useScriptGenerationStore } from "~/stores/scripts/scriptGenerationStore"
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore"
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel"
import type { SkillModule } from "~/models/enums/SkillModule"

interface GenerateScriptPanelProps {
    scriptUuid: string
    projectUuid: string
}

export default function GenerateScriptPanel({ scriptUuid }: GenerateScriptPanelProps) {
    const navigate = useNavigate()
    const focusedGenerationUuid = useScriptGenerationStore((s) => s.focusedGenerationUuid)
    const { generation: focusedGeneration } = useShowScriptGeneration({ generationUuid: focusedGenerationUuid ?? null, scriptUuid })

    const isOpen = useScriptRightPanelStore((s) => s.activePanel === ScriptRightPanel.Generate)
    const closePanel = useScriptRightPanelStore((s) => s.closePanel)

    const [callToAction, setCallToAction] = useState("")
    const [activeSkills, setActiveSkills] = useState<SkillModule[]>([])
    const [skillInputs, setSkillInputs] = useState<Record<string, string>>({})
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)

    const pendingBriefValues = useRef<ScriptBriefValues | null>(null)

    const { createScriptGeneration, isPending: isPendingCreate } = useCreateScriptGeneration()
    const { updateScriptGeneration, isPending: isPendingUpdate } = useUpdateScriptGeneration()
    const setActiveGenerationUuid = useScriptGenerationStore((s) => s.setActiveGenerationUuid)

    const isPending = isPendingCreate || isPendingUpdate

    const buildParams = (values: ScriptBriefValues) => ({
        ...values,
        keyPoints: values.keyPoints || undefined,
        extraContext: values.extraContext || undefined,
        callToAction: callToAction.trim() || undefined,
        activeSkills,
        skillInputs,
    })

    const handleBriefSubmit = async (values: ScriptBriefValues) => {
        if (focusedGenerationUuid) {
            pendingBriefValues.current = values
            setShowUpdateConfirm(true)
            return
        }

        const generation = await createScriptGeneration({ scriptUuid, ...buildParams(values) })
        setActiveGenerationUuid(generation.uuid)
        closePanel()
    }

    const handleConfirmUpdate = async () => {
        if (!focusedGenerationUuid || !pendingBriefValues.current) return

        const generation = await updateScriptGeneration({
            generationUuid: focusedGenerationUuid,
            scriptUuid,
            ...buildParams(pendingBriefValues.current),
        })
        setActiveGenerationUuid(generation.uuid)
        setShowUpdateConfirm(false)
        pendingBriefValues.current = null
        closePanel()
    }

    const briefInitialValues = focusedGeneration ? {
        topic: focusedGeneration.topic,
        goal: focusedGeneration.goal,
        keyPoints: focusedGeneration.keyPoints ?? "",
        openingStyle: focusedGeneration.openingStyle,
        duration: focusedGeneration.duration,
        extraContext: focusedGeneration.extraContext ?? "",
        aiModel: focusedGeneration.aiModel,
    } : undefined

    return (
        <>
        <SidePanel
            title="Générer avec l'IA"
            icon={SparklesIcon}
            width="w-120"
            isOpen={isOpen}
            onClose={closePanel}
            footer={
                <Button
                    type="submit"
                    style="primary"
                    isLoading={isPending}
                    disabled={isPending}
                    onClick={() => {
                        const form = document.getElementById('generate-panel-form') as HTMLFormElement
                        form?.requestSubmit()
                    }}
                >
                    <div className="flex flex-row justify-center items-center gap-2">
                        <SparklesIcon className="size-4" strokeWidth={2} />
                        <p className="text-sm">Générer le script</p>
                    </div>
                </Button>
            }
        >
            <div className="p-4">
                <div
                    onClick={() => { closePanel(); navigate(settingsCreatorProfilePath) }}
                    className="flex flex-row items-center gap-3 px-4 py-3 mb-5 rounded-xl border border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                >
                    <UserCircleIcon className="size-5 text-primary shrink-0" strokeWidth={2} />
                    <div className="flex flex-col">
                        <span className="text-heading-xs">Configurez votre profil créateur</span>
                        <span className="text-body-xs">Améliorez les résultats en ajoutant votre style et vos préférences</span>
                    </div>
                </div>

                <ScriptBriefForm
                    key={focusedGeneration?.uuid ?? "new"}
                    initialValues={briefInitialValues}
                    onSubmit={handleBriefSubmit}
                    isPending={isPending}
                    formId="generate-panel-form"
                />

                <div className="border-t border-light-gray my-5" />

                <SkillModuleToggles
                    activeSkills={activeSkills}
                    onActiveSkillsChange={setActiveSkills}
                    skillInputs={skillInputs}
                    onSkillInputsChange={setSkillInputs}
                    callToAction={callToAction}
                    onCallToActionChange={setCallToAction}
                />
            </div>
        </SidePanel>

        <ConfirmDeleteDialog
            isOpen={showUpdateConfirm}
            onClose={() => setShowUpdateConfirm(false)}
            onConfirm={handleConfirmUpdate}
            isPending={isPendingUpdate}
            message="Êtes-vous sûr de vouloir relancer cette génération ? Le script généré précédemment sera supprimé. Cette action est irréversible."
        />
        </>
    )
}
