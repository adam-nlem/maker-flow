import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimePeriod } from '~/models/enums/TimePeriod'

type InsightsFilterState = {
    timePeriod: TimePeriod
}

type InsightsFilterAction = {
    setTimePeriod: (timePeriod: TimePeriod) => void
}

export const useInsightsFilterStore = create<InsightsFilterState & InsightsFilterAction>()(
    persist(
        (set) => ({
            timePeriod: TimePeriod.Last30Days,
            setTimePeriod: (timePeriod) => set({ timePeriod }),
        }),
        {
            name: "app:insights:filter",
        }
    )
)
