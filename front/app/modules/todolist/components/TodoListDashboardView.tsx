import type { ModuleWidgetProps } from "~/modules/registry";
import { useListTodoLists } from "../hooks/api/todoLists/useListTodoLists";
import useSelectFocusedTodoList from "../hooks/api/todoLists/useSelectFocusedTodoList";
import CreateTodoListModal from "./todoLists/CreateTodoListModal";
import TodoListDashboardContent from "./TodoListDashboardContent";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { todoLists } = useListTodoLists({ userModuleUuid })
    const { focusedTodoListUuid, setFocusedTodoListUuid } = useSelectFocusedTodoList({ todoLists })

    const focusedTodoList = todoLists.find((todoList) => todoList.uuid === focusedTodoListUuid) ?? null

    if (todoLists.length === 0 || !focusedTodoList) {
        return (
            <div className="flex flex-col items-center justify-center h-full">

                <CreateTodoListModal userModuleUuid={userModuleUuid} showModal={true} onClose={() => {}} onTodoListCreated={() => {}} />
            </div>
        )
    }

    return (
        <TodoListDashboardContent
            userModuleUuid={userModuleUuid}
            todoLists={todoLists}
            focusedTodoList={focusedTodoList}
            setFocusedTodoListUuid={setFocusedTodoListUuid}
        />
    );
}
