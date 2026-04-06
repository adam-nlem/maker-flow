import { useEffect } from "react"
import { RocketLaunchIcon, ClipboardDocumentCheckIcon, ChartBarIcon, CalendarDaysIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { WelcomeStep } from "~/models/enums/WelcomeStep"
import { track } from "~/services/analytics/analytics"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import AuthStepLayout from "~/components/auth/AuthStepLayout"

const features = [
    {
        icon: ClipboardDocumentCheckIcon,
        title: "Scripts",
        description: "Rédigez vos scripts vidéo avec un éditeur structuré : hooks, chapitres, dialogues, voix-off et plus.",
    },
    {
        icon: ChartBarIcon,
        title: "Statistiques",
        description: "Suivez vos performances Instagram et YouTube avec des statistiques détaillés en temps réel.",
    },
    {
        icon: CalendarDaysIcon,
        title: "Calendrier",
        description: "Planifiez vos publications et visualisez votre planning de contenu sur un calendrier mensuel.",
    },
    {
        icon: SparklesIcon,
        title: "Génération IA",
        description: "Générez des scripts complets avec l'intelligence artificielle en quelques secondes.",
    },
]

export default function WelcomeFeatureStep() {
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)

    useEffect(() => {
        track(AnalyticsEvent.WelcomeStepViewed, { step: WelcomeStep.Features })
    }, [])

    return (
        <AuthStepLayout
            icon={RocketLaunchIcon}
            title="Gérez vos contenus comme un pro"
            subtitle="MakerFlow vous aide à planifier, rédiger et analyser vos contenus vidéo sur Instagram et YouTube."
            onNext={() => setWelcomeStep(WelcomeStep.HowItWorks)}
            nextLabel="Découvrir"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="border bg-clear border-light-gray rounded-xl p-5 flex flex-col gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-heading-sm text-dark">{feature.title}</h3>
                        <p className="text-body-sm text-gray">{feature.description}</p>
                    </div>
                ))}
            </div>
        </AuthStepLayout>
    )
}
