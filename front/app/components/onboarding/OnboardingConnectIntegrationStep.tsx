import { LinkIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import IntegrationSettingCard from "~/components/settings/integration/IntegrationSettingCard"
import { platformOptions } from "~/models/enums/Platform"
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations"
import Shimmer from "~/components/ui/Shimmer"

interface Props {
    projectUuid: string
    onNext: () => void
}

export default function OnboardingConnectIntegrationStep({ projectUuid, onNext }: Props) {
    const { integrations, isLoading } = useListIntegrations({ projectUuid })

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <OnboardingStepHeader
                icon={LinkIcon}
                title="Connectez vos réseaux sociaux"
                description="Connectez vos comptes pour analyser vos performances et centraliser vos contenus."
            />

            <div className="flex flex-row justify-center gap-3 mb-8 w-full">
                {isLoading ? (
                    <Shimmer height="h-32" width="w-full" />
                ) : (
                    platformOptions.map((platform) => (
                        <IntegrationSettingCard
                            key={platform}
                            projectUuid={projectUuid}
                            platform={platform}
                            integration={integrations.find((i) => i.platform === platform) ?? null}
                        />
                    ))
                )}
            </div>

            <div className="flex flex-col items-center gap-3">
                <Button style="primary" onClick={onNext}>
                    Suivant
                </Button>
                <SimpleTextButton onClick={onNext}>
                    Passer
                </SimpleTextButton>
            </div>
        </div>
    )
}
