import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import IntegrationLoginCard from "~/components/integrations/IntegrationLoginCard"
import Shimmer from "~/components/ui/Shimmer"
import { Button } from "~/components/ui/Button"
import { platformOptions } from "~/models/enums/Platform"
import { IntegrationStatus } from "~/models/enums/IntegrationStatus"
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"

export default function OnboardingConnectIntegrationStep() {
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const { integrations, isLoading } = useListIntegrations({ projectUuid })
    const { advanceStep } = useAdvanceOnboardingStep()

    const hasConnectedIntegration = integrations.some((i) => i.status === IntegrationStatus.Active)

    if (!projectUuid) return null

    return (
        <OnboardingStepLayout>
            <div className="flex flex-col items-center gap-5 w-full">
                <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
                    {isLoading ? (
                        <Shimmer height="h-32" width="w-full" />
                    ) : (
                        platformOptions.map((platform) => (
                            <IntegrationLoginCard
                                key={platform}
                                projectUuid={projectUuid}
                                platform={platform}
                                integration={integrations.find((i) => i.platform === platform) ?? null}
                            />
                        ))
                    )}
                </div>

                <Button
                    style="primary"
                    disabled={!hasConnectedIntegration}
                    onClick={advanceStep}
                >
                    Continuer
                </Button>
            </div>
        </OnboardingStepLayout>
    )
}
