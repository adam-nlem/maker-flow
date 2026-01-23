import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SocialAnalyticsIntegrationInsightType } from '../models/enums/SocialAnalyticsIntegrationInsightType'
import { SocialAnalyticsInsightType } from '../models/enums/SocialAnalyticsInsightType'
import { IntegrationProvider } from '~/models/enums/IntegrationProvider'

type SocialAnalyticsFilterState = {
    integrationInsightType: SocialAnalyticsIntegrationInsightType,
    insightType: SocialAnalyticsInsightType,

    focusedIntegrationUuid: string | null,
}

type SocialAnalyticsFilterAction = {
    setIntegrationInsightType: (integrationInsightType: SocialAnalyticsIntegrationInsightType) => void
    setInsightType: (insightType: SocialAnalyticsInsightType) => void

    setFocusedIntegrationUuid: (focusedIntegrationUuid: string | null) => void
}

export const useSocialAnalyticsFilterStore = create<SocialAnalyticsFilterState & SocialAnalyticsFilterAction>()(
    persist(
        (set) => ({
            integrationInsightType: SocialAnalyticsIntegrationInsightType.Views,
            insightType: SocialAnalyticsInsightType.Integration,
            setIntegrationInsightType: (integrationInsightType) => set({ integrationInsightType: integrationInsightType }),
            setInsightType: (insightType) => set({ insightType: insightType }),

            focusedIntegrationUuid: null,
            setFocusedIntegrationUuid: (focusedIntegrationUuid) => set({ focusedIntegrationUuid: focusedIntegrationUuid }),
        }),
        {
            name: "app:social-analytics:filter-store",
        }
    )
)
