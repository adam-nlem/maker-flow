import { useQuery } from "@tanstack/react-query";
import { TodoList, type TodoListJSON } from "~/models/TodoList";
import { httpClient } from "~/services/httpClient/httpClient";
import { todoListQueryKeys } from "./todoListQueryKeys";

export function useListTodoLists({ projectUuid }: { projectUuid: string | null }) {
  const query = useQuery({
    queryKey: todoListQueryKeys.list(projectUuid ?? ''),
    queryFn: async () => {
      const res = await httpClient.get('/todo-lists', {
        params: {
          "projectUuid": projectUuid
        }
      })
      return res.data.map((json: TodoListJSON) => TodoList.fromJSON(json)) as TodoList[]
    },
    enabled: !!projectUuid,
  })

  return {
    todoLists: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
