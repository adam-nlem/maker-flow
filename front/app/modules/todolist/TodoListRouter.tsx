import { Routes, Route } from "react-router";
import type { ModuleWidgetProps } from "../registry";
import TodoListDashboardView from "./components/TodoListDashboardView";

export default function TodoListRouter(props: ModuleWidgetProps) {
    return (
        <Routes>
            <Route index element={<TodoListDashboardView {...props} />} />
        </Routes>
    )
}