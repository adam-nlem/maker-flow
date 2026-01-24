import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SocialAnalyticsIntegrationInsightType } from '../models/enums/SocialAnalyticsIntegrationInsightType'
import { SocialAnalyticsInsightType } from '../models/enums/SocialAnalyticsInsightType'
import { SocialAnalyticsTimePeriod } from '../models/enums/SocialAnalyticsTimePeriod'

type SocialAnalyticsFilterState = {
    integrationInsightType: SocialAnalyticsIntegrationInsightType,
    insightType: SocialAnalyticsInsightType,
    timePeriod: SocialAnalyticsTimePeriod,

    focusedIntegrationUuid: string | null,
}

type SocialAnalyticsFilterAction = {
    setIntegrationInsightType: (integrationInsightType: SocialAnalyticsIntegrationInsightType) => void
    setInsightType: (insightType: SocialAnalyticsInsightType) => void
    setTimePeriod: (timePeriod: SocialAnalyticsTimePeriod) => void

    setFocusedIntegrationUuid: (focusedIntegrationUuid: string | null) => void
}

export const useSocialAnalyticsFilterStore = create<SocialAnalyticsFilterState & SocialAnalyticsFilterAction>()(
    persist(
        (set) => ({
            integrationInsightType: SocialAnalyticsIntegrationInsightType.Views,
            insightType: SocialAnalyticsInsightType.Integration,
            timePeriod: SocialAnalyticsTimePeriod.Last30Days,
            setIntegrationInsightType: (integrationInsightType) => set({ integrationInsightType: integrationInsightType }),
            setInsightType: (insightType) => set({ insightType: insightType }),
            setTimePeriod: (timePeriod) => set({ timePeriod: timePeriod }),

            focusedIntegrationUuid: null,
            setFocusedIntegrationUuid: (focusedIntegrationUuid) => set({ focusedIntegrationUuid: focusedIntegrationUuid }),
        }),
        {
            name: "app:social-analytics:filter-store",
        }
    )
)
