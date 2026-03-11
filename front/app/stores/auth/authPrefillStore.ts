import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthPrefillState = {
    email: string | null
}

type AuthPrefillAction = {
    setEmail: (email: string | null) => void
}

export const useAuthPrefillStore = create<AuthPrefillState & AuthPrefillAction>()(
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
