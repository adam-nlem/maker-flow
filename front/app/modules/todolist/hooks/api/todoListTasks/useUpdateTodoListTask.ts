import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoListTask } from "../../../models/TodoListTask";
import type { TodoListTag } from "../../../models/TodoListTag";
import type { TodoListPriority } from "../../../models/enums/TodoListPriority";
import type { TodoListStatus } from "../../../models/enums/TodoListStatus";
import { todoListTaskQueryKeys } from "./todoListTaskQueryKeys";


interface UpdateTodoListTaskData {
    title?: string;
    content?: string;
    status?: TodoListStatus;
    priority?: TodoListPriority | null;
    dueDate?: Date | null;
    tags?: TodoListTag[];
}

interface UpdateTodoListTaskParams {
    taskUuid: string;
    todoListUuid: string;
    data: UpdateTodoListTaskData;
}

export function useUpdateTodoListTask() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ taskUuid, data }: UpdateTodoListTaskParams) => {
            await httpClient.patch(`/modules/todo-lists/tasks/${taskUuid}`, {
                ...data,
                dueDate: data.dueDate !== undefined
                    ? (data.dueDate ? data.dueDate.toLocaleDateString('sv-SE') : null)
                    : undefined,
                tagUuids: data.tags?.map((tag) => tag.uuid),
            })
        },
        onSuccess: (_, { todoListUuid }) => {
            queryClient.invalidateQueries({ queryKey: todoListTaskQueryKeys.list(todoListUuid) })
        },
    })

    return {
        updateTodoListTask: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
