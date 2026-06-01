import { useTranslation } from "react-i18next"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import IntegrationLoginCard from "~/components/integrations/IntegrationLoginCard"
import Shimmer from "~/components/ui/Shimmer"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { platformOptions } from "~/models/enums/Platform"
import { IntegrationStatus } from "~/models/enums/IntegrationStatus"
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

export default function OnboardingConnectIntegrationStep() {
  const { t } = useTranslation()
  const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
  const { integrations, isLoading } = useListIntegrations({ projectUuid })
  const { advanceStep } = useAdvanceOnboardingStep()

  if (!projectUuid) return null

  return (
    <OnboardingStepLayout>
      <div className="flex flex-col w-full">
        <div className="flex flex-col justify-center gap-1 w-full">
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
          className="mt-3"
          width="w-fit"
          height="h-11"
          isLoading={isLoading}
          disabled={isLoading}
          onClick={advanceStep}
        >
          <p className="text-sm">{t("actions.continue")}</p>
          <ArrowRightIcon className="size-4" />
        </Button>

      </div>
    </OnboardingStepLayout>)
}
