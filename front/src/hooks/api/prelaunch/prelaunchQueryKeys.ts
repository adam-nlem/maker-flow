export const prelaunchQueryKeys = {
  all: ['prelaunch'] as const,
  status: () => [...prelaunchQueryKeys.all, 'status'] as const,
}
