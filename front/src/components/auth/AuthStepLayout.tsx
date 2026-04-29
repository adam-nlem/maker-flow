import type { ComponentType, ReactNode, SVGProps } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { privacyPolicyPath, termsOfServicePath } from "~/routes/routePaths"

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

interface AuthStepLayoutProps {
    icon?: HeroIcon
    title: string
    subtitle: ReactNode
    onBack?: () => void
    onNext?: () => void
    nextLabel?: string
    children?: ReactNode
}

export default function AuthStepLayout({
    icon: Icon,
    title,
    subtitle,
    onBack,
    onNext,
    nextLabel,
    children,
}: AuthStepLayoutProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const resolvedNextLabel = nextLabel ?? t("actions.next")

    return (
        <div className="min-h-screen flex flex-col gap-3 items-center justify-between px-6 py-12">
            <div className="flex flex-col gap-1 items-center">
                {Icon && (
                    <div className=" w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                    </div>
                )}

                <h2 className="text-heading-2xl text-dark text-center">{title}</h2>

                <p className="text-body-md text-gray text-center max-w-lg">{subtitle}</p>
            </div>

            <div className="max-w-fit flex flex-col  bg-clear">
                {children}
            </div>

            {(onBack || onNext) ? (
                <div className="flex flex-row gap-3 items-center justify-center w-full max-w-sm ">
                    {onBack && (
                        <Button style="secondary" width="w-1/4" onClick={onBack}>
                            {t("actions.back")}
                        </Button>
                    )}
                    {onNext && (
                        <Button style="primary" width="w-full sm:w-3/4" onClick={onNext}>
                            {resolvedNextLabel}
                        </Button>
                    )}
                </div>
            ) : <div />}

            <div className="flex gap-2 justify-center items-center">
                <SimpleTextButton onClick={() => navigate(privacyPolicyPath)}>
                    {t("legal.privacyPolicy")}
                </SimpleTextButton>
                <span className="text-xs text-gray">·</span>
                <SimpleTextButton onClick={() => navigate(termsOfServicePath)}>
                    {t("legal.termsOfService")}
                </SimpleTextButton>
            </div>
        </div>
    )
}
