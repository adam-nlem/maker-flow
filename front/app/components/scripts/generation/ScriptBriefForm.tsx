import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { type ScriptGoal, scriptGoalOptions, scriptGoalToFrenchTranslation } from "~/models/enums/ScriptGoal";
import { type OpeningStyle, openingStyleOptions, openingStyleToFrenchTranslation } from "~/models/enums/OpeningStyle";
import { type VideoDuration, videoDurationToFrenchTranslation, videoDurationOptions } from "~/models/enums/VideoDuration";
import Pill from "~/components/ui/Pill";

interface ScriptBriefFormProps {
    topic: string;
    onTopicChange: (value: string) => void;
    goal: ScriptGoal | undefined;
    onGoalChange: (value: ScriptGoal) => void;
    keyPoints: string;
    onKeyPointsChange: (value: string) => void;
    openingStyle: OpeningStyle | undefined;
    onOpeningStyleChange: (value: OpeningStyle) => void;
    duration: VideoDuration | undefined;
    onDurationChange: (value: VideoDuration) => void;
    callToAction: string;
    onCallToActionChange: (value: string) => void;
    extraContext: string;
    onExtraContextChange: (value: string) => void;
}

export default function ScriptBriefForm({
    topic,
    onTopicChange,
    goal,
    onGoalChange,
    keyPoints,
    onKeyPointsChange,
    openingStyle,
    onOpeningStyleChange,
    duration,
    onDurationChange,
    callToAction,
    onCallToActionChange,
    extraContext,
    onExtraContextChange,
}: ScriptBriefFormProps) {
    return (
        <div className="flex flex-col gap-5">
            <TextArea
                label="Sujet"
                placeholder="De quoi parle cette vidéo ?"
                value={topic}
                onChange={(e) => onTopicChange(e.target.value)}
                fullWidth
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
                            onClick={() => onGoalChange(g)}
                        />
                    ))}
                </div>
            </div>

            <TextArea
                label="Points clés"
                placeholder="Les points importants à aborder (optionnel)"
                value={keyPoints}
                onChange={(e) => onKeyPointsChange(e.target.value)}
                fullWidth
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
                            onClick={() => onOpeningStyleChange(s)}
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
                            onClick={() => onDurationChange(d)}
                        />
                    ))}
                </div>
            </div>

            <Input
                label="Call to action"
                placeholder="Que voulez-vous que l'audience fasse ? (optionnel)"
                value={callToAction}
                onChange={(e) => onCallToActionChange(e.target.value)}
                fullWidth
            />

            <TextArea
                label="Contexte supplémentaire"
                placeholder="Informations additionnelles pour l'IA (optionnel)"
                value={extraContext}
                onChange={(e) => onExtraContextChange(e.target.value)}
                fullWidth
            />
        </div>
    );
}
