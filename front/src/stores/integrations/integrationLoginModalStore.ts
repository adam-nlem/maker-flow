import { createResettableStore } from '~/stores/createResettableStore'
import type { Platform } from '~/models/enums/Platform'

type IntegrationLoginModalState = {
    projectUuid: string | null
    selectedPlatform: Platform | null
}

type IntegrationLoginModalAction = {
    open: (projectUuid: string, platform: Platform) => void
    close: () => void
}

export const useIntegrationLoginModalStore = createResettableStore<IntegrationLoginModalState & IntegrationLoginModalAction>()((set) => ({
    projectUuid: null,
    selectedPlatform: null,
    open: (projectUuid, platform) => set({ projectUuid, selectedPlatform: platform }),
    close: () => set({ projectUuid: null, selectedPlatform: null }),
}))
