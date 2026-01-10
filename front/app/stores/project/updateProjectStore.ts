import { create } from 'zustand'

type UpdateProjectState = {
    updatingProjectUuid: string | null
}

type UpdateProjectAction = {
    setUpdatingProjectUuid: (uuid: string | null) => void
}

export const useUpdateProjectStore = create<UpdateProjectState & UpdateProjectAction>((set) => ({
    updatingProjectUuid: null,
    setUpdatingProjectUuid: (uuid) => set({ updatingProjectUuid: uuid })
}))
