
import type { ModuleWidgetProps } from "~/modules/registry";
import { useListTodoLists } from "../hooks/api/todoLists/useListTodoLists";
import { useListPaginatedTodoListTasks } from "../hooks/api/todoListTasks/useListPaginatedTodoListTasks";
import { useUpdateTodoListTask } from "../hooks/api/todoListTasks/useUpdateTodoListTask";
import type { TodoListTask } from "../models/TodoListTask";
import { TodoListStatus } from "../models/enums/TodoListStatus";
import DetailTodoListTaskModal from "./todoListTasks/DetailTodoListTaskModal";
import TodoListTasksBoard from "./todoListTasks/TodoListTasksBoard";
import CreateTodoListModal from "./todoLists/CreateTodoListModal";
import TodoListTile from "./todoLists/TodoListTile";
import { ChevronUpDownIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { TodoList } from "../models/TodoList";
import SelectItemModal from "~/components/ui/SelectItemModal";
import useSelectFocusedTodoList from "../hooks/api/todoLists/useSelectFocusedTodoList";
import UpdateTodoListModal from "./todoLists/UpdateTodoListModal";
import { useSelectTodoListModalStore } from "../stores/todoLists/selectTodoListModalStore";
import { useCreateTodoListModalStore } from "../stores/todoLists/createTodoListModalStore";
import { useUpdateTodoListStore } from "../stores/todoLists/updateTodoListStore";
import { useSelectTodoListTaskStore } from "../stores/todoListTasks/selectTodoListTaskStore";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { todoLists } = useListTodoLists({ userModuleUuid })

    console.log(todoLists)

    const { focusedTodoListUuid, setFocusedTodoListUuid } = useSelectFocusedTodoList({ todoLists })

    const focusedTodoList = todoLists.find((todoList) => todoList.uuid === focusedTodoListUuid) ?? null

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

    const selectedTaskUuid = useSelectTodoListTaskStore((state) => state.selectedTaskUuid)
    const setSelectedTaskUuid = useSelectTodoListTaskStore((state) => state.setSelectedTaskUuid)
    const selectedTask = todoListTasksGroupedByStatus
        .flatMap((group) => group.todoListTasks)
        .find((task) => task.uuid === selectedTaskUuid) ?? null

    const isSelectTodoListModalOpen = useSelectTodoListModalStore((state) => state.isSelectModalOpen)
    const setIsSelectTodoListModalOpen = useSelectTodoListModalStore((state) => state.setIsSelectModalOpen)
    const isCreateTodoListModalOpen = useCreateTodoListModalStore((state) => state.isCreateModalOpen)
    const setIsCreateTodoListModalOpen = useCreateTodoListModalStore((state) => state.setIsCreateModalOpen)
    const updatingTodoListUuid = useUpdateTodoListStore((state) => state.updatingTodoListUuid)
    const setUpdatingTodoListUuid = useUpdateTodoListStore((state) => state.setUpdatingTodoListUuid)


    return (
        <div className="m-5 w-1/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                {focusedTodoList && <TodoListTile todoList={focusedTodoList} rightIcon={
                    <ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />
                }
                    onClick={() => setIsSelectTodoListModalOpen(true)} />}
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
                    onTaskClick={(task) => setSelectedTaskUuid(task.uuid)}
                    getTaskByUuid={getTaskByUuid}
                    onTaskMoved={handleTaskMoved}
                />
            </div>

            <SelectItemModal<TodoList>
                showModal={isSelectTodoListModalOpen}
                items={todoLists}
                selectedItemId={focusedTodoList?.uuid}
                getItemId={(todoList) => todoList.uuid}
                onSelect={(todoList) => setFocusedTodoListUuid(todoList.uuid)}
                onClose={() => setIsSelectTodoListModalOpen(false)}
                onClickCreateButton={() => setIsCreateTodoListModalOpen(!isCreateTodoListModalOpen)}
                createButtonLabel="Créer une nouvelle Todo List"
                renderItem={({ item, isSelected, onSelect }) => (
                    <TodoListTile
                        todoList={item}
                        isSelected={isSelected}
                        showCreatedAt={true}
                        onHoverRightIcon={<PencilSquareIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} onClick={(e) => {
                            e.stopPropagation() // Prevents the click event from bubbling up to the onSelect handler
                            setUpdatingTodoListUuid(item.uuid)
                        }} />}
                        onClick={onSelect}
                    />
                )}
            />

            <CreateTodoListModal
                userModuleUuid={userModuleUuid}
                showModal={isCreateTodoListModalOpen}
                onClose={() => setIsCreateTodoListModalOpen(false)}
                onTodoListCreated={() => setIsCreateTodoListModalOpen(false)} />

            {updatingTodoListUuid &&
                <UpdateTodoListModal
                    todoList={todoLists.find((todoList) => todoList.uuid === updatingTodoListUuid)}
                    showModal={updatingTodoListUuid !== null}
                    onClose={() => setUpdatingTodoListUuid(null)}
                />
            }
            {selectedTask && focusedTodoList && (
                <DetailTodoListTaskModal
                    todoListUuid={focusedTodoList.uuid}
                    task={selectedTask}
                    showModal={selectedTask !== null}
                    onClose={() => setSelectedTaskUuid(null)}
                    onTaskDeleted={() => setSelectedTaskUuid(null)}
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
