import type { ComponentType, ReactNode, SVGProps } from "react"
import { Button } from "~/components/ui/Button"

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

interface WelcomeStepLayoutProps {
    icon?: HeroIcon
    title: string
    subtitle: ReactNode
    onBack?: () => void
    onNext?: () => void
    nextLabel?: string
    children?: ReactNode
}

export default function WelcomeStepLayout({
    icon: Icon,
    title,
    subtitle,
    onBack,
    onNext,
    nextLabel = "Suivant",
    children,
}: WelcomeStepLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12">
            <div className="flex flex-col items-center">
                {Icon && (
                    <div className="mb-8 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                    </div>
                )}

                <h2 className="text-heading-2xl text-dark mb-2 text-center">{title}</h2>

                <p className="text-body-md text-gray mb-10 text-center max-w-lg">{subtitle}</p>
            </div>

            <div className="max-w-fit flex flex-col gap-4 bg-clear">
                {children}
            </div>

            {(onBack || onNext) ? (
                <div className="flex flex-row gap-3 items-center justify-center w-full max-w-sm">
                    {onBack && (
                        <Button style="secondary" width="w-1/4" onClick={onBack}>
                            Retour
                        </Button>
                    )}
                    {onNext && (
                        <Button style="primary" width="w-3/4" onClick={onNext}>
                            {nextLabel}
                        </Button>
                    )}
                </div>
            ) : <div />}
        </div>
    )
}
