import { useEffect, useRef, useState } from "react";
import { SparklesIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/Button";
import { SidePanel } from "~/components/ui/SidePanel";
import ScriptBriefForm from "./ScriptBriefForm";
import SkillModuleToggles from "./SkillModuleToggles";
import { useCreateScriptGeneration } from "~/hooks/api/scriptGenerations/useCreateScriptGeneration";
import { useShowScriptGeneration } from "~/hooks/api/scriptGenerations/useShowScriptGeneration";
import { useScriptGenerationStore } from "~/stores/scripts/scriptGenerationStore";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import type { ScriptGoal } from "~/models/enums/ScriptGoal";
import type { OpeningStyle } from "~/models/enums/OpeningStyle";
import type { VideoDuration } from "~/models/enums/VideoDuration";
import type { SkillModule } from "~/models/enums/SkillModule";
import { AiModel } from "~/models/enums/AiModel";

interface GenerateScriptPanelProps {
    scriptUuid: string;
    projectUuid: string;
}

export default function GenerateScriptPanel({ scriptUuid, projectUuid }: GenerateScriptPanelProps) {
    const navigate = useNavigate();
    const focusedGenerationUuid = useScriptGenerationStore((s) => s.focusedGenerationUuid);
    const { generation: focusedGeneration } = useShowScriptGeneration({ generationUuid: focusedGenerationUuid ?? null, scriptUuid });
    const hasPreFilled = useRef<string | undefined>(undefined);

    const isOpen = useScriptRightPanelStore((s) => s.activePanel === ScriptRightPanel.Generate);
    const closePanel = useScriptRightPanelStore((s) => s.closePanel);

    const [topic, setTopic] = useState("");
    const [goal, setGoal] = useState<ScriptGoal | undefined>(undefined);
    const [keyPoints, setKeyPoints] = useState("");
    const [openingStyle, setOpeningStyle] = useState<OpeningStyle | undefined>(undefined);
    const [duration, setDuration] = useState<VideoDuration | undefined>(undefined);
    const [callToAction, setCallToAction] = useState("");
    const [extraContext, setExtraContext] = useState("");
    const [activeSkills, setActiveSkills] = useState<SkillModule[]>([]);
    const [skillInputs, setSkillInputs] = useState<Record<string, string>>({});
    const [aiModel, setAiModel] = useState<AiModel>(AiModel.Gemini);

    useEffect(() => {
        if (focusedGeneration && hasPreFilled.current !== focusedGeneration.uuid) {
            hasPreFilled.current = focusedGeneration.uuid;
            setTopic(focusedGeneration.topic);
            setGoal(focusedGeneration.goal);
            setKeyPoints(focusedGeneration.keyPoints ?? "");
            setOpeningStyle(focusedGeneration.openingStyle);
            setDuration(focusedGeneration.duration);
            setCallToAction(focusedGeneration.callToAction ?? "");
            setExtraContext(focusedGeneration.extraContext ?? "");
            setActiveSkills(focusedGeneration.activeSkills as SkillModule[]);
            setSkillInputs(focusedGeneration.skillInputs);
            setAiModel(focusedGeneration.aiModel);
        }
    }, [focusedGeneration]);

    const { createScriptGeneration, isPending } = useCreateScriptGeneration();
    const setActiveGenerationUuid = useScriptGenerationStore((s) => s.setActiveGenerationUuid);

    const canSubmit = topic.trim() !== "" && goal !== undefined && openingStyle !== undefined && duration !== undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        const generation = await createScriptGeneration({
            scriptUuid,
            topic: topic.trim(),
            goal,
            keyPoints: keyPoints.trim() || undefined,
            openingStyle,
            duration,
            callToAction: callToAction.trim() || undefined,
            extraContext: extraContext.trim() || undefined,
            activeSkills,
            skillInputs,
            aiModel,
        });

        setActiveGenerationUuid(generation.uuid);
        closePanel();
    };

    return (
        <SidePanel
            title="Générer avec l'IA"
            icon={SparklesIcon}
            width="w-96"
            isOpen={isOpen}
            onClose={closePanel}
            footer={
                <Button
                    type="submit"
                    style="primary"
                    isLoading={isPending}
                    disabled={isPending || !canSubmit}
                    onClick={() => {
                        const form = document.getElementById('generate-panel-form') as HTMLFormElement;
                        form?.requestSubmit();
                    }}
                >
                    <div className="flex flex-row justify-center items-center gap-2">
                        <SparklesIcon className="size-4 text-clear" strokeWidth={2} />
                        <p className="text-sm">Générer le script</p>
                    </div>
                </Button>
            }
        >
            <div className="p-4">
                <div
                    onClick={() => { closePanel(); navigate('/settings'); }}
                    className="flex flex-row items-center gap-3 px-4 py-3 mb-5 rounded-xl border border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                >
                    <UserCircleIcon className="size-5 text-primary shrink-0" strokeWidth={2} />
                    <div className="flex flex-col">
                        <span className="text-heading-xs">Configurez votre profil créateur</span>
                        <span className="text-body-xs">Améliorez les résultats en ajoutant votre style et vos préférences</span>
                    </div>
                </div>

                <form id="generate-panel-form" className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <ScriptBriefForm
                        topic={topic}
                        onTopicChange={setTopic}
                        goal={goal}
                        onGoalChange={setGoal}
                        keyPoints={keyPoints}
                        onKeyPointsChange={setKeyPoints}
                        openingStyle={openingStyle}
                        onOpeningStyleChange={setOpeningStyle}
                        duration={duration}
                        onDurationChange={setDuration}
                        extraContext={extraContext}
                        onExtraContextChange={setExtraContext}
                        aiModel={aiModel}
                        onAiModelChange={setAiModel}
                    />

                    <div className="border-t border-light-gray" />

                    <SkillModuleToggles
                        activeSkills={activeSkills}
                        onActiveSkillsChange={setActiveSkills}
                        skillInputs={skillInputs}
                        onSkillInputsChange={setSkillInputs}
                        callToAction={callToAction}
                        onCallToActionChange={setCallToAction}
                    />

                </form>
            </div>
        </SidePanel>
    );
}
