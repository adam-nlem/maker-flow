import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import type { TodoListPriority } from "../../models/enums/TodoListPriority";
import type { TodoListStatus } from "../../models/enums/TodoListStatus";
import type { TodoListTag } from "../../models/TodoListTag";
import { TodoListTask } from "../../models/TodoListTask";
import { todoListTaskQueryKeys } from "./todoListTaskQueryKeys";


interface CreateTodoListTaskData {
    title: string;
    content?: string;
    priority?: TodoListPriority;
    status?: TodoListStatus;
    dueDate?: Date;
    tags?: TodoListTag[];
}

export function useCreateTodoListTask({ todoListUuid }: { todoListUuid: string }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateTodoListTaskData) => {
            await httpClient.post('/modules/todo-lists/tasks', {
                "todoListUuid": todoListUuid,
                "title": data.title,
                "content": data.content,
                "priority": data.priority,
                "status": data.status,
                "dueDate": data.dueDate ? data.dueDate.toLocaleDateString('sv-SE') : undefined,
                "tagUuids": data.tags?.map((tag) => tag.uuid),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: todoListTaskQueryKeys.list(todoListUuid) })
        },
    })

    return {
        createTodoListTask: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
