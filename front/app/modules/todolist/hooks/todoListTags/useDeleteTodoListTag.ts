import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { todoListTagQueryKeys } from "./todoListTagQueryKeys";


export function useDeleteTodoListTag() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (tagUuid: string) => {
            await httpClient.delete(`/modules/todo-lists/tags/${tagUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: todoListTagQueryKeys.all })
        },
    })

    return {
        deleteTodoListTag: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}