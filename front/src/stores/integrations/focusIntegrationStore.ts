import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'

type FocusIntegrationState = {
    focusedIntegrationUuid: string | null
}

type FocusIntegrationAction = {
    setFocusedIntegrationUuid: (uuid: string | null) => void
}

export const useFocusIntegrationStore = createResettableStore<FocusIntegrationState & FocusIntegrationAction>()(
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
