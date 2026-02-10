import { create } from 'zustand'

export type ToastType = 'success' | 'error'

export type Toast = {
    id: string
    type: ToastType
    message: string
}

type ToastState = {
    toasts: Toast[]
}

type ToastAction = {
    addToast: (type: ToastType, message: string) => string
    removeToast: (id: string) => void
}

export const useToastStore = create<ToastState & ToastAction>((set) => ({
    toasts: [],
    addToast: (type, message) => {
        const id = crypto.randomUUID()
        set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
        return id
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
