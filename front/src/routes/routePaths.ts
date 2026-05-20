// Smart redirect entry — RootRedirect dispatches to the agency or client shell by role
export const homePath = '/'

// Public / auth
export const prelaunchPath = '/prelaunch'
export const privacyPolicyPath = '/privacy-policy'
export const termsOfServicePath = '/terms-of-service'
export const onboardingPath = '/onboarding'
export const loginPath = '/login'
export const registerPath = '/register'
export const verifyOtpPath = '/verify-otp'
export const integrationCallbackPath = '/integrations/callback'

// Agency shell
export const agencyAreaPrefix = '/agency'
export const agencyHomePath = agencyAreaPrefix
export const agencyTasksPath = `${agencyAreaPrefix}/tasks`
export const agencyDraftsPath = `${agencyAreaPrefix}/drafts`
export const agencyContentsPath = `${agencyAreaPrefix}/contents`
export const agencyScriptsPath = `${agencyAreaPrefix}/scripts`
export const agencyCalendarPath = `${agencyAreaPrefix}/calendar`
export const agencySettingsPath = `${agencyAreaPrefix}/settings`
export const agencySettingsGeneralPath = `${agencySettingsPath}/general`
export const agencySettingsAgencyPath = `${agencySettingsPath}/agency`
export const agencySettingsProjectsPath = `${agencySettingsPath}/projects`
export const agencySettingsSubscriptionPath = `${agencySettingsPath}/subscription`

// Client shell
export const clientAreaPrefix = '/client'
export const clientHomePath = clientAreaPrefix
export const clientDraftsPath = `${clientAreaPrefix}/drafts`
export const clientContentsPath = `${clientAreaPrefix}/contents`
export const clientSettingsPath = `${clientAreaPrefix}/settings`
export const clientSettingsGeneralPath = `${clientSettingsPath}/general`

// Invitations (public, tokenized link from welcome emails)
export const inviteAreaPrefix = '/invite'
export const inviteRouteMatcher = `${inviteAreaPrefix}/:token`
export const invitePath = (token: string) => `${inviteAreaPrefix}/${token}`
