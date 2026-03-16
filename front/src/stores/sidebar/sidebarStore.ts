import { create } from 'zustand'

type SidebarState = {
    isExpanded: boolean
}

type SidebarAction = {
    setIsExpanded: (isExpanded: boolean) => void
}

export const useSidebarStore = create<SidebarState & SidebarAction>((set) => ({
    isExpanded: false,
    setIsExpanded: (isExpanded) => set({ isExpanded: isExpanded })
}))  