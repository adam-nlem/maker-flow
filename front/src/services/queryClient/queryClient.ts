import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { handleMutationError } from "~/services/apiErrorHandler/apiErrorHandler"
import type { HttpException } from "~/services/httpClient/HttpException"

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            handleMutationError(error as unknown as HttpException)
        }
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            handleMutationError(error as unknown as HttpException)
        }
    }),
})
