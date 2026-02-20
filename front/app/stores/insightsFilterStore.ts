import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IntegrationInsightType } from '~/models/enums/IntegrationInsightType'
import { InsightType } from '~/models/enums/InsightType'
import { TimePeriod } from '~/models/enums/TimePeriod'

type InsightsFilterState = {
    integrationInsightType: IntegrationInsightType,
    insightType: InsightType,
    timePeriod: TimePeriod,

    focusedIntegrationUuid: string | null,
}

type InsightsFilterAction = {
    setIntegrationInsightType: (integrationInsightType: IntegrationInsightType) => void
    setInsightType: (insightType: InsightType) => void
    setTimePeriod: (timePeriod: TimePeriod) => void

    setFocusedIntegrationUuid: (focusedIntegrationUuid: string | null) => void
}

export const useInsightsFilterStore = create<InsightsFilterState & InsightsFilterAction>()(
    persist(
        (set) => ({
            integrationInsightType: IntegrationInsightType.Views,
            insightType: InsightType.Integration,
            timePeriod: TimePeriod.Last30Days,
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
