import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import IntegrationSettingCard from "~/components/settings/integration/IntegrationSettingCard"
import Shimmer from "~/components/ui/Shimmer"
import { platformOptions } from "~/models/enums/Platform"
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"

export default function OnboardingConnectIntegrationStep() {
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const { integrations, isLoading } = useListIntegrations({ projectUuid: projectUuid! })

    if (!projectUuid) return null

    return (
        <OnboardingStepLayout>
            <div className="flex flex-row justify-center gap-3 w-full">
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
        </OnboardingStepLayout>
    )
}
