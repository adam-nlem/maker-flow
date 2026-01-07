import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoListStatus } from "../../models/enums/TodoListStatus";
import { TodoListTasksGroupedByStatusDTO, type TodoListTasksGroupedByStatusDTOJSON } from "../../dtos/TodoListTasksGroupedByStatusDTO";
import type { TodoListTask } from "../../models/TodoListTask";
import { todoListTaskQueryKeys } from "./todoListTaskQueryKeys";

interface UseListPaginatedTodoListTasksProps {
    todoListUuid: string | undefined;
    limit: number;
}

interface PaginationState {
    page: number;
    hasMore: boolean;
}

export function useListPaginatedTodoListTasks({ todoListUuid, limit = 10 }: UseListPaginatedTodoListTasksProps) {
    const [paginationByStatus, setPaginationByStatus] = useState<Record<TodoListStatus, PaginationState>>({
        [TodoListStatus.Pending]: { page: 1, hasMore: true },
        [TodoListStatus.InProgress]: { page: 1, hasMore: true },
        [TodoListStatus.Completed]: { page: 1, hasMore: true },
    });
    const [additionalTasksByStatus, setAdditionalTasksByStatus] = useState<Record<TodoListStatus, TodoListTask[]>>({
        [TodoListStatus.Pending]: [],
        [TodoListStatus.InProgress]: [],
        [TodoListStatus.Completed]: [],
    });
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: todoListTaskQueryKeys.list(todoListUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/modules/todo-lists/tasks`, {
                params: {
                    todoListUuid,
                    page: 1,
                    limit,
                }
            });

            const groupedData: TodoListTasksGroupedByStatusDTO[] = res.data.map((json: TodoListTasksGroupedByStatusDTOJSON) =>
                TodoListTasksGroupedByStatusDTO.fromJSON(json)
            );

            setPaginationByStatus({
                [TodoListStatus.Pending]: { page: 1, hasMore: groupedData.find((g: TodoListTasksGroupedByStatusDTO) => g.status === TodoListStatus.Pending)?.todoListTasks.length === limit },
                [TodoListStatus.InProgress]: { page: 1, hasMore: groupedData.find((g: TodoListTasksGroupedByStatusDTO) => g.status === TodoListStatus.InProgress)?.todoListTasks.length === limit },
                [TodoListStatus.Completed]: { page: 1, hasMore: groupedData.find((g: TodoListTasksGroupedByStatusDTO) => g.status === TodoListStatus.Completed)?.todoListTasks.length === limit },
            });

            setAdditionalTasksByStatus({
                [TodoListStatus.Pending]: [],
                [TodoListStatus.InProgress]: [],
                [TodoListStatus.Completed]: [],
            });

            return groupedData;
        },
        enabled: !!todoListUuid,
    })

    const todoListTasksGroupedByStatus = useMemo(() => {
        if (!query.data) return [];
        return query.data.map(group => {
            const additional = additionalTasksByStatus[group.status] ?? [];
            return new TodoListTasksGroupedByStatusDTO(
                group.status,
                [...group.todoListTasks, ...additional]
            );
        });
    }, [query.data, additionalTasksByStatus]);

    const listMoreForStatus = useCallback(async (status: TodoListStatus) => {
        const currentPagination = paginationByStatus[status];
        if (isLoadingMore || !currentPagination.hasMore) return;

        setIsLoadingMore(true);
        const nextPage = currentPagination.page + 1;

        try {
            const res = await httpClient.get(`/modules/todo-lists/tasks`, {
                params: {
                    todoListUuid,
                    page: nextPage,
                    limit,
                    status,
                }
            });

            const groupedData: TodoListTasksGroupedByStatusDTO[] = res.data.map((json: TodoListTasksGroupedByStatusDTOJSON) =>
                TodoListTasksGroupedByStatusDTO.fromJSON(json)
            );

            const newTasks = groupedData[0]?.todoListTasks ?? [];

            setAdditionalTasksByStatus(prev => ({
                ...prev,
                [status]: [...prev[status], ...newTasks],
            }));

            setPaginationByStatus(prev => ({
                ...prev,
                [status]: { page: nextPage, hasMore: newTasks.length === limit },
            }));
        } finally {
            setIsLoadingMore(false);
        }
    }, [todoListUuid, limit, paginationByStatus, isLoadingMore]);

    const getTaskByUuid = useCallback((taskUuid: string): TodoListTask | undefined => {
        return todoListTasksGroupedByStatus.flatMap(g => g.todoListTasks).find(t => t.uuid === taskUuid);
    }, [todoListTasksGroupedByStatus]);

    return {
        todoListTasksGroupedByStatus,
        paginationByStatus,
        isLoading: query.isLoading,
        isLoadingMore,
        error: query.error,
        listMoreForStatus,
        getTaskByUuid,
    };
}