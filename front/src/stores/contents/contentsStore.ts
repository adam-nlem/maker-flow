import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'
import { ContentsTab } from '~/models/enums/ContentsTab'
import type { Platform } from '~/models/enums/Platform'

type ContentsState = {
  activeTab: ContentsTab
  platformFilter: Platform | null
  selectedGroupUuid: string | null
  selectedPostUuid: string | null
  searchTerm: string | null
  isCreateGroupModalOpen: boolean
}

type ContentsAction = {
  setActiveTab: (tab: ContentsTab) => void
  setPlatformFilter: (platform: Platform | null) => void
  selectGroup: (uuid: string | null) => void
  selectPost: (uuid: string | null) => void
  setSearchTerm: (searchTerm: string | null) => void
  setIsCreateGroupModalOpen: (open: boolean) => void
  closePanel: () => void
}

export const useContentsStore = createResettableStore<ContentsState & ContentsAction>()(
  persist(
    (set) => ({
      activeTab: ContentsTab.Posts,
      platformFilter: null,
      selectedGroupUuid: null,
      selectedPostUuid: null,
      searchTerm: null,
      isCreateGroupModalOpen: false,

      setActiveTab: (tab) => set({
        activeTab: tab,
        selectedGroupUuid: null,
        selectedPostUuid: null,
        isCreateGroupModalOpen: false,
      }),
      setPlatformFilter: (platform) => set({ platformFilter: platform }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      selectGroup: (uuid) => set({
        selectedGroupUuid: uuid,
        selectedPostUuid: null,
        isCreateGroupModalOpen: false,
      }),
      selectPost: (uuid) => set({
        selectedPostUuid: uuid,
        selectedGroupUuid: null,
        isCreateGroupModalOpen: false,
      }),
      setIsCreateGroupModalOpen: (open) => set({
        isCreateGroupModalOpen: open,
        selectedGroupUuid: null,
        selectedPostUuid: null,
      }),
      closePanel: () => set({
        selectedGroupUuid: null,
        selectedPostUuid: null,
        isCreateGroupModalOpen: false,
      }),
    }),
    {
      name: "app:contents:state",
      partialize: (state) => ({
        activeTab: state.activeTab,
        platformFilter: state.platformFilter,
        selectedGroupUuid: state.selectedGroupUuid,
        selectedPostUuid: state.selectedPostUuid,
        isCreateGroupModalOpen: state.isCreateGroupModalOpen,
      }),
    }
  )
)
