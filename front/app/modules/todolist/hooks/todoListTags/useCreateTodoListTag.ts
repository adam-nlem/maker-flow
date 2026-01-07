import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import type { Color } from "~/models/enums/Color";
import { TodoListTag } from "../../models/TodoListTag";
import { todoListTagQueryKeys } from "./todoListTagQueryKeys";

interface CreateTodoListTagData {
    title: string;
    color: Color;
}

export function useCreateTodoListTag({ todoListUuid }: { todoListUuid: string }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateTodoListTagData) => {
            const res = await httpClient.post('/modules/todo-lists/tags', {
                "todoListUuid": todoListUuid,
                "title": data.title,
                "color": data.color,
            })
            return TodoListTag.fromJSON(res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: todoListTagQueryKeys.all })
        },
    })

    return {
        createTodoListTag: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
