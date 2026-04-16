import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { handleMutationError } from "~/services/apiErrorHandler/apiErrorHandler"

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            handleMutationError(error)
        }
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            handleMutationError(error)
        }
    }),
})
