import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'
import { PostDraftStatus } from '~/models/enums/PostDraftStatus'

type PostDraftFilterState = {
    selectedStatus: PostDraftStatus | null
    searchTerm: string
}

type PostDraftFilterAction = {
    setSelectedStatus: (selectedStatus: PostDraftStatus | null) => void
    setSearchTerm: (searchTerm: string) => void
}

export const usePostDraftFilterStore = createResettableStore<PostDraftFilterState & PostDraftFilterAction>()(
    persist(
        (set) => ({
            selectedStatus: null,
            searchTerm: "",
            setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
            setSearchTerm: (searchTerm) => set({ searchTerm }),
        }),
        {
            name: "app:postDrafts:filter",
            partialize: (state) => ({ selectedStatus: state.selectedStatus }),
        }
    )
)
