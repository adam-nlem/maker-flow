import { createResettableStore } from '~/stores/createResettableStore'

type UpdateProjectState = {
    updatingProjectUuid: string | null
}

type UpdateProjectAction = {
    setUpdatingProjectUuid: (uuid: string | null) => void
}

export const useUpdateProjectStore = createResettableStore<UpdateProjectState & UpdateProjectAction>()((set) => ({
    updatingProjectUuid: null,
    setUpdatingProjectUuid: (uuid) => set({ updatingProjectUuid: uuid })
}))
