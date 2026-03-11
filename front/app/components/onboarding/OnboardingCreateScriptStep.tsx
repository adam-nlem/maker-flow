import { useState } from "react"
import { DocumentTextIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript"

interface Props {
    projectUuid: string
    onNext: () => void
}

export default function OnboardingCreateScriptStep({ projectUuid, onNext }: Props) {
    const [title, setTitle] = useState("")
    const [created, setCreated] = useState(false)

    const { createScript, isPending } = useCreateScript()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        await createScript({ projectUuid, title: title.trim() || "Nouveau script" })
        setCreated(true)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
                <OnboardingStepHeader
                    icon={DocumentTextIcon}
                    title="Créez votre premier script"
                    description="Les scripts vous permettent de rédiger et organiser vos contenus vidéo."
                />

                {created ? (
                    <div className="flex flex-col items-center gap-6">
                        <p className="text-heading-sm text-primary">
                            Script créé avec succès !
                        </p>
                        <Button style="primary" onClick={onNext}>
                            Suivant
                        </Button>
                    </div>
                ) : (
                    <>
                        <form className="space-y-4" onSubmit={handleCreate}>
                            <Input
                                label="Titre du script"
                                placeholder="Nouveau script"
                                id="onboarding-script-title"
                                name="title"
                                type="text"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <Button
                                type="submit"
                                style="primary"
                                isLoading={isPending}
                                disabled={isPending}
                            >
                                Créer mon premier script
                            </Button>
                        </form>

                        <div className="mt-6 flex justify-center">
                            <SimpleTextButton onClick={onNext}>
                                Passer
                            </SimpleTextButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
