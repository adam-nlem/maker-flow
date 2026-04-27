import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'

type ChatState = {
    activeChatUuid: string | null
    isWaitingForAi: boolean
    isCreatingChat: boolean
}

type ChatActions = {
    setActiveChatUuid: (uuid: string | null) => void
    setIsWaitingForAi: (waiting: boolean) => void
    setIsCreatingChat: (creating: boolean) => void
}

export const useChatStore = createResettableStore<ChatState & ChatActions>()(
    persist(
        (set) => ({
            activeChatUuid: null,
            isWaitingForAi: false,
            isCreatingChat: false,
            setActiveChatUuid: (uuid) => set({
                activeChatUuid: uuid,
                isWaitingForAi: false,
            }),
            setIsWaitingForAi: (waiting) => set({ isWaitingForAi: waiting }),
            setIsCreatingChat: (creating) => set({ isCreatingChat: creating }),
        }),
        {
            name: 'app:scripts:chat',
        }
    )
)
