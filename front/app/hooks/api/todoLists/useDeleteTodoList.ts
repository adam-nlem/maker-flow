import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { todoListQueryKeys } from "./todoListQueryKeys";

export function useDeleteTodoList() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (todoListUuid: string) => {
            await httpClient.delete(`/todo-lists/${todoListUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: todoListQueryKeys.all })
        },
    })

    return {
        deleteTodoList: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}