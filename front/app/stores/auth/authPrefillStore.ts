import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'

type AuthPrefillState = {
    email: string | null
}

type AuthPrefillAction = {
    setEmail: (email: string | null) => void
}

export const useAuthPrefillStore = createResettableStore<AuthPrefillState & AuthPrefillAction>()(
    persist(
        (set) => ({
            email: null,
            setEmail: (email) => set({ email })
        }),
        {
            name: "app:auth:prefill",
        }
    )
)
