import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import type { Color } from "~/models/enums/Color";
import { TodoListTag } from "~/models/TodoListTag";
import { todoListTagQueryKeys } from "./todoListTagQueryKeys";

interface UpdateTodoListTagData {
    tagUuid: string;
    title: string;
    color: Color;
}

export function useUpdateTodoListTag() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ tagUuid, title, color }: UpdateTodoListTagData) => {
            await httpClient.patch(`/todo-lists/tags/${tagUuid}`, {
                "title": title,
                "color": color,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: todoListTagQueryKeys.all })
        },
    })

    return {
        updateTodoListTag: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
