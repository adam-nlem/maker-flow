import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SocialAnalyticsMetric } from '../models/enums/SocialAnalyticsMetric'
import { SocialAnalyticsTimePeriod } from '../models/enums/SocialAnalyticsTimePeriod'

type SocialAnalyticsFilterState = {
    metric: SocialAnalyticsMetric
    timePeriod: SocialAnalyticsTimePeriod
}

type SocialAnalyticsFilterAction = {
    setMetric: (metric: SocialAnalyticsMetric) => void
    setTimePeriod: (timePeriod: SocialAnalyticsTimePeriod) => void
}

export const useSocialAnalyticsFilterStore = create<SocialAnalyticsFilterState & SocialAnalyticsFilterAction>()(
    persist(
        (set) => ({
            metric: SocialAnalyticsMetric.Views,
            timePeriod: SocialAnalyticsTimePeriod.Last30Days,
            setMetric: (metric) => set({ metric }),
            setTimePeriod: (timePeriod) => set({ timePeriod }),
        }),
        {
            name: "app:social-analytics:filter-store",
        }
    )
)
