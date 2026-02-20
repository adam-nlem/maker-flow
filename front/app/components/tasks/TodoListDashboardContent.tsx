import { useListPaginatedTodoListTasks } from "~/hooks/api/todoListTasks/useListPaginatedTodoListTasks"
import { useUpdateTodoListTask } from "~/hooks/api/todoListTasks/useUpdateTodoListTask"
import { TodoListStatus } from "~/models/enums/TodoListStatus"
import DetailTodoListTaskModal from "./todoListTasks/DetailTodoListTaskModal"
import TodoListTasksBoard from "./todoListTasks/TodoListTasksBoard"
import CreateTodoListModal from "./todoLists/CreateTodoListModal"
import TodoListTile from "./todoLists/TodoListTile"
import { ChevronUpDownIcon, PencilSquareIcon } from "@heroicons/react/24/outline"
import { TodoList } from "~/models/TodoList"
import SelectDropdown from "~/components/ui/SelectDropdown"
import UpdateTodoListModal from "./todoLists/UpdateTodoListModal"
import { useCreateTodoListModalStore } from "~/stores/todoLists/createTodoListModalStore"
import { useUpdateTodoListStore } from "~/stores/todoLists/updateTodoListStore"
import { useSelectTodoListTaskStore } from "~/stores/todoListTasks/selectTodoListTaskStore"

interface TodoListDashboardContentProps {
    projectUuid: string;
    todoLists: TodoList[];
    focusedTodoList: TodoList;
    setFocusedTodoListUuid: (uuid: string) => void;
}

export default function TodoListDashboardContent({
    projectUuid,
    todoLists,
    focusedTodoList,
    setFocusedTodoListUuid
}: TodoListDashboardContentProps) {
    const {
        todoListTasksGroupedByStatus,
        paginationByStatus,
        isLoading,
        listMoreForStatus,
        getTaskByUuid
    } = useListPaginatedTodoListTasks({ todoListUuid: focusedTodoList.uuid, limit: 10 })

    const { updateTodoListTask } = useUpdateTodoListTask()

    const selectedTaskUuid = useSelectTodoListTaskStore((state) => state.selectedTaskUuid)
    const setSelectedTaskUuid = useSelectTodoListTaskStore((state) => state.setSelectedTaskUuid)

    const isCreateTodoListModalOpen = useCreateTodoListModalStore((state) => state.isCreateModalOpen)
    const setIsCreateTodoListModalOpen = useCreateTodoListModalStore((state) => state.setIsCreateModalOpen)

    const updatingTodoListUuid = useUpdateTodoListStore((state) => state.updatingTodoListUuid)
    const setUpdatingTodoListUuid = useUpdateTodoListStore((state) => state.setUpdatingTodoListUuid)

    const selectedTask = todoListTasksGroupedByStatus
        .flatMap((group) => group.todoListTasks)
        .find((task) => task.uuid === selectedTaskUuid) ?? null

    return (
        <div className="p-5 w-1/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                <SelectDropdown<TodoList>
                    items={todoLists}
                    selectedItemId={focusedTodoList.uuid}
                    getItemId={(todoList) => todoList.uuid}
                    onSelect={(todoList) => setFocusedTodoListUuid(todoList.uuid)}
                    onClickCreateButton={() => setIsCreateTodoListModalOpen(!isCreateTodoListModalOpen)}
                    createButtonLabel="Créer une nouvelle Todo List"
                    renderTrigger={({ onClick }) => (
                        <TodoListTile
                            todoList={focusedTodoList}
                            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                            onClick={onClick}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <TodoListTile
                            todoList={item}
                            isSelected={isSelected}
                            showCreatedAt={true}
                            onHoverRightIcon={<PencilSquareIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} onClick={(e) => {
                                e.stopPropagation()
                                setUpdatingTodoListUuid(item.uuid)
                            }} />}
                            onClick={onSelect}
                        />
                    )}
                />
            </div>

            <div className="flex flex-row gap-1.5 flex-1 min-h-0">
                <TodoListTasksBoard
                    todoListUuid={focusedTodoList.uuid}
                    taskGroups={todoListTasksGroupedByStatus}
                    paginationByStatus={paginationByStatus}
                    isLoading={isLoading}
                    onLoadMore={listMoreForStatus}
                    onTaskClick={(task) => setSelectedTaskUuid(task.uuid)}
                    getTaskByUuid={getTaskByUuid}
                    onTaskMoved={handleTaskMoved}
                />
            </div>

            <CreateTodoListModal
                projectUuid={projectUuid}
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
            {selectedTask && (
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
            todoListUuid: focusedTodoList.uuid,
            data: { status }
        });
    }
}
