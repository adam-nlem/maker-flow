import { persist } from "zustand/middleware"
import { createResettableStore } from "~/stores/createResettableStore"
import type { ProjectType } from "~/models/enums/ProjectType"
import type { Project } from "~/models/Project"

type OnboardingCreateProjectState = {
  projectName: string
  projectLogoPreviewUrl: string | null
  projectTypes: ProjectType[]
  project: Project | null
}

type OnboardingCreateProjectAction = {
  setProjectName: (name: string) => void
  setProjectLogoPreviewUrl: (url: string | null) => void
  setProjectTypes: (types: ProjectType[]) => void
  setProject: (project: Project | null) => void
}

export const useOnboardingCreateProjectStore = createResettableStore<
  OnboardingCreateProjectState & OnboardingCreateProjectAction
>()(
  persist(
    (set) => ({
      projectName: "",
      projectLogoPreviewUrl: null,
      projectTypes: [],
      project: null,

      setProjectName: (name) => set({ projectName: name }),
      setProjectLogoPreviewUrl: (url) => set({ projectLogoPreviewUrl: url }),
      setProjectTypes: (types) => set({ projectTypes: types }),
      setProject: (project) => set({ project }),
    }),
    {
      name: "app:onboarding:create-project",
      partialize: (state) => ({ projectName: state.projectName, projectTypes: state.projectTypes }),
    }
  )
)
