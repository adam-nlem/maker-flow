import { create } from 'zustand'

const LOCAL_STORAGE_KEY = "app:project:focused"

type FocusProjectState = {
    focusedProjectUuid: string | null
}

type FocusProjectAction = {
    setFocusedProjectUuid: (uuid: string | null) => void
}

export const useFocusProjectStore = create<FocusProjectState & FocusProjectAction>((set) => ({
    focusedProjectUuid: typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null,

    setFocusedProjectUuid: (uuid) => {
        if (typeof window !== "undefined" && uuid) {
            localStorage.setItem(LOCAL_STORAGE_KEY, uuid)
        }
        set({ focusedProjectUuid: uuid })
    }
}))
