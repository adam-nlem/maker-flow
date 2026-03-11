import { useState } from "react"
import { DocumentPlusIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import { TextArea } from "~/components/ui/TextArea"
import PlatformPill from "~/components/ui/PlatformPill"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript"
import { Platform, platformOptions } from "~/models/enums/Platform"


interface OnboardingCreateScriptStepProps {
    projectUuid: string
    onScriptCreated: (scriptUuid: string) => void
    onNext: () => void
}

export default function OnboardingCreateScriptStep({ projectUuid, onScriptCreated, onNext }: OnboardingCreateScriptStepProps) {
    const [title, setTitle] = useState("")
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])

    const { createScript, isPending } = useCreateScript()

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
        onScriptCreated(script.uuid)
        onNext()
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
                    <SimpleTextButton onClick={onNext}>
                        Passer
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
