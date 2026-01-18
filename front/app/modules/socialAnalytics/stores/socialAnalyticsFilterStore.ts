import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SocialAnalyticsInsightType } from '../models/enums/SocialAnalyticsInsightType'

type SocialAnalyticsFilterState = {
    insightType: SocialAnalyticsInsightType
}

type SocialAnalyticsFilterAction = {
    setInsightType: (insightType: SocialAnalyticsInsightType) => void
}

export const useSocialAnalyticsFilterStore = create<SocialAnalyticsFilterState & SocialAnalyticsFilterAction>()(
    persist(
        (set) => ({
            insightType: SocialAnalyticsInsightType.Views,
            setInsightType: (insightType) => set({ insightType }),
        }),
        {
            name: "app:social-analytics:filter-store",
        }
    )
)
