import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ScriptMetaHeaderState = {
    isExpanded: boolean
}

type ScriptMetaHeaderAction = {
    toggle: () => void
    setIsExpanded: (expanded: boolean) => void
}

export const useScriptMetaHeaderStore = create<ScriptMetaHeaderState & ScriptMetaHeaderAction>()(
    persist(
        (set) => ({
            isExpanded: true,
            toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
            setIsExpanded: (expanded) => set({ isExpanded: expanded }),
        }),
        {
            name: "app:scripts:meta-header",
        }
    )
)
