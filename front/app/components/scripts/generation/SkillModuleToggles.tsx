import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { ToggleChip } from "~/components/ui/ToggleChip";
import { callToActionTypeOptions, callToActionTypeToFrenchTranslation } from "~/models/enums/CallToActionType";
import { retentionCueTypeOptions, retentionCueTypeToFrenchTranslation } from "~/models/enums/RetentionCueType";
import { ScriptFormat, scriptFormatToFrenchTranslation } from "~/models/enums/ScriptFormat";
import {
    SkillModule,
    skillModuleToFrenchTranslation,
    skillModuleToDescription,
    skillModuleHasExtraInput,
    skillModuleExtraInputType,
} from "~/models/enums/SkillModule";

interface SkillModuleTogglesProps {
    activeSkills: SkillModule[];
    onActiveSkillsChange: (skills: SkillModule[]) => void;
    skillInputs: Record<string, string>;
    onSkillInputsChange: (inputs: Record<string, string>) => void;
}

export default function SkillModuleToggles({
    activeSkills,
    onActiveSkillsChange,
    skillInputs,
    onSkillInputsChange,
}: SkillModuleTogglesProps) {
    const toggleSkill = (skill: SkillModule) => {
        if (activeSkills.includes(skill)) {
            onActiveSkillsChange(activeSkills.filter((s) => s !== skill));
        } else {
            onActiveSkillsChange([...activeSkills, skill]);
        }
    };

    const updateSkillInput = (skill: string, value: string) => {
        onSkillInputsChange({ ...skillInputs, [skill]: value });
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-heading-sm">Modules IA</h3>

            <div className="flex flex-col gap-2">
                {Object.values(SkillModule).map((skill) => {
                    const isActive = activeSkills.includes(skill);
                    const hasExtra = skillModuleHasExtraInput[skill];
                    const extraType = skillModuleExtraInputType[skill];

                    return (
                        <div key={skill} className="flex flex-col gap-2">
                            <div
                                onClick={() => toggleSkill(skill)}
                                className={`flex flex-row items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${isActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-light-gray hover:bg-light-gray/30'
                                    }`}
                            >
                                <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'border-primary bg-primary' : 'border-light-gray'}`}>
                                    {isActive && (
                                        <div className="size-2 rounded-full bg-clear" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-heading-xs">{skillModuleToFrenchTranslation[skill]}</span>
                                    <span className="text-body-xs">{skillModuleToDescription[skill]}</span>
                                </div>
                            </div>

                            {isActive && hasExtra && (
                                <div className="ml-7">
                                    {extraType === 'text' && skill === SkillModule.StorytellingMode && (
                                        <TextArea
                                            placeholder="Racontez votre histoire personnelle..."
                                            value={skillInputs[skill] ?? ''}
                                            onChange={(e) => updateSkillInput(skill, e.target.value)}
                                            fullWidth
                                        />
                                    )}
                                    {extraType === 'text' && skill === SkillModule.SeoOptimization && (
                                        <Input
                                            placeholder="Mot-clé cible"
                                            value={skillInputs[skill] ?? ''}
                                            onChange={(e) => updateSkillInput(skill, e.target.value)}
                                            fullWidth
                                        />
                                    )}
                                    {extraType === 'select' && skill === SkillModule.ScriptFormat && (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.values(ScriptFormat).map((format) => (
                                                <ToggleChip
                                                    key={format}
                                                    label={scriptFormatToFrenchTranslation[format]}
                                                    isSelected={skillInputs[skill] === format}
                                                    onToggle={() => updateSkillInput(skill, format)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {extraType === 'select' && skill === SkillModule.CallToAction && (
                                        <div className="flex flex-wrap gap-2">
                                            {callToActionTypeOptions.map((ctaType) => (
                                                <ToggleChip
                                                    key={ctaType}
                                                    label={callToActionTypeToFrenchTranslation[ctaType]}
                                                    isSelected={skillInputs[skill] === ctaType}
                                                    onToggle={() => updateSkillInput(skill, ctaType)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {extraType === 'select' && skill === SkillModule.RetentionBoosters && (
                                        <div className="flex flex-wrap gap-2">
                                            {retentionCueTypeOptions.map((cueType) => (
                                                <ToggleChip
                                                    key={cueType}
                                                    label={retentionCueTypeToFrenchTranslation[cueType]}
                                                    isSelected={skillInputs[skill] === cueType}
                                                    onToggle={() => updateSkillInput(skill, cueType)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
