export const prelaunchQueryKeys = {
    all: ['prelaunch'] as const,
    status: (referralCode: string) => [...prelaunchQueryKeys.all, 'status', referralCode] as const,
}
