import WelcomeHeroStep from "~/components/welcome/WelcomeHeroStep"
import WelcomeFeatureStep from "~/components/welcome/WelcomeFeatureStep"
import WelcomeHowItWorksStep from "~/components/welcome/WelcomeHowItWorksStep"
import OnboardingRegisterStep from "~/components/onboarding/OnboardingRegisterStep"
import OnboardingVerifyOtpStep from "~/components/onboarding/OnboardingVerifyOtpStep"
import OnboardingCreateProjectStep from "~/components/onboarding/OnboardingCreateProjectStep"
import OnboardingConnectIntegrationStep from "~/components/onboarding/OnboardingConnectIntegrationStep"
import OnboardingCreateScriptStep from "~/components/onboarding/OnboardingCreateScriptStep"
import OnboardingSubscriptionStep from "~/components/onboarding/OnboardingSubscriptionStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"

export default function OnboardingPage() {
    const flow = useOnboardingFlow()

    if (flow.isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    const renderPreAuthStep = () => {
        switch (flow.preAuthStep) {
            case 0:
                return <WelcomeHeroStep onNext={() => flow.setPreAuthStep(1)} />
            case 1:
                return <WelcomeFeatureStep onNext={() => flow.setPreAuthStep(2)} onBack={() => flow.setPreAuthStep(0)} />
            case 2:
                return <WelcomeHowItWorksStep onNext={() => flow.setPreAuthStep(3)} onBack={() => flow.setPreAuthStep(1)} />
            case 3:
                return <OnboardingRegisterStep onRegistered={flow.handleRegistered} onBack={() => flow.setPreAuthStep(2)} />
            case 4:
                return flow.pendingOtpToken && flow.otpEmail
                    ? <OnboardingVerifyOtpStep pendingOtpToken={flow.pendingOtpToken} email={flow.otpEmail} />
                    : null
            default:
                return null
        }
    }

    const renderPostAuthStep = () => { 
        switch (flow.postAuthStep) {
            case 0:
                return <OnboardingCreateProjectStep onProjectCreated={flow.handleProjectCreated} />
            case 1:
                return flow.focusedProjectUuid
                    ? <OnboardingConnectIntegrationStep projectUuid={flow.focusedProjectUuid} onNext={flow.advanceStep} />
                    : null
            case 2:
                return flow.focusedProjectUuid
                    ? <OnboardingCreateScriptStep projectUuid={flow.focusedProjectUuid} onNext={flow.advanceStep} />
                    : null
            case 3:
                return <OnboardingSubscriptionStep />
            default:
                return null
        }
    }

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            {flow.isAuthenticated ? renderPostAuthStep() : renderPreAuthStep()}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {Array.from({ length: flow.totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all ${
                            i === flow.currentStep ? 'bg-primary w-6' : 'bg-light-gray w-2'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}
