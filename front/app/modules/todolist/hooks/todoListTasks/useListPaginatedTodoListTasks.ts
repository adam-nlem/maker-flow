import { useCallback, useEffect, useState } from "react";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";
import { TodoListStatus } from "../../models/enums/TodoListStatus";
import { TodoListTasksGroupedByStatusDTO, type TodoListTasksGroupedByStatusDTOJSON } from "../../dtos/TodoListTasksGroupedByStatusDTO";
import type { TodoListTask } from "../../models/TodoListTask";

interface UseListPaginatedTodoListTasksProps {
    todoListUuid: string | undefined;
    limit: number;
}

interface PaginationState {
    page: number;
    hasMore: boolean;
}

export function useListPaginatedTodoListTasks({ todoListUuid, limit = 10 }: UseListPaginatedTodoListTasksProps) {
    const [todoListTasksGroupedByStatus, setTodoListTasksGroupedByStatus] = useState<TodoListTasksGroupedByStatusDTO[]>([]);
    const [paginationByStatus, setPaginationByStatus] = useState<Record<TodoListStatus, PaginationState>>({
        [TodoListStatus.Pending]: { page: 1, hasMore: true },
        [TodoListStatus.InProgress]: { page: 1, hasMore: true },
        [TodoListStatus.Completed]: { page: 1, hasMore: true },
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const listInitialTasks = useCallback(async () => {
        setIsLoading(true);

        try {
            const res = await httpClient.get(`/modules/todo-lists/tasks`, {
                params: {
                    todoListUuid,
                    page: 1,
                    limit,
                }
            });

            const groupedData = res.data.map((json: TodoListTasksGroupedByStatusDTOJSON) =>
                TodoListTasksGroupedByStatusDTO.fromJSON(json)
            );

            setTodoListTasksGroupedByStatus(groupedData);

            setPaginationByStatus({
                [TodoListStatus.Pending]: { page: 1, hasMore: groupedData.find((g: TodoListTasksGroupedByStatusDTO) => g.status === TodoListStatus.Pending)?.todoListTasks.length === limit },
                [TodoListStatus.InProgress]: { page: 1, hasMore: groupedData.find((g: TodoListTasksGroupedByStatusDTO) => g.status === TodoListStatus.InProgress)?.todoListTasks.length === limit },
                [TodoListStatus.Completed]: { page: 1, hasMore: groupedData.find((g: TodoListTasksGroupedByStatusDTO) => g.status === TodoListStatus.Completed)?.todoListTasks.length === limit },
            });

            setErrorMessage(null);
        } catch (err) {
            setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    }, [todoListUuid, limit]);

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

            const groupedData = res.data.map((json: TodoListTasksGroupedByStatusDTOJSON) =>
                TodoListTasksGroupedByStatusDTO.fromJSON(json)
            );

            const newTasks = groupedData[0]?.todoListTasks ?? [];

            setTodoListTasksGroupedByStatus(prev =>
                prev.map(group => {
                    if (group.status === status) {
                        return new TodoListTasksGroupedByStatusDTO(
                            group.status,
                            [...group.todoListTasks, ...newTasks]
                        );
                    }
                    return group;
                })
            );

            setPaginationByStatus(prev => ({
                ...prev,
                [status]: { page: nextPage, hasMore: newTasks.length === limit },
            }));

            setErrorMessage(null);
        } catch (err) {
            setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue");
        } finally {
            setIsLoadingMore(false);
        }
    }, [todoListUuid, limit, paginationByStatus, isLoadingMore]);

    useEffect(() => {
        if (todoListUuid) {
            listInitialTasks();
        }
    }, [todoListUuid, listInitialTasks]);

    const getTaskByUuid = useCallback((taskUuid: string): TodoListTask | undefined => {
        return todoListTasksGroupedByStatus.flatMap(g => g.todoListTasks).find(t => t.uuid === taskUuid);
    }, [todoListTasksGroupedByStatus]);

    const syncTaskInGroups = useCallback((task: TodoListTask) => {
        setTodoListTasksGroupedByStatus(prev => {

            return prev.map(group => {
                const tasksWithoutMoved = group.todoListTasks.filter(t => t.uuid !== task.uuid);
                const tasks = group.status === task.status
                    ? [task, ...tasksWithoutMoved]
                    : tasksWithoutMoved;

                return new TodoListTasksGroupedByStatusDTO(group.status, tasks);
            });
        });
    }, []);

    const removeTaskFromGroups = useCallback((taskUuid: string) => {
        setTodoListTasksGroupedByStatus(prev => {
            return prev.map(group => {
                const filteredTasks = group.todoListTasks.filter(t => t.uuid !== taskUuid);
                return new TodoListTasksGroupedByStatusDTO(group.status, filteredTasks);
            });
        });
    }, []);

    return {
        todoListTasksGroupedByStatus,
        paginationByStatus,
        isLoading,
        isLoadingMore,
        errorMessage,
        listMoreForStatus,
        syncTaskInGroups,
        removeTaskFromGroups,
        getTaskByUuid,
    };
}