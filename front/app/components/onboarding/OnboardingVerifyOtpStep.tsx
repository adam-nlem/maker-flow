import VerifyOtpForm from "~/components/auth/VerifyOtpForm"
import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import { OtpType } from "~/models/enums/OtpType"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"

export default function OnboardingVerifyOtpStep() {
    const pendingOtpToken = useOnboardingStore((s) => s.pendingOtpToken)
    const email = useOnboardingStore((s) => s.otpEmail)

    if (!pendingOtpToken || !email) return null

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <OnboardingStepHeader />

                <VerifyOtpForm pendingOtpToken={pendingOtpToken} purpose={OtpType.EmailVerification} />
            </div>
        </div>
    )
}
