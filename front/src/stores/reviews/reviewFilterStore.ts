import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'
import { ReviewStatus } from '~/models/enums/ReviewStatus'

type ReviewFilterState = {
    selectedStatus: ReviewStatus | null
    searchTerm: string
}

type ReviewFilterAction = {
    setSelectedStatus: (selectedStatus: ReviewStatus | null) => void
    setSearchTerm: (searchTerm: string) => void
}

export const useReviewFilterStore = createResettableStore<ReviewFilterState & ReviewFilterAction>()(
    persist(
        (set) => ({
            selectedStatus: null,
            searchTerm: "",
            setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
            setSearchTerm: (searchTerm) => set({ searchTerm }),
        }),
        {
            name: "app:reviews:filter",
            partialize: (state) => ({ selectedStatus: state.selectedStatus }),
        }
    )
)
