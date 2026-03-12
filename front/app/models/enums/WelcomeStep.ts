export enum WelcomeStep {
    Hero = 'hero',
    Features = 'features',
    HowItWorks = 'how_it_works',
    Register = 'register',
    VerifyOtp = 'verify_otp',
}

export const WELCOME_STEP_ORDER = [
    WelcomeStep.Hero,
    WelcomeStep.Features,
    WelcomeStep.HowItWorks,
    WelcomeStep.Register,
    WelcomeStep.VerifyOtp,
]

export const welcomeStepToTitle: Partial<Record<WelcomeStep, string>> = {
    [WelcomeStep.Register]: "Créez votre compte",
    [WelcomeStep.VerifyOtp]: "Vérification de l'email",
}

export const welcomeStepToDescription: Partial<Record<WelcomeStep, string>> = {
    [WelcomeStep.Register]: "Commencez gratuitement et gérez vos contenus dès maintenant.",
}
