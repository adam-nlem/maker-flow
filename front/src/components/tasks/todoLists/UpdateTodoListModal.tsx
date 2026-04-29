import ModalOverlay from "~/components/ui/ModalOverlay";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import type { TodoList } from "~/models/TodoList";
import { ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useUpdateTodoList } from "~/hooks/api/todoLists/useUpdateTodoList";
import { useDeleteTodoList } from "~/hooks/api/todoLists/useDeleteTodoList";
import { useState } from "react";

interface UpdateTodoListModalProps {
    showModal: boolean;
    todoList?: TodoList;
    onClose: () => void;
}

export default function UpdateTodoListModal({ showModal, todoList, onClose }: UpdateTodoListModalProps) {
    const { t } = useTranslation();

    const [title, setTitle] = useState(todoList?.title ?? "");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const { updateTodoList, isPending: isUpdating } = useUpdateTodoList();
    const { deleteTodoList, isPending: isDeleting } = useDeleteTodoList();

    if (!todoList) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateTodoList({ todoListUuid: todoList.uuid, title });
        onClose();
    }



    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose}>
            <div className="flex flex-col gap-3 py-5 px-10 flex-1 min-h-0 overflow-y-auto">
                <h1 className="text-heading-lg">
                    {t("tasks:todoList.update.modalTitle")}
                </h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label={t("tasks:todoList.create.titleLabel")}
                        placeholder={t("tasks:todoList.create.titlePlaceholder")}
                        id="name"
                        name="name"
                        type="text"
                        required

                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <Button
                        type="submit"
                        isLoading={isUpdating}
                        disabled={isUpdating}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">{t("tasks:todoList.update.submit")}</p>
                            <ChevronRightIcon className="size-4" strokeWidth={2} />
                        </div>
                    </Button>
                </form>
                <div className="w-full flex items-center">
                    <Button
                        width="w-1/2"
                        style="danger"
                        isLoading={isDeleting}
                        disabled={isDeleting}
                        onClick={() => setShowDeleteConfirmation(true)}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">{t("tasks:todoList.update.delete")}</p>
                            <TrashIcon className="size-4" strokeWidth={2} />
                        </div>
                    </Button>
                </div>

                <ConfirmDeleteDialog
                    isOpen={showDeleteConfirmation}
                    onClose={() => setShowDeleteConfirmation(false)}
                    onConfirm={async () => {
                        await deleteTodoList(todoList.uuid);
                        onClose();
                    }}
                    isPending={isDeleting}
                    message={t("tasks:todoList.update.deleteConfirm")}
                />

            </div>
        </ModalOverlay>
    )

}
