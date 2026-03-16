import { resetAllStores } from '~/stores/createResettableStore'
import { queryClient } from '~/services/queryClient/queryClient'

export function clearSessionData(): void {
    resetAllStores()
    queryClient.cancelQueries()
    queryClient.clear()
}
