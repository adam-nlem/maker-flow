interface OnboardingStepHeaderProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string | React.ReactNode
}

export default function OnboardingStepHeader({ icon: Icon, title, description }: OnboardingStepHeaderProps) {
    return (
        <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="size-8 text-primary" />
            </div>
            <h2 className="text-heading-3xl text-dark mb-2">
                {title}
            </h2>
            <p className="text-body-sm text-medium-gray">
                {description}
            </p>
        </div>
    )
}
