import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'

type FocusScriptState = {
    focusedScriptUuid: string | null
}

type FocusScriptAction = {
    setFocusedScriptUuid: (uuid: string | null) => void
}

export const useFocusScriptStore = createResettableStore<FocusScriptState & FocusScriptAction>()(
    persist(
        (set) => ({
            focusedScriptUuid: null,
            setFocusedScriptUuid: (uuid) => set({ focusedScriptUuid: uuid }),
        }),
        {
            name: "app:scripts:focused",
        }
    )
)
