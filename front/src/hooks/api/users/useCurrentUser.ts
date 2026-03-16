import { useQuery } from "@tanstack/react-query"
import { User } from "~/models/User"
import { UnauthorizedException } from "~/services/httpClient/customHttpExceptions"
import { httpClient } from "~/services/httpClient/httpClient"
import { userQueryKeys } from "./userQueryKeys"

export function useCurrentUser() {
    const query = useQuery({
        queryKey: userQueryKeys.me,
        queryFn: async () => {
            try {
                const res = await httpClient.get('/users/me')
                return User.fromJSON(res.data)
            } catch (err) {
                if (err instanceof UnauthorizedException) {
                    return null
                }
                throw err
            }
        },
        retry: false,
        staleTime: Infinity,
    })

    return {
        user: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    }
}
