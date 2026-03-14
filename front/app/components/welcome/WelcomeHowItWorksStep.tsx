import { Fragment } from "react"
import { FolderPlusIcon, LinkIcon, ChartBarIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router"
import { registerPath } from "~/routes/routePaths"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WelcomeStep } from "~/models/enums/WelcomeStep"
import AuthStepLayout from "~/components/auth/AuthStepLayout"

const steps = [
    {
        icon: FolderPlusIcon,
        number: "1",
        title: "Créez un projet",
        description: "Regroupez vos scripts, réseaux sociaux et analytics autour d'un projet.",
    },
    {
        icon: LinkIcon,
        number: "2",
        title: "Connectez vos réseaux",
        description: "Liez vos comptes Instagram et YouTube pour importer vos données.",
    },
    {
        icon: ChartBarIcon,
        number: "3",
        title: "Créez et analysez",
        description: "Rédigez vos prochains contenus et suivez vos performances.",
    },
]

export default function WelcomeHowItWorksStep() {
    const navigate = useNavigate()
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)

    return (
        <AuthStepLayout
            title="Comment ça marche ?"
            subtitle="Trois étapes pour commencer."
            onBack={() => setWelcomeStep(WelcomeStep.Features)}
            onNext={() => navigate(registerPath)}
        >
            <div className="flex flex-col sm:flex-row gap-8 max-w-3xl w-full">
                {steps.map((step) => (
                    <Fragment key={step.number}>
                        <div className="flex-1 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary text-clear flex items-center justify-center text-heading-xs mb-3">
                                {step.number}
                            </div>
                            <h3 className="text-heading-sm text-dark mb-1">{step.title}</h3>
                            <p className="text-body-sm text-gray">{step.description}</p>
                        </div>
                    </Fragment>
                ))}
            </div>
        </AuthStepLayout>
    )
}
