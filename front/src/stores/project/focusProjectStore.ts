import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'

type FocusProjectState = {
    focusedProjectUuid: string | null
}

type FocusProjectAction = {
    setFocusedProjectUuid: (uuid: string | null) => void
}

export const useFocusProjectStore = createResettableStore<FocusProjectState & FocusProjectAction>()(
    persist(
        (set) => ({
            focusedProjectUuid: null,
            setFocusedProjectUuid: (uuid) => set({ focusedProjectUuid: uuid })
        }),
        {
            name: "app:project:focused",
        }
    )
)
