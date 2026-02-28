import ModalOverlay from "~/components/ui/ModalOverlay";
import { ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useState } from "react";
import type { Project } from "~/models/Project";
import { useDeleteProject } from "~/hooks/api/projects/useDeleteProject";
import { useUpdateProject } from "~/hooks/api/projects/useUpdateProject";
import { ProjectType, projectTypeOptions, projectTypeToFrenchTranslation } from "~/models/enums/ProjectType";
import { TextArea } from "../ui/TextArea";
import { ToggleChip } from "../ui/ToggleChip";

interface UpdateProjectModalProps {
    showModal: boolean;
    project?: Project;
    onClose: () => void;
}

export default function UpdateProjectModal({ showModal, project, onClose }: UpdateProjectModalProps) {

    const [name, setName] = useState(project?.name ?? "");
    const [description, setDescription] = useState(project?.description ?? "");
    const [types, setTypes] = useState<ProjectType[]>(project?.types ?? []);

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const { updateProject, isPending: isUpdating } = useUpdateProject();
    const { deleteProject, isPending: isDeleting } = useDeleteProject();

    if (!project) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateProject({
            projectUuid: project.uuid,
            name,
            description,
            types
        });
        onClose();
    }



    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} className="justify-center items-center">
            <div className="border rounded-xl border-light-gray w-125 h-fit flex flex-col gap-3 py-5 px-10 shadow-lg bg-clear" onClick={(e) => e.stopPropagation()}>
                <h1 className="text-heading-lg">
                    Modifier le Projet
                </h1>
                {/* <p className="text-body-xs w-100">Chaque Todo List est associée à un project. Cela permet de garder une organisation propre et simple. Vous pouvez créer autant de Todo List que vous souhaitez.</p> */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="Titre"
                        placeholder="Entrez le nom du Projet"
                        id="name"
                        name="name"
                        type="text"
                        required
                        fullWidth

                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextArea
                        label="Description"
                        placeholder="Écrivez une description (optionel)"
                        id="description"
                        name="description"
                        fullWidth

                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div>
                        <h1 className="text-heading-sm">Types</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {projectTypeOptions.map((type) => (
                                <ToggleChip
                                    key={type}
                                    label={projectTypeToFrenchTranslation[type]}
                                    isSelected={types.includes(type)}
                                    onToggle={() => setTypes(prev =>
                                        prev.includes(type)
                                            ? prev.filter(t => t !== type)
                                            : [...prev, type]
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isUpdating}
                        disabled={isUpdating}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">Modifier le Projet</p>
                            <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
                        </div>
                    </Button>
                </form>
                <div className="w-full flex items-center">
                    {showDeleteConfirmation ?
                        <div className=" flex flex-col w-full items-center gap-2">
                            <p className="text-body-xs text-center">Êtes-vous sûr de vouloir supprimer ce projet ? <br /> Cette action est irréversible.</p>
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
                                        await deleteProject(project.uuid);
                                        onClose();
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
                                <p className="text-sm">Supprimer le Projet</p>
                                <TrashIcon className="size-4 text-clear" strokeWidth={2} />
                            </div>
                        </Button>}
                </div>

            </div>
        </ModalOverlay>
    )

}