import { useEffect, useRef, useState } from "react";
import { SparklesIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/Button";
import ScriptBriefForm from "./ScriptBriefForm";
import SkillModuleToggles from "./SkillModuleToggles";
import { useCreateScriptGeneration } from "~/hooks/api/scriptGenerations/useCreateScriptGeneration";
import { useLatestScriptGeneration } from "~/hooks/api/scriptGenerations/useLatestScriptGeneration";
import { useListScriptParts } from "~/hooks/api/scripts/useListScriptParts";
import { useScriptGenerationStore } from "~/stores/scripts/scriptGenerationStore";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import type { ScriptGoal } from "~/models/enums/ScriptGoal";
import type { OpeningStyle } from "~/models/enums/OpeningStyle";
import type { VideoDuration } from "~/models/enums/VideoDuration";
import type { SkillModule } from "~/models/enums/SkillModule";

interface GenerateScriptPanelProps {
    scriptUuid: string;
    projectUuid: string;
}

export default function GenerateScriptPanel({ scriptUuid, projectUuid }: GenerateScriptPanelProps) {
    const navigate = useNavigate();
    const { latestGeneration } = useLatestScriptGeneration({ scriptUuid });
    const { parts } = useListScriptParts({ scriptUuid });
    const hasExistingParts = parts.length > 0;
    const hasPreFilled = useRef(false);

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
    const [replaceExisting, setReplaceExisting] = useState(false);

    useEffect(() => {
        if (latestGeneration && !hasPreFilled.current) {
            hasPreFilled.current = true;
            setTopic(latestGeneration.topic);
            setGoal(latestGeneration.goal);
            setKeyPoints(latestGeneration.keyPoints ?? "");
            setOpeningStyle(latestGeneration.openingStyle);
            setDuration(latestGeneration.duration);
            setCallToAction(latestGeneration.callToAction ?? "");
            setExtraContext(latestGeneration.extraContext ?? "");
            setActiveSkills(latestGeneration.activeSkills as SkillModule[]);
            setSkillInputs(latestGeneration.skillInputs);
            setReplaceExisting(latestGeneration.replaceExisting);
        }
    }, [latestGeneration]);

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
            replaceExisting,
        });

        setActiveGenerationUuid(generation.uuid);
        closePanel();
    };

    return (
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-96" : "w-0"}`}>
            <div className="w-96 min-w-96 shrink-0 border-l border-light-gray h-full flex flex-col">
                {/* Header */}
                <div className="flex flex-row items-center justify-between px-4 py-4 border-b border-light-gray">
                    <div className="flex flex-row items-center gap-2">
                        <SparklesIcon className="size-5 text-primary" strokeWidth={2} />
                        <h2 className="text-heading-md">Générer avec l'IA</h2>
                    </div>
                    <button
                        onClick={closePanel}
                        className="text-gray hover:text-dark transition-colors cursor-pointer"
                    >
                        <XMarkIcon className="size-4" strokeWidth={2} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
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

                        {hasExistingParts && (
                            <>
                                <div className="border-t border-light-gray" />

                                <div
                                    onClick={() => setReplaceExisting(!replaceExisting)}
                                    className="flex flex-row items-center gap-3 cursor-pointer"
                                >
                                    <div className={`size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${replaceExisting ? 'border-primary bg-primary' : 'border-light-gray'}`}>
                                        {replaceExisting && (
                                            <svg className="size-3 text-clear" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-heading-xs">Remplacer le contenu existant</span>
                                        <span className="text-body-xs">Le contenu actuel du script sera remplacé par le contenu généré</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Sticky footer */}
                <div className="px-4 py-3 border-t border-light-gray">
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
                </div>
            </div>
        </div>
    );
}
