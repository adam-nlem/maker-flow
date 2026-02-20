import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoList } from "~/models/TodoList";
import { todoListQueryKeys } from "./todoListQueryKeys";

interface UpdateTodoListData {
    todoListUuid: string;
    title: string;
}

export function useUpdateTodoList() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ todoListUuid, title }: UpdateTodoListData) => {
            await httpClient.patch(
                `/todo-lists/${todoListUuid}`,
                { title }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: todoListQueryKeys.all })
        },
    })

    return {
        updateTodoList: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
