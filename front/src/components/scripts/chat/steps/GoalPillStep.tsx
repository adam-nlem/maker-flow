import Pill from "~/components/ui/Pill";
import { type ScriptGoal, scriptGoalOptions, scriptGoalToFrenchTranslation } from "~/models/enums/ScriptGoal";

interface GoalPillStepProps {
    onSelect: (goal: ScriptGoal) => void;
}

export default function GoalPillStep({ onSelect }: GoalPillStepProps) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-body-sm text-gray">Quel est l'objectif de cette vidéo ?</p>
            <div className="flex flex-row flex-wrap gap-2">
                {scriptGoalOptions.map((goal) => (
                    <Pill
                        key={goal}
                        label={scriptGoalToFrenchTranslation[goal]}
                        onClick={() => onSelect(goal)}
                    />
                ))}
            </div>
        </div>
    );
}
