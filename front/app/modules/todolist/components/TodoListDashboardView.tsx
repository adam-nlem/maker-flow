import { ChevronLeftIcon, ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Badge } from "~/components/ui/Badge";
import TodoListTaskCard from "./TodoListTaskCard";
import { TodoListTask } from "../models/TodoListTask";
import { TodoListPriority } from "../models/enums/TodoListPriority";
import { Color } from "~/models/enums/Color";

export default function TodoListDashboardView() {
    return (
        <div className="m-5 w-1/3 max-h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center">
                <ChevronLeftIcon className="size-4 text-gray cursor-pointer" strokeWidth={2} />
                <h1 className="text-heading-md">Développement à faire</h1>
                <ChevronRightIcon className="size-4 text-gray cursor-pointer" strokeWidth={2} />
            </div>

            <div className="flex flex-row gap-1.5">

                <div className="flex flex-col w-1/3 gap-3">

                    <div className="text-sm w-full rounded-sm text-center text-gray bg-light-gray">
                        A Faire
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto">
                        <TodoListTaskCard todoItem={TodoListTask.fromJSON({
                            uuid: 'test-uuid-001',
                            title: 'Désigner l\'interface utilisateur',
                            content: 'Créer les maquettes Figma pour le module ToDo List',
                            priority: TodoListPriority.High,
                            tags: [
                                { uuid: 'cat-1', title: 'ToDo List Module', color: Color.Purple, createdAt: '2024-12-01T00:00:00Z' },
                                { uuid: 'cat-2', title: 'Design', color: Color.Blue, createdAt: '2024-12-01T00:00:00Z' }
                            ],
                            createdAt: '2024-12-05T10:00:00Z',
                            dueDate: '2024-12-22T18:00:00Z'
                        })} />

                        <TodoListTaskCard todoItem={TodoListTask.fromJSON({
                            uuid: 'test-uuid-001',
                            title: 'Désigner l\'interface utilisateur',
                            content: 'Créer les maquettes Figma pour le module ToDo List',
                            priority: TodoListPriority.Medium,
                            tags: [
                                { uuid: 'cat-1', title: 'ToDo List Module', color: Color.Red, createdAt: '2024-12-01T00:00:00Z' },
                                { uuid: 'cat-2', title: 'Design', color: Color.Yellow, createdAt: '2024-12-01T00:00:00Z' }
                            ],
                            createdAt: '2024-12-05T10:00:00Z',
                            dueDate: '2024-12-22T18:00:00Z'
                        })} />

                        <TodoListTaskCard todoItem={TodoListTask.fromJSON({
                            uuid: 'test-uuid-001',
                            title: 'Désigner l\'interface utilisateur',
                            content: 'Créer les maquettes Figma pour le module ToDo List',
                            priority: TodoListPriority.Low,
                            tags: [
                                { uuid: 'cat-2', title: 'Design', color: Color.Green, createdAt: '2024-12-01T00:00:00Z' }
                            ],
                            createdAt: '2024-12-05T10:00:00Z',
                            dueDate: '2024-12-22T18:00:00Z'
                        })} />
                    </div>

                </div>

                <div className="flex flex-col w-1/3 ">

                    <div className="text-sm w-full rounded-sm text-center text-blue-600 bg-blue-300">
                        En Cours
                    </div>

                </div>

                <div className="flex flex-col w-1/3 ">

                    <div className="text-sm w-full rounded-sm text-center text-primary bg-primary/30">
                        Terminée
                    </div>

                </div>
            </div>
        </div>
    );
}