import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { todoListQueryKeys } from "./todoListQueryKeys";


export function useCreateTodoList({ projectUuid }: { projectUuid: string }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (title: string) => {
            await httpClient.post('/todo-lists', {
                "projectUuid": projectUuid,
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