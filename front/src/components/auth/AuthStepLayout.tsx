import type { ComponentType, ReactNode, SVGProps } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import EyebrowLabel from "~/components/ui/EyebrowLabel"
import { privacyPolicyPath, termsOfServicePath } from "~/routes/routePaths"

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

interface HelperLink {
    question?: string
    linkText: string
    onClick: () => void
    leading?: ReactNode
}

interface AuthStepLayoutProps {
    icon?: HeroIcon
    eyebrow?: string
    title: string
    subtitle?: ReactNode
    onBack?: () => void
    onNext?: () => void
    nextLabel?: string
    helperLink?: HelperLink
    cardWidth?: string
    children?: ReactNode
}

export default function AuthStepLayout({
    icon: Icon,
    eyebrow,
    title,
    subtitle,
    onBack,
    onNext,
    nextLabel,
    helperLink,
    cardWidth = "max-w-md",
    children,
}: AuthStepLayoutProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const resolvedNextLabel = nextLabel ?? t("actions.next")
    const year = new Date().getFullYear()

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen flex flex-col items-center justify-between gap-6 px-6 py-6">
            <div />

            <div className={`w-full ${cardWidth} bg-clear border border-pale-gray-2 rounded-2xl shadow-sm p-8 flex flex-col gap-5`}>
                <div className="flex items-center gap-2">
                    <img src="/favicon.png" alt="MakerFlow" className="size-7 rounded-md" />
                    <span className="text-heading-md text-dark">MakerFlow</span>
                </div>

                {Icon && (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
                    <h2 className="text-heading-2xl text-dark">{title}</h2>
                    {subtitle && <p className="text-body-sm text-muted">{subtitle}</p>}
                </div>

                {children && <div>{children}</div>}

                {(onBack || onNext) && (
                    <div className="flex flex-row gap-3 items-center justify-center">
                        {onBack && (
                            <Button style="secondary" width="w-1/4" height="h-10" onClick={onBack}>
                                {t("actions.back")}
                            </Button>
                        )}
                        {onNext && (
                            <Button style="primary" width="w-full sm:w-3/4" height="h-10" onClick={onNext}>
                                {resolvedNextLabel}
                            </Button>
                        )}
                    </div>
                )}

                {helperLink && (
                    <div className="flex justify-center items-center gap-1.5 text-body-sm text-muted">
                        {helperLink.leading}
                        {helperLink.question && <span>{helperLink.question}</span>}
                        <SimpleTextButton onClick={helperLink.onClick} color="text-dark" hoverColor="hover:text-primary">
                            <span className="underline underline-offset-2 font-medium">{helperLink.linkText}</span>
                        </SimpleTextButton>
                    </div>
                )}
            </div>

            <div className="w-full  flex items-center justify-around text-body-xs text-muted-2 px-2">
                <span>© {year} MakerFlow Inc.</span>
                <div className="flex gap-3 items-center">
                    <SimpleTextButton onClick={() => navigate(privacyPolicyPath)} color="text-muted-2" hoverColor="hover:text-dark">
                        {t("legal.privacyPolicy")}
                    </SimpleTextButton>
                    <span>·</span>
                    <SimpleTextButton onClick={() => navigate(termsOfServicePath)} color="text-muted-2" hoverColor="hover:text-dark">
                        {t("legal.termsOfService")}
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
