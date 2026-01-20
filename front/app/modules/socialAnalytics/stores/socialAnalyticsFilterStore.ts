import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SocialAnalyticsIntegrationInsightType } from '../models/enums/SocialAnalyticsIntegrationInsightType'

type SocialAnalyticsFilterState = {
    insightType: SocialAnalyticsIntegrationInsightType
}

type SocialAnalyticsFilterAction = {
    setInsightType: (insightType: SocialAnalyticsIntegrationInsightType) => void
}

export const useSocialAnalyticsFilterStore = create<SocialAnalyticsFilterState & SocialAnalyticsFilterAction>()(
    persist(
        (set) => ({
            insightType: SocialAnalyticsIntegrationInsightType.Views,
            setInsightType: (insightType) => set({ insightType }),
        }),
        {
            name: "app:social-analytics:filter-store",
        }
    )
)
