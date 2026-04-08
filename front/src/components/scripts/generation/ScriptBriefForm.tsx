import { useState } from "react"

import { Button } from "~/components/ui/Button"
import { TextArea } from "~/components/ui/TextArea"
import Pill from "~/components/ui/Pill"
import { type ScriptGoal, scriptGoalOptions, scriptGoalToFrenchTranslation } from "~/models/enums/ScriptGoal"
import { type OpeningStyle, openingStyleOptions, openingStyleToFrenchTranslation } from "~/models/enums/OpeningStyle"
import { type VideoDuration, videoDurationToFrenchTranslation, videoDurationOptions } from "~/models/enums/VideoDuration"
import { AiModel, aiModelOptions, aiModelToFrenchTranslation, aiModelToDescription, aiModelToIcon } from "~/models/enums/AiModel"

export interface ScriptBriefValues {
    topic: string
    goal: ScriptGoal
    keyPoints: string
    openingStyle: OpeningStyle
    duration: VideoDuration
    extraContext: string
    aiModel: AiModel
}

interface ScriptBriefFormProps {
    initialValues?: {
        topic?: string
        goal?: ScriptGoal
        keyPoints?: string
        openingStyle?: OpeningStyle
        duration?: VideoDuration
        extraContext?: string
        aiModel?: AiModel
    }
    onSubmit: (values: ScriptBriefValues) => void
    isPending?: boolean
    submitLabel?: string
    submitIcon?: React.ComponentType<{ className?: string }>
    formId?: string
    variant?: 'full' | 'onboarding'
}

export default function ScriptBriefForm({
    initialValues,
    onSubmit,
    isPending = false,
    submitLabel,
    submitIcon: SubmitIcon,
    formId,
    variant = 'full',
}: ScriptBriefFormProps) {
    const isOnboarding = variant === 'onboarding'

    const [topic, setTopic] = useState(initialValues?.topic ?? "")
    const [goal, setGoal] = useState<ScriptGoal | undefined>(initialValues?.goal)
    const [keyPoints, setKeyPoints] = useState(initialValues?.keyPoints ?? "")
    const [openingStyle, setOpeningStyle] = useState<OpeningStyle | undefined>(initialValues?.openingStyle)
    const [duration, setDuration] = useState<VideoDuration | undefined>(initialValues?.duration)
    const [extraContext, setExtraContext] = useState(initialValues?.extraContext ?? "")
    const [aiModel, setAiModel] = useState<AiModel>(initialValues?.aiModel ?? (isOnboarding ? AiModel.Claude : AiModel.Gemini))

    const canSubmit = topic.trim() !== "" && goal !== undefined && openingStyle !== undefined && duration !== undefined

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!canSubmit || !goal || !openingStyle || !duration) return

        onSubmit({
            topic: topic.trim(),
            goal,
            keyPoints: keyPoints.trim(),
            openingStyle,
            duration,
            extraContext: extraContext.trim(),
            aiModel,
        })
    }

    return (
        <form id={formId} className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {!isOnboarding && (
                <div>
                    <h3 className="text-heading-sm">Modèle IA</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {aiModelOptions.map((m) => (
                            <Pill
                                key={m}
                                imageUrl={aiModelToIcon[m]}
                                label={aiModelToFrenchTranslation[m]}
                                bgColorClassName="bg-primary/10"
                                borderColorClassName="border border-primary/30"
                                isSelected={aiModel === m}
                                onClick={() => setAiModel(m)}
                            />
                        ))}
                    </div>
                    <p className="text-body-xs text-gray-400 mt-1">{aiModelToDescription[aiModel]}</p>
                </div>
            )}

            <TextArea
                label="Sujet"
                placeholder="De quoi parle cette vidéo ?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
            />

            <div>
                <h3 className="text-heading-sm">Objectif</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {scriptGoalOptions.map((g) => (
                        <Pill
                            key={g}
                            label={scriptGoalToFrenchTranslation[g]}
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
                            isSelected={goal === g}
                            onClick={() => setGoal(g)}
                        />
                    ))}
                </div>
            </div>

            <TextArea
                label="Points clés"
                placeholder="Les points importants à aborder (optionnel)"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
            />

            <div>
                <h3 className="text-heading-sm">Style d'ouverture</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {openingStyleOptions.map((s) => (
                        <Pill
                            key={s}
                            label={openingStyleToFrenchTranslation[s]}
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
                            isSelected={openingStyle === s}
                            onClick={() => setOpeningStyle(s)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-heading-sm">Durée de la vidéo</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {videoDurationOptions.map((d) => (
                        <Pill
                            key={d}
                            label={videoDurationToFrenchTranslation[d]}
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
                            isSelected={duration === d}
                            onClick={() => setDuration(d)}
                        />
                    ))}
                </div>
            </div>

            {!isOnboarding && (
                <TextArea
                    label="Contexte supplémentaire"
                    placeholder="Informations additionnelles pour l'IA (optionnel)"
                    value={extraContext}
                    onChange={(e) => setExtraContext(e.target.value)}
                />
            )}

            {submitLabel && (
                <Button
                    type="submit"
                    style="primary"
                    isLoading={isPending}
                    disabled={isPending || !canSubmit}
                >
                    <div className="flex flex-row justify-center items-center gap-2">
                        {SubmitIcon && <SubmitIcon className="size-4" />}
                        <p className="text-sm">{submitLabel}</p>
                    </div>
                </Button>
            )}
        </form>
    )
}
