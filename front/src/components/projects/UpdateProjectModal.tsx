import ModalOverlay from "~/components/ui/ModalOverlay";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useState } from "react";
import type { Project } from "~/models/Project";
import { useDeleteProject } from "~/hooks/api/projects/useDeleteProject";
import { useUpdateProject } from "~/hooks/api/projects/useUpdateProject";
import { ProjectType, projectTypeOptions, projectTypeTranslationKeys } from "~/models/enums/ProjectType";
import { TextArea } from "../ui/TextArea";
import { ToggleChip } from "../ui/ToggleChip";

interface UpdateProjectModalProps {
    showModal: boolean;
    project?: Project;
    onClose: () => void;
}

export default function UpdateProjectModal({ showModal, project, onClose }: UpdateProjectModalProps) {
    const { t } = useTranslation();

    const [name, setName] = useState(project?.name ?? "");
    const [description, setDescription] = useState(project?.description ?? "");
    const [types, setTypes] = useState<ProjectType[]>(project?.types ?? []);

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const { updateProject, isPending: isUpdating } = useUpdateProject();
    const { deleteProject, isPending: isDeleting } = useDeleteProject();

    if (!project) return null;

    const handleSubmit = async (e: React.SubmitEvent) => {
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
        <ModalOverlay isOpen={showModal} onClose={onClose} height="h-fit">
            <div className="flex flex-col gap-3 py-5 px-10 flex-1 min-h-0 overflow-y-auto">
                <h1 className="text-heading-lg">
                    {t("projects:update.modalTitle")}
                </h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label={t("projects:update.fields.title")}
                        placeholder={t("projects:create.fields.namePlaceholder")}
                        id="name"
                        name="name"
                        type="text"
                        required

                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextArea
                        label={t("projects:create.fields.description")}
                        placeholder={t("projects:create.fields.descriptionPlaceholder")}
                        id="description"
                        name="description"

                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div>
                        <h1 className="text-heading-sm">{t("projects:create.fields.types")}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {projectTypeOptions.map((type) => (
                                <ToggleChip
                                    key={type}
                                    label={t(projectTypeTranslationKeys[type])}
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
                            <p className="text-sm">{t("projects:update.submit")}</p>
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
                            <p className="text-sm">{t("projects:update.delete")}</p>
                            <TrashIcon className="size-4" strokeWidth={2} />
                        </div>
                    </Button>
                </div>

                <ConfirmDeleteDialog
                    isOpen={showDeleteConfirmation}
                    onClose={() => setShowDeleteConfirmation(false)}
                    onConfirm={async () => {
                        await deleteProject(project.uuid);
                        onClose();
                    }}
                    isPending={isDeleting}
                    message={t("projects:update.deleteConfirm")}
                />

            </div>
        </ModalOverlay>
    )

}
