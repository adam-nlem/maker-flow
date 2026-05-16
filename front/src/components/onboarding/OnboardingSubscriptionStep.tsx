import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

import { onboardingPath } from "~/routes/routePaths"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import SubscriptionOverview from "~/components/agency/settings/subscription/SubscriptionOverview"
import Shimmer from "~/components/ui/Shimmer"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { subscriptionPlanTranslationKeys } from "~/models/enums/SubscriptionPlan"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingSubscriptionStep() {
    const { t } = useTranslation()
    const { advanceStep } = useAdvanceOnboardingStep()

    return (
        <OnboardingStepLayout maxWidth="max-w-4xl">
            <SubscriptionOverview
                checkoutRedirectPath={onboardingPath}
                subscribedView={(subscription) => (
                    <div className="flex flex-col items-center text-center gap-5">
                        <div className="mb-4 size-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircleIcon className="size-8 text-primary" />
                        </div>
                        <h3 className="text-heading-xl text-dark mb-2">
                            {t("onboarding:subscriptionStep.activatedTitle", { plan: t(subscriptionPlanTranslationKeys[subscription.plan]) })}
                        </h3>
                        <p className="text-body-sm text-muted-2">
                            {t("onboarding:subscriptionStep.activatedSubtitle")}
                        </p>

                        <Button style="primary" onClick={advanceStep}>
                            {t("onboarding:subscriptionStep.primaryAction")}
                        </Button>
                    </div>
                )}
                loadingView={<Shimmer height="h-64" width="w-full" />}
            />
            <SimpleTextButton onClick={advanceStep}>
                {t("onboarding:subscriptionStep.skip")}
            </SimpleTextButton>
        </OnboardingStepLayout>
    )
}
