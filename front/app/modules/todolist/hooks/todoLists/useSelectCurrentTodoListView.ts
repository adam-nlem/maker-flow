import { useEffect, useState } from "react";
import type { TodoList } from "../../models/TodoList";

export default function useSelectCurrentTodoListView({ todoLists }: { todoLists: TodoList[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentTodoList, setCurrentTodoList] = useState(todoLists[currentIndex])

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : todoLists.length - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < todoLists.length - 1 ? prev + 1 : 0))
    }

    useEffect(() => {
        setCurrentTodoList(todoLists[currentIndex])
    }, [currentIndex, todoLists])

    return {
        currentTodoList, setCurrentTodoList,
        goToPrevious, goToNext
    }
}