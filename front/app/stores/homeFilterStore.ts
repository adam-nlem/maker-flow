import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type HomeFilterState = {
    focusedIntegrationUuid: string | null,
}

type HomeFilterAction = {
    setFocusedIntegrationUuid: (focusedIntegrationUuid: string | null) => void
}

export const useHomeFilterStore = create<HomeFilterState & HomeFilterAction>()(
    persist(
        (set) => ({
            focusedIntegrationUuid: null,
            setFocusedIntegrationUuid: (focusedIntegrationUuid) => set({ focusedIntegrationUuid: focusedIntegrationUuid }),
        }),
        {
            name: "app:home:filter-store",
        }
    )
)
