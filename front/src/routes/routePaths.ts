// Public routes
export const homePath = '/'
export const prelaunchPath = '/prelaunch'
export const onboardingPath = '/onboarding'
export const loginPath = '/login'
export const registerPath = '/register'
export const verifyOtpPath = '/verify-otp'
export const integrationCallbackPath = '/integrations/callback'

// Protected routes
export const tasksPath = '/tasks'
export const insightsPath = '/insights'
export const scriptsPath = '/scripts'
export const calendarPath = '/calendar'
export const settingsPath = '/settings'

// Settings sections
export const settingsGeneralPath = '/settings/general'
export const settingsProjectsPath = '/settings/projects'
export const settingsIntegrationsPath = '/settings/integrations'
export const settingsCreatorProfilePath = '/settings/creator-profile'
export const settingsSubscriptionPath = '/settings/subscription'

// Dynamic routes
export function insightsPostDetailPath(postUuid: string): string {
    return `/insights/posts/${postUuid}`
}
