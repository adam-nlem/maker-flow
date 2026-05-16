import { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { useCreateTodoList } from "~/hooks/api/todoLists/useCreateTodoList";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

interface CreateTodoListModalProps {
    projectUuid: string
    showModal: boolean;
    onClose: () => void;
    onTodoListCreated: () => void;
}

export default function CreateTodoListModal({ projectUuid, showModal, onClose, onTodoListCreated }: CreateTodoListModalProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");

    const { createTodoList, isPending, reset } = useCreateTodoList({ projectUuid });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await createTodoList(title);
        setTitle("");
        reset();
        onTodoListCreated();
    }

    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose}>
            <div className="flex flex-col gap-3 py-5 px-10 flex-1 min-h-0 overflow-y-auto">
                <h1 className="text-heading-lg">
                    {t("tasks:todoList.create.modalTitle")}
                </h1>
                <p className="text-body-xs w-100">{t("tasks:todoList.create.modalDescription")}</p>
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
                        className="mt-5"
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">{t("tasks:todoList.create.submit")}</p>
                            <ChevronRightIcon className="size-4" strokeWidth={2} />
                        </div>
                    </Button>
                </form>
            </div>
        </ModalOverlay>
    )

}
