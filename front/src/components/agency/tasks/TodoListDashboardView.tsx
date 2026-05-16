import { useListTodoLists } from "~/hooks/api/todoLists/useListTodoLists";
import useSelectFocusedTodoList from "~/hooks/api/todoLists/useSelectFocusedTodoList";
import CreateTodoListModal from "./todoLists/CreateTodoListModal";
import TodoListDashboardContent from "./TodoListDashboardContent";

export default function TodoListDashboardView({ projectUuid }: { projectUuid: string }) {
    const { todoLists } = useListTodoLists({ projectUuid })
    const { focusedTodoListUuid, setFocusedTodoListUuid } = useSelectFocusedTodoList({ todoLists })

    const focusedTodoList = todoLists.find((todoList) => todoList.uuid === focusedTodoListUuid) ?? null

    if (todoLists.length === 0 || !focusedTodoList) {
        return (
            <div className="flex flex-col items-center justify-center h-full">

                <CreateTodoListModal projectUuid={projectUuid} showModal={true} onClose={() => {}} onTodoListCreated={() => {}} />
            </div>
        )
    }

    return (
        <TodoListDashboardContent
            projectUuid={projectUuid}
            todoLists={todoLists}
            focusedTodoList={focusedTodoList}
            setFocusedTodoListUuid={setFocusedTodoListUuid}
        />
    );
}
