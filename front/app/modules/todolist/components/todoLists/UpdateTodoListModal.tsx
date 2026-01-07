import ModalOverlay from "~/components/ui/ModalOverlay";
import type { TodoList } from "../../models/TodoList";
import { ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useUpdateTodoList } from "../../hooks/todoLists/useUpdateTodoList";
import { useDeleteTodoList } from "../../hooks/todoLists/useDeleteTodoList";
import { useState } from "react";

interface UpdateTodoListModalProps {
    showModal: boolean;
    todoList?: TodoList;
    onClose: () => void;
    onTodoListUpdated: () => void;
    onTodoListDeleted: () => void;
}

export default function UpdateTodoListModal({ showModal, todoList, onClose, onTodoListUpdated, onTodoListDeleted }: UpdateTodoListModalProps) {
    const [title, setTitle] = useState(todoList?.title ?? "");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const { updateTodoList, isPending: isUpdating } = useUpdateTodoList();
    const { deleteTodoList, isPending: isDeleting } = useDeleteTodoList();

    if (!todoList) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateTodoList({ todoListUuid: todoList.uuid, title });
        onTodoListUpdated();
    }



    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} className="justify-center items-center">
            <div className="border rounded-xl border-light-gray w-[500px] h-fit flex flex-col gap-3 py-5 px-10 shadow-lg bg-white" onClick={(e) => e.stopPropagation()}>
                <h1 className="text-heading-lg">
                    Modifier la Todo List
                </h1>
                {/* <p className="text-body-xs w-100">Chaque Todo List est associée à un project. Cela permet de garder une organisation propre et simple. Vous pouvez créer autant de Todo List que vous souhaitez.</p> */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="Titre"
                        placeholder="Entrez le titre de la Todo List"
                        id="name"
                        name="name"
                        type="text"
                        required
                        fullWidth

                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <Button
                        type="submit"
                        isLoading={isUpdating}
                        disabled={isUpdating}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">Modifier la Todo List</p>
                            <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
                        </div>
                    </Button>
                </form>
                <div className="w-full flex items-center">
                    {showDeleteConfirmation ?
                        <div className=" flex flex-col w-full items-center gap-2">
                            <p className="text-body-xs text-center">Êtes-vous sûr de vouloir supprimer cette todo list ? <br /> Cette action est irréversible.</p>
                            <div className="flex flex-row w-full justify-center items-center gap-3">
                                <Button
                                    width="w-1/5"
                                    isLoading={isDeleting}
                                    disabled={isDeleting}
                                    onClick={() => setShowDeleteConfirmation(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    width="w-1/5"
                                    style="danger"
                                    isLoading={isDeleting}
                                    disabled={isDeleting}
                                    onClick={async () => {
                                        await deleteTodoList(todoList.uuid);
                                        onTodoListDeleted();
                                    }}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </div> : <Button
                            width="w-1/2"
                            style="danger"
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            onClick={() => setShowDeleteConfirmation(true)}
                        >
                            <div className="flex flex-row justify-center items-center gap-3">
                                <p className="text-sm">Supprimer la Todo List</p>
                                <TrashIcon className="size-4 text-clear" strokeWidth={2} />
                            </div>
                        </Button>}
                </div>

            </div>
        </ModalOverlay>
    )

}