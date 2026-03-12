import type { ReactNode } from "react"
import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"

interface OnboardingStepLayoutProps {
    maxWidth?: string
    disableNextButton?: boolean
    children: ReactNode
}

export default function OnboardingStepLayout({
    maxWidth = "max-w-lg",
    disableNextButton,
    children,
}: OnboardingStepLayoutProps) {
    return (
        <div className="h-screen flex flex-col items-center justify-between p-6">
            <OnboardingStepHeader disableNextButton={disableNextButton} />

            <div className={`${maxWidth} w-full bg-clear flex flex-col items-center justify-center`}>
                {children}
            </div>

            <div />
        </div>
    )
}
