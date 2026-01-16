import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FocusProjectState = {
    focusedProjectUuid: string | null
}

type FocusProjectAction = {
    setFocusedProjectUuid: (uuid: string | null) => void
}

export const useFocusProjectStore = create<FocusProjectState & FocusProjectAction>()(
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
