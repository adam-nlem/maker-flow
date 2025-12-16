import { useMemo, useState } from "react";
import type { TodoList } from "../../models/TodoList";

export default function useSelectCurrentTodoListView({ todoLists }: { todoLists: TodoList[]; }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const focusedTodoList = useMemo(
        () => todoLists[currentIndex],
        [todoLists, currentIndex]
    );

    const isLastTodoList = currentIndex === todoLists.length - 1;

    const goToPrevious = () => {
        setCurrentIndex((prev) =>
            prev > 0 ? prev - 1 : Math.max(todoLists.length - 1, 0)
        );
    };

    const goToNext = () => {
        setCurrentIndex((prev) =>
            prev < todoLists.length - 1 ? prev + 1 : 0
        );
    };

    return {
        currentIndex,
        focusedTodoList,
        isLastTodoList,
        goToPrevious,
        goToNext,
    };
}
