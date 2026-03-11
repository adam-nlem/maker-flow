import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeState = {
    isDark: boolean
}

type ThemeAction = {
    toggleTheme: () => void
}

function applyThemeClass(isDark: boolean) {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark)
    }
}

export const useThemeStore = create<ThemeState & ThemeAction>()(
    persist(
        (set) => ({
            isDark: true,
            toggleTheme: () =>
                set((state) => {
                    const next = !state.isDark
                    applyThemeClass(next)
                    return { isDark: next }
                }),
        }),
        {
            name: 'app:theme',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyThemeClass(state.isDark)
                }
            },
        }
    )
)
