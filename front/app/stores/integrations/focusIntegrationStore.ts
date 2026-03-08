import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FocusIntegrationState = {
    focusedIntegrationUuid: string | null
}

type FocusIntegrationAction = {
    setFocusedIntegrationUuid: (uuid: string | null) => void
}

export const useFocusIntegrationStore = create<FocusIntegrationState & FocusIntegrationAction>()(
    persist(
        (set) => ({
            focusedIntegrationUuid: null,
            setFocusedIntegrationUuid: (uuid) => set({ focusedIntegrationUuid: uuid }),
        }),
        {
            name: "app:integrations:focus",
        }
    )
)
