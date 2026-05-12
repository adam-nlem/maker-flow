import { create } from 'zustand'
import type { Platform } from '~/models/enums/Platform'

type IntegrationLoginModalState = {
    projectUuid: string | null
    selectedPlatform: Platform | null
}

type IntegrationLoginModalAction = {
    open: (projectUuid: string, platform: Platform) => void
    close: () => void
}

export const useIntegrationLoginModalStore = create<IntegrationLoginModalState & IntegrationLoginModalAction>((set) => ({
    projectUuid: null,
    selectedPlatform: null,
    open: (projectUuid, platform) => set({ projectUuid, selectedPlatform: platform }),
    close: () => set({ projectUuid: null, selectedPlatform: null }),
}))
