import { useEffect } from "react"
import { RocketLaunchIcon, ClipboardDocumentCheckIcon, ChartBarIcon, CalendarDaysIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { WelcomeStep } from "~/models/enums/WelcomeStep"
import { track } from "~/services/analytics/analytics"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import AuthStepLayout from "~/components/auth/AuthStepLayout"

const featureKeys = [
    { icon: ClipboardDocumentCheckIcon, key: "scripts" },
    { icon: ChartBarIcon, key: "stats" },
    { icon: CalendarDaysIcon, key: "calendar" },
    { icon: SparklesIcon, key: "ai" },
] as const

export default function WelcomeFeatureStep() {
    const { t } = useTranslation()
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)

    useEffect(() => {
        track(AnalyticsEvent.WelcomeStepViewed, { step: WelcomeStep.Features })
    }, [])

    return (
        <AuthStepLayout
            icon={RocketLaunchIcon}
            title={t("welcome:features.title")}
            subtitle={t("welcome:features.subtitle")}
            onNext={() => setWelcomeStep(WelcomeStep.HowItWorks)}
            nextLabel={t("welcome:features.next")}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
                {featureKeys.map((feature) => (
                    <div
                        key={feature.key}
                        className="border bg-clear border-pale-gray rounded-xl p-5 flex flex-col gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-heading-sm text-dark">{t(`welcome:features.${feature.key}.title`)}</h3>
                        <p className="text-body-sm text-muted-2">{t(`welcome:features.${feature.key}.description`)}</p>
                    </div>
                ))}
            </div>
        </AuthStepLayout>
    )
}
