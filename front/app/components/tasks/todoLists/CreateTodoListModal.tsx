import { useState } from "react";
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
    const [title, setTitle] = useState("");

    const { createTodoList, isPending, error, reset } = useCreateTodoList({ projectUuid });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await createTodoList(title);
        setTitle("");
        reset();
        onTodoListCreated();
    }

    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} className="justify-center items-center">
            <div className="border rounded-xl border-light-gray w-[500px] h-fit flex flex-col gap-3 py-5 px-10 shadow-lg bg-clear" onClick={(e) => e.stopPropagation()}>
                <h1 className="text-heading-lg">
                    Créez une nouvelle Todo List
                </h1>
                <p className="text-body-xs w-100">Chaque Todo List est associée à un project. Cela permet de garder une organisation propre et simple. Vous pouvez créer autant de Todo List que vous souhaitez.</p>
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
                        className="mt-5"
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">Créer la Todo List</p>
                            <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
                        </div>
                    </Button>
                </form>
            </div>
        </ModalOverlay>
    )

}