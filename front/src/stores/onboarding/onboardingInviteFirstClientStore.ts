import { persist } from "zustand/middleware"
import { createResettableStore } from "~/stores/createResettableStore"
import type { Invitation } from "~/models/Invitation"

type OnboardingInviteFirstClientState = {
  firstName: string
  lastName: string
  email: string
  invitation: Invitation | null
}

type OnboardingInviteFirstClientAction = {
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setEmail: (email: string) => void
  setInvitation: (invitation: Invitation | null) => void
}

export const useOnboardingInviteFirstClientStore = createResettableStore<
  OnboardingInviteFirstClientState & OnboardingInviteFirstClientAction
>()(
  persist(
    (set) => ({
      firstName: "",
      lastName: "",
      email: "",
      invitation: null,

      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setEmail: (email) => set({ email }),
      setInvitation: (invitation) => set({ invitation }),
    }),
    {
      name: "app:onboarding:invite-first-client",
      partialize: (state) => ({
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
      }),
    }
  )
)
