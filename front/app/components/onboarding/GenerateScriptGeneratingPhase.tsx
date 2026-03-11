import { SparklesIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

import { Button } from "~/components/ui/Button"

const GENERATING_MESSAGES = [
    "Analyse du sujet...",
    "Structure du script...",
    "Rédaction du hook...",
    "Développement des parties...",
    "Ajout des détails...",
    "Finalisation...",
]

interface GenerateScriptGeneratingPhaseProps {
    isFailed: boolean
    messageIndex: number
    onNext: () => void
}

export default function GenerateScriptGeneratingPhase({ isFailed, messageIndex, onNext }: GenerateScriptGeneratingPhaseProps) {
    if (isFailed) {
        return (
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 size-20 rounded-full bg-danger/10 flex items-center justify-center">
                    <ExclamationTriangleIcon className="size-10 text-danger" />
                </div>
                <h2 className="text-heading-2xl text-dark mb-2">
                    Une erreur est survenue
                </h2>
                <p className="text-body-sm text-gray mb-8">
                    La génération a échoué. Vous pourrez réessayer depuis l'éditeur de script.
                </p>
                <Button style="primary" onClick={onNext}>
                    Continuer
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center text-center">
            <div className="mb-6 size-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <SparklesIcon className="size-10 text-primary" />
            </div>
            <h2 className="text-heading-2xl text-dark mb-2">
                L'IA rédige votre script
            </h2>
            <p className="text-body-sm text-gray h-6 transition-opacity duration-500">
                {GENERATING_MESSAGES[messageIndex]}
            </p>
            <div className="mt-8 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="size-2 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </div>
        </div>
    )
}
