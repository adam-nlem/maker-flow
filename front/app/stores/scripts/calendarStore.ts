import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Platform } from '~/models/enums/Platform'
import type { ScriptStatus } from '~/models/enums/ScriptStatus'

type CalendarState = {
    currentMonth: number,
    currentYear: number,
    selectedPlatforms: Platform[],
    selectedStatuses: ScriptStatus[],
    selectedTagUuids: string[],
}

type CalendarAction = {
    setCurrentMonth: (month: number) => void
    setCurrentYear: (year: number) => void
    togglePlatform: (platform: Platform) => void
    toggleStatus: (status: ScriptStatus) => void
    toggleTag: (tagUuid: string) => void
}

const today = new Date()

export const useCalendarStore = create<CalendarState & CalendarAction>()(
    persist(
        (set) => ({
            currentMonth: today.getMonth(),
            currentYear: today.getFullYear(),
            selectedPlatforms: [],
            selectedStatuses: [],
            selectedTagUuids: [],

            setCurrentMonth: (month) => set({ currentMonth: month }),
            setCurrentYear: (year) => set({ currentYear: year }),
            togglePlatform: (platform) => set((state) => ({
                selectedPlatforms: state.selectedPlatforms.includes(platform)
                    ? state.selectedPlatforms.filter((p) => p !== platform)
                    : [...state.selectedPlatforms, platform],
            })),
            toggleStatus: (status) => set((state) => ({
                selectedStatuses: state.selectedStatuses.includes(status)
                    ? state.selectedStatuses.filter((s) => s !== status)
                    : [...state.selectedStatuses, status],
            })),
            toggleTag: (tagUuid) => set((state) => ({
                selectedTagUuids: state.selectedTagUuids.includes(tagUuid)
                    ? state.selectedTagUuids.filter((u) => u !== tagUuid)
                    : [...state.selectedTagUuids, tagUuid],
            })),
        }),
        {
            name: "app:scripts:calendar",
        }
    )
)
