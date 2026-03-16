import { CheckCircleIcon } from "@heroicons/react/24/outline"

import { onboardingPath } from "~/routes/routePaths"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import SubscriptionOverview from "~/components/settings/subscription/SubscriptionOverview"
import Shimmer from "~/components/ui/Shimmer"
import { subscriptionPlanToFrenchTranslation } from "~/models/enums/SubscriptionPlan"

export default function OnboardingSubscriptionStep() {
    return (
        <OnboardingStepLayout maxWidth="max-w-3xl">
            <SubscriptionOverview
                checkoutRedirectPath={onboardingPath}
                subscribedView={(subscription) => (
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 size-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircleIcon className="size-8 text-primary" />
                        </div>
                        <h3 className="text-heading-xl text-dark mb-2">
                            Abonnement {subscriptionPlanToFrenchTranslation[subscription.plan]} activé
                        </h3>
                        <p className="text-body-sm text-gray">
                            Votre abonnement est actif. Cliquez sur Continuer pour terminer la configuration.
                        </p>
                    </div>
                )}
                loadingView={<Shimmer height="h-64" width="w-full" />}
            />
        </OnboardingStepLayout>
    )
}
