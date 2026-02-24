import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ScriptEditorState = {
    isExpanded: boolean
}

type ScriptEditorAction = {
    toggle: () => void
    setIsExpanded: (expanded: boolean) => void
}

export const useScriptEditorStore = create<ScriptEditorState & ScriptEditorAction>()(
    persist(
        (set) => ({
            isExpanded: true,
            toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
            setIsExpanded: (expanded) => set({ isExpanded: expanded }),
        }),
        {
            name: "app:scripts:editor",
        }
    )
)
