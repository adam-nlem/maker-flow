import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'
import type { Platform } from '~/models/enums/Platform'
import type { ScriptStatus } from '~/models/enums/ScriptStatus'

type CalendarState = {
    currentMonth: number,
    currentYear: number,
    selectedDay: number | null,
    selectedPlatforms: Platform[],
    selectedStatuses: ScriptStatus[],
    selectedTagUuids: string[],
}

type CalendarAction = {
    setCurrentMonth: (month: number) => void
    setCurrentYear: (year: number) => void
    setSelectedDay: (day: number | null) => void
    goToPrevMonth: () => void
    goToNextMonth: () => void
    goToToday: () => void
    togglePlatform: (platform: Platform) => void
    toggleStatus: (status: ScriptStatus) => void
    toggleTag: (tagUuid: string) => void
}

const today = new Date()

export const useCalendarStore = createResettableStore<CalendarState & CalendarAction>()(
    persist(
        (set) => ({
            currentMonth: today.getMonth(),
            currentYear: today.getFullYear(),
            selectedDay: null,
            selectedPlatforms: [],
            selectedStatuses: [],
            selectedTagUuids: [],

            setCurrentMonth: (month) => set({ currentMonth: month, selectedDay: null }),
            setCurrentYear: (year) => set({ currentYear: year }),
            setSelectedDay: (day) => set({ selectedDay: day }),
            goToPrevMonth: () => set((state) => state.currentMonth === 0
                ? { currentMonth: 11, currentYear: state.currentYear - 1, selectedDay: null }
                : { currentMonth: state.currentMonth - 1, selectedDay: null }
            ),
            goToNextMonth: () => set((state) => state.currentMonth === 11
                ? { currentMonth: 0, currentYear: state.currentYear + 1, selectedDay: null }
                : { currentMonth: state.currentMonth + 1, selectedDay: null }
            ),
            goToToday: () => {
                const now = new Date()
                set({ currentMonth: now.getMonth(), currentYear: now.getFullYear(), selectedDay: null })
            },
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
