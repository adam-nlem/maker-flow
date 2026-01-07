import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { todoListTaskQueryKeys } from "./todoListTaskQueryKeys";

interface DeleteTodoListTaskParams {
    taskUuid: string;
    todoListUuid: string;
}

export function useDeleteTodoListTask() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ taskUuid }: DeleteTodoListTaskParams) => {
            await httpClient.delete(`/modules/todo-lists/tasks/${taskUuid}`)
        },
        onSuccess: (_, { todoListUuid }) => {
            queryClient.invalidateQueries({ queryKey: todoListTaskQueryKeys.list(todoListUuid) })
        },
    })

    return {
        deleteTodoListTask: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}