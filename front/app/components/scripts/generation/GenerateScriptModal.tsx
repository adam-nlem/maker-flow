import { useEffect, useRef, useState } from "react";
import { SparklesIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { Button } from "~/components/ui/Button";
import ScriptBriefForm from "./ScriptBriefForm";
import SkillModuleToggles from "./SkillModuleToggles";
import { useCreateScriptGeneration } from "~/hooks/api/scriptGenerations/useCreateScriptGeneration";
import { useLatestScriptGeneration } from "~/hooks/api/scriptGenerations/useLatestScriptGeneration";
import { useScriptGenerationStore } from "~/stores/scripts/scriptGenerationStore";
import type { ScriptGoal } from "~/models/enums/ScriptGoal";
import type { OpeningStyle } from "~/models/enums/OpeningStyle";
import type { SkillModule } from "~/models/enums/SkillModule";

interface GenerateScriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    scriptUuid: string;
    projectUuid: string;
    hasExistingParts: boolean;
    onOpenCreatorProfile: () => void;
    hasCreatorProfile: boolean;
}

export default function GenerateScriptModal({
    isOpen,
    onClose,
    scriptUuid,
    projectUuid,
    hasExistingParts,
    onOpenCreatorProfile,
    hasCreatorProfile,
}: GenerateScriptModalProps) {
    const { latestGeneration } = useLatestScriptGeneration({ scriptUuid });
    const hasPreFilled = useRef(false);

    const [topic, setTopic] = useState("");
    const [goal, setGoal] = useState<ScriptGoal | undefined>(undefined);
    const [keyPoints, setKeyPoints] = useState("");
    const [openingStyle, setOpeningStyle] = useState<OpeningStyle | undefined>(undefined);
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
            setCallToAction(latestGeneration.callToAction ?? "");
            setExtraContext(latestGeneration.extraContext ?? "");
            setActiveSkills(latestGeneration.activeSkills as SkillModule[]);
            setSkillInputs(latestGeneration.skillInputs);
            setReplaceExisting(latestGeneration.replaceExisting);
        }
    }, [latestGeneration]);

    const { createScriptGeneration, isPending } = useCreateScriptGeneration();
    const setActiveGenerationUuid = useScriptGenerationStore((s) => s.setActiveGenerationUuid);

    const canSubmit = topic.trim() !== "" && goal !== undefined && openingStyle !== undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        const generation = await createScriptGeneration({
            scriptUuid,
            topic: topic.trim(),
            goal,
            keyPoints: keyPoints.trim() || undefined,
            openingStyle,
            callToAction: callToAction.trim() || undefined,
            extraContext: extraContext.trim() || undefined,
            activeSkills,
            skillInputs,
            replaceExisting,
        });

        setActiveGenerationUuid(generation.uuid);
        onClose();
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            <div
                className="border rounded-xl border-light-gray w-150 h-fit max-h-[90vh] flex flex-col shadow-lg bg-clear overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 py-5 border-b border-light-gray flex flex-row items-center gap-3">
                    <SparklesIcon className="size-5 text-primary" strokeWidth={2} />
                    <h1 className="text-heading-lg">Générer avec l'IA</h1>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-5 scrollbar-none">
                    {/* {!hasCreatorProfile && ( */}
                        <div
                            onClick={onOpenCreatorProfile}
                            className="flex flex-row items-center gap-3 px-4 py-3 mb-5 rounded-xl border border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                            <UserCircleIcon className="size-5 text-primary shrink-0" strokeWidth={2} />
                            <div className="flex flex-col">
                                <span className="text-heading-xs">Configurez votre profil créateur</span>
                                <span className="text-body-xs">Améliorez les résultats en ajoutant votre style et vos préférences</span>
                            </div>
                        </div>
                    {/* )} */}

                    <form id="generate-form" className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        <ScriptBriefForm
                            topic={topic}
                            onTopicChange={setTopic}
                            goal={goal}
                            onGoalChange={setGoal}
                            keyPoints={keyPoints}
                            onKeyPointsChange={setKeyPoints}
                            openingStyle={openingStyle}
                            onOpeningStyleChange={setOpeningStyle}
                            callToAction={callToAction}
                            onCallToActionChange={setCallToAction}
                            extraContext={extraContext}
                            onExtraContextChange={setExtraContext}
                        />

                        <div className="border-t border-light-gray" />

                        <SkillModuleToggles
                            activeSkills={activeSkills}
                            onActiveSkillsChange={setActiveSkills}
                            skillInputs={skillInputs}
                            onSkillInputsChange={setSkillInputs}
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

                <div className="px-8 py-4 border-t border-light-gray">
                    <Button
                        type="submit"
                        style="primary"
                        isLoading={isPending}
                        disabled={isPending || !canSubmit}
                        onClick={() => {
                            const form = document.getElementById('generate-form') as HTMLFormElement;
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
        </ModalOverlay>
    );
}
