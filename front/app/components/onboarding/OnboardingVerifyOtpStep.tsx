import { ShieldCheckIcon } from "@heroicons/react/24/outline"

import VerifyOtpForm from "~/components/auth/VerifyOtpForm"
import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import { OtpType } from "~/models/enums/OtpType"

interface OnboardingVerifyOtpStepProps {
    pendingOtpToken: string
    email: string
}

export default function OnboardingVerifyOtpStep({ pendingOtpToken, email }: OnboardingVerifyOtpStepProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <OnboardingStepHeader
                    icon={ShieldCheckIcon}
                    title="Vérification de l'email"
                    description={<>Un code à 6 chiffres a été envoyé à{" "}<span className="font-semibold text-dark ">{email}</span></>}
                />

                <VerifyOtpForm pendingOtpToken={pendingOtpToken} purpose={OtpType.EmailVerification} />
            </div>
        </div>
    )
}
