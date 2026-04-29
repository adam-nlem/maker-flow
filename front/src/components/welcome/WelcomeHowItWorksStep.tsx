import { Fragment, useEffect } from "react"
import { FolderPlusIcon, LinkIcon, ChartBarIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { WelcomeStep } from "~/models/enums/WelcomeStep"
import { track } from "~/services/analytics/analytics"
import { registerPath } from "~/routes/routePaths"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import AuthStepLayout from "~/components/auth/AuthStepLayout"

const stepKeys = [
    { icon: FolderPlusIcon, number: "1", key: "createProject" },
    { icon: LinkIcon, number: "2", key: "connectAccounts" },
    { icon: ChartBarIcon, number: "3", key: "createAndAnalyze" },
] as const

export default function WelcomeHowItWorksStep() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)

    useEffect(() => {
        track(AnalyticsEvent.WelcomeStepViewed, { step: WelcomeStep.HowItWorks })
    }, [])

    const handleNext = () => {
        track(AnalyticsEvent.WelcomeCompleted)
        navigate(registerPath)
    }

    return (
        <AuthStepLayout
            title={t("welcome:howItWorks.title")}
            subtitle={t("welcome:howItWorks.subtitle")}
            onBack={() => setWelcomeStep(WelcomeStep.Features)}
            onNext={handleNext}
        >
            <div className="flex flex-col sm:flex-row gap-8 max-w-3xl w-full">
                {stepKeys.map((step) => (
                    <Fragment key={step.number}>
                        <div className="flex-1 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary text-clear flex items-center justify-center text-heading-xs mb-3">
                                {step.number}
                            </div>
                            <h3 className="text-heading-sm text-dark mb-1">{t(`welcome:howItWorks.${step.key}.title`)}</h3>
                            <p className="text-body-sm text-gray">{t(`welcome:howItWorks.${step.key}.description`)}</p>
                        </div>
                    </Fragment>
                ))}
            </div>
        </AuthStepLayout>
    )
}
