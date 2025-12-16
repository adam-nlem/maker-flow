import { useState } from "react";

import type { ModuleWidgetProps } from "~/modules/registry";
import { useListTodoLists } from "../hooks/todoLists/useListTodoLists";
import useSelectCurrentTodoListView from "../hooks/todoLists/useSelectCurrentTodoListView";
import { useListPaginatedTodoListTasks } from "../hooks/todoListTasks/useListPaginatedTodoListTasks";
import { useUpdateTodoListTask } from "../hooks/todoListTasks/useUpdateTodoListTask";
import type { TodoListTask } from "../models/TodoListTask";
import { TodoListStatus } from "../models/enums/TodoListStatus";
import DetailTodoListTaskModal from "./todoListTasks/DetailTodoListTaskModal";
import TodoListTasksBoard from "./todoListTasks/TodoListTasksBoard";
import UpdateTodoListHeader from "./todoLists/UpdateTodoListHeader";
import CreateTodoListModal from "./todoLists/CreateTodoListModal";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { todoLists, syncTodoListInList } = useListTodoLists({ userModuleUuid })

    const { currentTodoList, goToPrevious, goToNext, isLastTodoList } = useSelectCurrentTodoListView({ todoLists })

    const {
        todoListTasksGroupedByStatus,
        paginationByStatus,
        isLoading,
        isLoadingMore,
        errorMessage,
        listMoreForStatus,
        syncTaskInGroups,
        removeTaskFromGroups,
        getTaskByUuid
    } = useListPaginatedTodoListTasks({ todoListUuid: currentTodoList?.uuid, limit: 10 })

    const { updateTodoListTask, errorMessage: updateTaskErrorMessage } = useUpdateTodoListTask()

    const [selectedTask, setSelectedTask] = useState<TodoListTask | null>(null)

    const [showCreateTodoListModal, setShowCreateTodoListModal] = useState(false)

    const hideChevronLeft = (todoLists.length > 1 || !isLastTodoList)

    return (
        <div className="m-5 w-1/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                <UpdateTodoListHeader
                    todoList={currentTodoList}
                    hideChevronLeft={hideChevronLeft}
                    isLastTodoList={isLastTodoList}
                    onGoToPrevious={goToPrevious}
                    onGoToNext={goToNext}
                    onShowCreateTodoListModal={() => setShowCreateTodoListModal(true)}
                    onTodoListUdated={(todoList) => syncTodoListInList(todoList)}
                />
            </div>

            <div className="flex flex-row gap-1.5 flex-1 min-h-0">
                <TodoListTasksBoard
                    todoListUuid={currentTodoList?.uuid}
                    taskGroups={todoListTasksGroupedByStatus}
                    paginationByStatus={paginationByStatus}
                    isLoading={isLoading}
                    onLoadMore={listMoreForStatus}
                    onTaskClick={setSelectedTask}
                    onTaskCreated={syncTaskInGroups}
                    getTaskByUuid={getTaskByUuid}
                    onTaskMoved={handleTaskMoved}
                />
            </div>

            {showCreateTodoListModal && <CreateTodoListModal
                userModuleUuid={userModuleUuid}
                showModal={showCreateTodoListModal}
                onClose={() => setShowCreateTodoListModal(false)}
                onTodoListCreated={(todoList) => {
                    syncTodoListInList(todoList)
                    //! The new todo list is added at the end of the list
                    //! so this works for now
                    goToNext()
                }} />}

            {selectedTask && currentTodoList && (
                <DetailTodoListTaskModal
                    todoListUuid={currentTodoList.uuid}
                    task={selectedTask}
                    showModal={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onTaskUpdated={syncTaskInGroups}
                    onTaskDeleted={(deletedTaskUuid) => {
                        removeTaskFromGroups(deletedTaskUuid);
                        setSelectedTask(null);
                    }}
                />
            )}
        </div>
    );

    async function handleTaskMoved(taskUuid: string, status: TodoListStatus) {
        const updatedTask = await updateTodoListTask(taskUuid, { status });
        if (updatedTask && updateTaskErrorMessage === null) {
            syncTaskInGroups(updatedTask);
        }
    }
}
