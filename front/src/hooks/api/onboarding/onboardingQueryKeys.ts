export const onboardingQueryKeys = {
    all: ['onboarding'] as const,
    show: () => [...onboardingQueryKeys.all, 'show'] as const,
}
