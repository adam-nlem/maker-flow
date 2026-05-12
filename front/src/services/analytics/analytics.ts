import posthog from 'posthog-js'
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { UserRole } from "~/models/enums/UserRole"

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
    posthog.capture(event, properties)
}

export function identifyUser(user: { uuid: string; role: UserRole | null }): void {
    posthog.identify(user.uuid)
    if (user.role !== null) {
        posthog.register({ user_role: user.role })
    }
}

export function resetUser(): void {
    posthog.reset()
}
