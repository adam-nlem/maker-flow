export enum PreAuthStep {
    Hero = 'hero',
    Features = 'features',
    HowItWorks = 'how_it_works',
    Register = 'register',
    VerifyOtp = 'verify_otp',
}

export const PRE_AUTH_STEP_ORDER = [
    PreAuthStep.Hero,
    PreAuthStep.Features,
    PreAuthStep.HowItWorks,
    PreAuthStep.Register,
    PreAuthStep.VerifyOtp,
]
