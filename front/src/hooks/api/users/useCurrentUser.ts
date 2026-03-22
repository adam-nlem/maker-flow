import { useQuery } from "@tanstack/react-query"
import { User } from "~/models/User"
import { HttpException } from "~/services/httpClient/HttpException"
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
                if (err instanceof HttpException && err.response.httpStatus === 401) {
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
