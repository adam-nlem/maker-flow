import { useQuery } from "@tanstack/react-query";
import { TodoList, type TodoListJSON } from "../../models/TodoList";
import { httpClient } from "~/services/httpClient/httpClient";
import { todoListQueryKeys } from "./todoListQueryKeys";

export function useListTodoLists({ userModuleUuid }: { userModuleUuid: string }) {
  const query = useQuery({
    queryKey: todoListQueryKeys.list(userModuleUuid),
    queryFn: async () => {
      const res = await httpClient.get('/modules/todo-lists', {
        params: {
          "userModuleUuid": userModuleUuid
        }
      })
      return res.data.map((json: TodoListJSON) => TodoList.fromJSON(json))
    },
  })

  return {
    todoLists: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
