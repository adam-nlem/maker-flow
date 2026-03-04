import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useScriptGenerationStore } from './scriptGenerationStore'

type FocusScriptState = {
    focusedScriptUuid: string | null
}

type FocusScriptAction = {
    setFocusedScriptUuid: (uuid: string | null) => void
}

export const useFocusScriptStore = create<FocusScriptState & FocusScriptAction>()(
    persist(
        (set) => ({
            focusedScriptUuid: null,
            setFocusedScriptUuid: (uuid) => {
                useScriptGenerationStore.getState().setFocusedGenerationUuid(undefined);
                set({ focusedScriptUuid: uuid });
            },
        }),
        {
            name: "app:scripts:focused",
        }
    )
)
