import posthog from 'posthog-js'
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
    posthog.capture(event, properties)
}

export function identifyUser(user: { uuid: string; email: string }): void {
    posthog.identify(user.uuid, { email: user.email })
}

export function resetUser(): void {
    posthog.reset()
}
