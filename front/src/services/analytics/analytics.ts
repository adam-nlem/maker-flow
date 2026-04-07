import posthog from 'posthog-js'
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
    posthog.capture(event, properties)
}

export function identifyUser(user: { uuid: string}): void {
    posthog.identify(user.uuid)
}

export function resetUser(): void {
    posthog.reset()
}
