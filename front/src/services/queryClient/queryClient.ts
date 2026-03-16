import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { handleMutationError } from "~/services/apiErrorHandler/apiErrorHandler"
import type { CustomHttpException } from "~/services/httpClient/customHttpExceptions"

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            handleMutationError(error as unknown as CustomHttpException)
        }
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            handleMutationError(error as unknown as CustomHttpException)
        }
    }),
})
