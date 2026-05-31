import { persist } from "zustand/middleware"
import { createResettableStore } from "~/stores/createResettableStore"

type OnboardingState = {
  agencyName: string
  agencyLogoPreviewUrl: string | null
  projectName: string
  projectLogoPreviewUrl: string | null
}

type OnboardingAction = {
  setAgencyName: (name: string) => void
  setAgencyLogoPreviewUrl: (url: string | null) => void
  setProjectName: (name: string) => void
  setProjectLogoPreviewUrl: (url: string | null) => void
}

export const useOnboardingStore = createResettableStore<OnboardingState & OnboardingAction>()(
  persist(
    (set) => ({
      agencyName: "",
      agencyLogoPreviewUrl: null,
      projectName: "",
      projectLogoPreviewUrl: null,

      setAgencyName: (name) => set({ agencyName: name }),
      setAgencyLogoPreviewUrl: (url) => set({ agencyLogoPreviewUrl: url }),
      setProjectName: (name) => set({ projectName: name }),
      setProjectLogoPreviewUrl: (url) => set({ projectLogoPreviewUrl: url }),
    }),
    { name: "app:onboarding" }
  )
)
