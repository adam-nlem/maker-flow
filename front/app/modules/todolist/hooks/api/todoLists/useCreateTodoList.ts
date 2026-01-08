import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoList } from "../../../models/TodoList";
import { todoListQueryKeys } from "./todoListQueryKeys";


export function useCreateTodoList({ userModuleUuid }: { userModuleUuid: string }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (title: string) => {
            await httpClient.post('/modules/todo-lists', {
                "userModuleUuid": userModuleUuid,
                "title": title,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: todoListQueryKeys.all })
        },
    })

    return {
        createTodoList: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}