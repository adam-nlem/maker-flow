import { useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router"

import VerifyOtpForm from "~/components/auth/VerifyOtpForm"
import { OtpType, otpTypeToFrenchTranslation } from "~/models/enums/OtpType"

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

    const title = otpTypeToFrenchTranslation[state.purpose]

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-dark">
                    {title}
                </h2>
                <p className="mt-2 text-center text-body-sm text-medium-gray">
                    Un code à 6 chiffres a été envoyé à{" "}
                    <span className="font-semibold text-dark">{state.email}</span>
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <VerifyOtpForm
                    pendingOtpToken={state.pendingOtpToken}
                    purpose={state.purpose}
                    onVerified={() => navigate("/")}
                    formSpacing="space-y-6"
                />

                <p className="mt-10 text-center text-body-sm">
                    <Link to="/login" className="font-semibold leading-6 text-primary">
                        Retour à la connexion
                    </Link>
                </p>
            </div>
        </div>
    )
}
