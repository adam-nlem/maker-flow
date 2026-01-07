import { useState } from "react";

import type { ModuleWidgetProps } from "~/modules/registry";
import { useListTodoLists } from "../hooks/todoLists/useListTodoLists";
import { useListPaginatedTodoListTasks } from "../hooks/todoListTasks/useListPaginatedTodoListTasks";
import { useUpdateTodoListTask } from "../hooks/todoListTasks/useUpdateTodoListTask";
import type { TodoListTask } from "../models/TodoListTask";
import { TodoListStatus } from "../models/enums/TodoListStatus";
import DetailTodoListTaskModal from "./todoListTasks/DetailTodoListTaskModal";
import TodoListTasksBoard from "./todoListTasks/TodoListTasksBoard";
import CreateTodoListModal from "./todoLists/CreateTodoListModal";
import TodoListTile from "./todoLists/TodoListTile";
import { ChevronUpDownIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { TodoList } from "../models/TodoList";
import SelectItemModal from "~/components/ui/SelectItemModal";
import useSelectFocusedTodoList from "../hooks/todoLists/useSelectFocusedTodoList";
import UpdateTodoListModal from "./todoLists/UpdateTodoListModal";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { todoLists } = useListTodoLists({ userModuleUuid })

    const { focusedTodoList, setFocusedTodoList } = useSelectFocusedTodoList({ todoLists: todoLists })

    const {
        todoListTasksGroupedByStatus,
        paginationByStatus,
        isLoading,
        isLoadingMore,
        error,
        listMoreForStatus,
        getTaskByUuid
    } = useListPaginatedTodoListTasks({ todoListUuid: focusedTodoList?.uuid, limit: 10 })

    const { updateTodoListTask } = useUpdateTodoListTask()

    const [selectedTask, setSelectedTask] = useState<TodoListTask | null>(null)

    const [showSelectFocusedTodoListModal, setShowSelectFocusedTodoListModal] = useState(false);
    const [showCreateTodoListModal, setShowCreateTodoListModal] = useState(false)
    const [updatingTodoList, setUpdatingTodoList] = useState<TodoList | null>(null)

    return (
        <div className="m-5 w-1/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                {focusedTodoList && <TodoListTile todoList={focusedTodoList} rightIcon={
                    <ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />
                }
                    onClick={() => setShowSelectFocusedTodoListModal(true)} />}
                {/* <UpdateTodoListHeader
                    todoList={focusedTodoList}
                    hideChevronLeft={hideChevronLeft}
                    isLastTodoList={isLastTodoList}
                    onGoToPrevious={goToPrevious}
                    onGoToNext={goToNext}
                    onShowCreateTodoListModal={() => setShowCreateTodoListModal(true)}
                    onTodoListUdated={(todoList) => syncTodoListInList(todoList)}
                /> */}
            </div>

            <div className="flex flex-row gap-1.5 flex-1 min-h-0">
                <TodoListTasksBoard
                    todoListUuid={focusedTodoList?.uuid}
                    taskGroups={todoListTasksGroupedByStatus}
                    paginationByStatus={paginationByStatus}
                    isLoading={isLoading}
                    onLoadMore={listMoreForStatus}
                    onTaskClick={setSelectedTask}
                    getTaskByUuid={getTaskByUuid}
                    onTaskMoved={handleTaskMoved}
                />
            </div>

            <SelectItemModal<TodoList>
                showModal={showSelectFocusedTodoListModal}
                items={todoLists}
                selectedItemId={focusedTodoList?.uuid}
                getItemId={(todoList) => todoList.uuid}
                onSelect={setFocusedTodoList}
                onClose={() => setShowSelectFocusedTodoListModal(false)}
                onClickCreateButton={() => setShowCreateTodoListModal(!showCreateTodoListModal)}
                createButtonLabel="Créer une nouvelle Todo List"
                renderItem={({ item, isSelected, onSelect }) => (
                    <TodoListTile
                        todoList={item}
                        isSelected={isSelected}
                        showCreatedAt={true}
                        onHoverRightIcon={<PencilSquareIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} onClick={(e) => {
                            e.stopPropagation() // Prevents the click event from bubbling up to the onSelect handler
                            setUpdatingTodoList(item)
                        }} />}
                        onClick={onSelect}
                    />
                )}
            />

            <CreateTodoListModal
                userModuleUuid={userModuleUuid}
                showModal={showCreateTodoListModal}
                onClose={() => setShowCreateTodoListModal(false)}
                onTodoListCreated={() => setShowCreateTodoListModal(false)} />

            <UpdateTodoListModal
                todoList={updatingTodoList!}
                showModal={updatingTodoList !== null}
                onClose={() => setUpdatingTodoList(null)}
                onTodoListUpdated={() => setUpdatingTodoList(null)}
                onTodoListDeleted={() => setUpdatingTodoList(null)} />

            {selectedTask && focusedTodoList && (
                <DetailTodoListTaskModal
                    todoListUuid={focusedTodoList.uuid}
                    task={selectedTask}
                    showModal={selectedTask !== null}
                    onClose={() => setSelectedTask(null)}
                    onTaskDeleted={() => setSelectedTask(null)}
                />
            )}
        </div>
    );

    async function handleTaskMoved(taskUuid: string, status: TodoListStatus) {
        await updateTodoListTask({
            taskUuid,
            todoListUuid: focusedTodoList!.uuid,
            data: { status }
        });
    }
}
