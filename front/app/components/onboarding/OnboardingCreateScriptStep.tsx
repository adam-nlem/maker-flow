import { useState } from "react"
import { DocumentPlusIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import { TextArea } from "~/components/ui/TextArea"
import PlatformPill from "~/components/ui/PlatformPill"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript"
import { Platform, platformOptions } from "~/models/enums/Platform"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingCreateScriptStep() {
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid)
    const { advanceStep } = useAdvanceOnboardingStep()

    const [title, setTitle] = useState("")
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])

    const { createScript, isPending } = useCreateScript()

    if (!projectUuid) return null

    const togglePlatform = (platform: Platform) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        )
    }

    const handleSubmit = async () => {
        const script = await createScript({
            projectUuid,
            title,
            platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        })
        setFocusedScriptUuid(script.uuid)
        await advanceStep()
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-lg">
                <OnboardingStepHeader
                    icon={DocumentPlusIcon}
                    title="Créez votre premier script"
                    description="Définissez le sujet et les plateformes de votre premier script vidéo."
                />

                <div className="flex flex-col gap-6">
                    <TextArea
                        label="Titre du script"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex : 5 astuces pour gagner du temps sur Instagram"
                        fullWidth
                    />

                    <div>
                        <label className="text-heading-sm text-dark mb-2 block">
                            Plateformes
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {platformOptions.map((platform) => (
                                <PlatformPill
                                    key={platform}
                                    platform={platform}
                                    isSelected={selectedPlatforms.includes(platform)}
                                    onToggle={() => togglePlatform(platform)}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        style="primary"
                        onClick={handleSubmit}
                        disabled={!title.trim() || isPending}
                        isLoading={isPending}
                    >
                        Créer le script
                    </Button>
                </div>

                <div className="mt-6 flex justify-center">
                    <SimpleTextButton onClick={advanceStep}>
                        Passer
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
