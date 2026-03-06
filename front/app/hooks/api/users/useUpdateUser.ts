import { useMutation, useQueryClient } from "@tanstack/react-query"
import { User } from "~/models/User"
import { httpClient } from "~/services/httpClient/httpClient"
import { userQueryKeys } from "./userQueryKeys"

interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: UpdateUserData) => {
            const res = await httpClient.patch('/users', data)
            return User.fromJSON(res.data)
        },
        onSuccess: (user) => {
            queryClient.setQueryData(userQueryKeys.me, user)
        },
    })

    return {
        updateUser: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
