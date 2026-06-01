import { persist } from "zustand/middleware"
import { createResettableStore } from "~/stores/createResettableStore"
import type { Agency } from "~/models/Agency"

type OnboardingCreateAgencyState = {
  agencyName: string
  agencyLogoPreviewUrl: string | null
  agency: Agency | null
}

type OnboardingCreateAgencyAction = {
  setAgencyName: (name: string) => void
  setAgencyLogoPreviewUrl: (url: string | null) => void
  setAgency: (agency: Agency | null) => void
}

export const useOnboardingCreateAgencyStore = createResettableStore<
  OnboardingCreateAgencyState & OnboardingCreateAgencyAction
>()(
  persist(
    (set) => ({
      agencyName: "",
      agencyLogoPreviewUrl: null,
      agency: null,

      setAgencyName: (name) => set({ agencyName: name }),
      setAgencyLogoPreviewUrl: (url) => set({ agencyLogoPreviewUrl: url }),
      setAgency: (agency) => set({ agency }),
    }),
    {
      name: "app:onboarding:create-agency",
      partialize: (state) => ({ agencyName: state.agencyName }),
    }
  )
)
