import { useMemo, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { Project } from "~/models/Project";
import { ProjectType, projectTypeOptions, projectTypeTranslationKeys } from "~/models/enums/ProjectType";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { useUpdateProject } from "~/hooks/api/projects/useUpdateProject";
import { useDeleteProject } from "~/hooks/api/projects/useDeleteProject";
import { formatToNumericDate } from "~/utils/dateFormatters";
import { createAvatar } from "@dicebear/core";
import { shapes } from "@dicebear/collection";

interface ProjectSettingsCardProps {
    project: Project;
}

export default function ProjectSettingsCard({ project }: ProjectSettingsCardProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [types, setTypes] = useState<ProjectType[]>(project.types);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { updateProject, isPending: isUpdating } = useUpdateProject();
    const { deleteProject, isPending: isDeleting } = useDeleteProject();

    const hasChanges =
        name !== project.name ||
        description !== project.description ||
        JSON.stringify(types) !== JSON.stringify(project.types);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProject({ projectUuid: project.uuid, name, description, types });
    };

    const toggleType = (type: ProjectType) => {
        setTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const avatar = useMemo(() => {
        return createAvatar(shapes, {
            size: 128,
            seed: project.uuid,
            backgroundType: ["gradientLinear"],
        }).toDataUri()
    }, [])

    return (
        <>
            <form onSubmit={handleSubmit} className="border border-light-gray rounded-xl overflow-hidden">
                <div className="px-5 py-4 flex flex-col gap-3">

                    <div className="flex flex-row gap-3 items-center">
                        <img src={avatar} alt="Project Avatar" className="rounded-md h-10 w-10 shrink-0" />
                        <div className="flex flex-col">

                            <Input
                                simple
                                placeholder={t("settings:projects.card.namePlaceholder")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                textStyle="text-heading-sm"
                                required
                            />
                            <p className="text-body-xs text-gray">{t("settings:projects.card.createdAt", { date: formatToNumericDate(project.createdAt) })}</p>
                        </div>
                        <TrashIcon
                            className="ml-auto size-4 text-gray hover:text-danger cursor-pointer transition-colors shrink-0"
                            strokeWidth={2}
                            onClick={() => setShowDeleteConfirm(true)}
                        />
                    </div>


                    <TextArea
                        simple
                        placeholder={t("settings:projects.card.descriptionPlaceholder")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <h3 className="text-heading-sm">{t("settings:projects.card.types")}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {projectTypeOptions.map(type => (
                            <Pill
                                key={type}
                                label={t(projectTypeTranslationKeys[type])}
                                isSelected={types.includes(type)}
                                bgColorClassName="bg-primary/10"
                                borderColorClassName="border border-primary/30"
                                onClick={() => toggleType(type)}
                            />
                        ))}
                    </div>


                </div>

                {hasChanges && (
                    <div className="border-t border-light-gray px-5 py-3">
                        <Button type="submit" style="primary" isLoading={isUpdating} disabled={isUpdating}>
                            <p className="text-sm">{t("actions.save")}</p>
                        </Button>
                    </div>
                )}
            </form>

            <ConfirmDeleteDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={async () => {
                    await deleteProject(project.uuid);
                    setShowDeleteConfirm(false);
                }}
                isPending={isDeleting}
                message={t("settings:projects.card.deleteConfirm")}
            />
        </>
    );
}
