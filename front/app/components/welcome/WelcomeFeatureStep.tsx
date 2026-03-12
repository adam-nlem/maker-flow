import { ClipboardDocumentCheckIcon, ChartBarIcon, CalendarDaysIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { Button } from "~/components/ui/Button"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WelcomeStep } from "~/models/enums/WelcomeStep"

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
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <h2 className="text-heading-2xl text-dark  mb-2 text-center">
                Tout ce dont vous avez besoin
            </h2>
            <p className="text-body-md text-gray mb-10 text-center max-w-lg">
                Des outils pensés pour les créateurs de contenu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full mb-10">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="border bg-clear border-light-gray  rounded-xl p-5 flex flex-col gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-heading-sm text-dark ">{feature.title}</h3>
                        <p className="text-body-sm text-gray">{feature.description}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <Button style="outline" width="w-auto" onClick={() => setWelcomeStep(WelcomeStep.Hero)}>
                    Retour
                </Button>
                <Button style="primary" width="w-auto" onClick={() => setWelcomeStep(WelcomeStep.HowItWorks)}>
                    Suivant
                </Button>
            </div>
        </div>
    )
}
