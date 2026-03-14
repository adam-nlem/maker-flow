import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import VerifyOtpForm from "~/components/auth/VerifyOtpForm"
import type { OtpType } from "~/models/enums/OtpType"
import { otpTypeToFrenchTranslation } from "~/models/enums/OtpType"

interface VerifyOtpState {
    pendingOtpToken: string
    purpose: OtpType
    email: string
}

export default function VerifyOtpPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const state = location.state as VerifyOtpState | null

    useEffect(() => {
        if (!state) {
            navigate("/login", { replace: true })
        }
    }, [state, navigate])

    if (!state) return null

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            <AuthStepLayout
                icon={EnvelopeIcon}
                title={otpTypeToFrenchTranslation[state.purpose]}
                subtitle={<>Un code a été envoyé à <span className="text-dark font-medium">{state.email}</span></>}
                onBack={() => navigate("/login")}
            >
                <VerifyOtpForm
                    pendingOtpToken={state.pendingOtpToken}
                    purpose={state.purpose}
                    onVerified={() => navigate("/")}
                />
            </AuthStepLayout>
        </div>
    )
}
