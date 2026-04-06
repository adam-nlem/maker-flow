import { create } from 'zustand'
import type { Platform } from '~/models/enums/Platform'

type IntegrationLoginModalState = {
    selectedPlatform: Platform | null
}

type IntegrationLoginModalAction = {
    setSelectedPlatform: (platform: Platform | null) => void
}

export const useIntegrationLoginModalStore = create<IntegrationLoginModalState & IntegrationLoginModalAction>((set) => ({
    selectedPlatform: null,
    setSelectedPlatform: (platform) => set({ selectedPlatform: platform })
}))
