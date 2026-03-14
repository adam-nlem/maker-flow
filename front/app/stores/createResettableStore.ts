import { create as zustandCreate } from 'zustand'
import type { StateCreator } from 'zustand'

const storeResetFns = new Set<() => void>()

export const resetAllStores = (): void => {
    storeResetFns.forEach((resetFn) => resetFn())
}

export const createResettableStore = (<T>() => {
    return (stateCreator: StateCreator<T>) => {
        const store = zustandCreate<T>()(stateCreator)
        storeResetFns.add(() => {
            store.setState(store.getInitialState(), true)
        })
        return store
    }
}) as typeof zustandCreate
