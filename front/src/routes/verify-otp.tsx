import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import VerifyOtpForm from "~/components/auth/VerifyOtpForm"
import { homePath, loginPath, prelaunchPath } from "~/routes/routePaths"
import { OtpType, otpTypeTranslationKeys } from "~/models/enums/OtpType"

interface VerifyOtpState {
    pendingOtpToken: string
    purpose: OtpType
    email: string
}

export default function VerifyOtpPage() {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const state = location.state as VerifyOtpState | null

    useEffect(() => {
        if (!state) {
            navigate(loginPath, { replace: true })
        }
    }, [state, navigate])

    if (!state) return null

    const isPrelaunch = state.purpose === OtpType.PrelaunchVerification
    const backPath = isPrelaunch ? prelaunchPath : loginPath
    const successPath = isPrelaunch ? prelaunchPath : homePath

    return (
        <AuthStepLayout
            eyebrow={t("auth:verify.eyebrow")}
            title={t(otpTypeTranslationKeys[state.purpose])}
            subtitle={t("auth:verify.subtitle")}
            helperLink={{
                leading: <ArrowLeftIcon className="size-3.5 text-muted" />,
                linkText: t("auth:verify.backToSignIn"),
                onClick: () => navigate(backPath),
            }}
            trustFooter
        >
            <VerifyOtpForm
                pendingOtpToken={state.pendingOtpToken}
                type={state.purpose}
                email={state.email}
                onVerified={() => navigate(successPath)}
            />
        </AuthStepLayout>
    )
}
