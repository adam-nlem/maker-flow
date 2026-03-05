import { useMemo, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { Project } from "~/models/Project";
import { ProjectType, projectTypeOptions, projectTypeToFrenchTranslation } from "~/models/enums/ProjectType";
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
                                placeholder="Entrez le nom du Projet"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                textStyle="text-heading-sm"
                                required
                                fullWidth
                            />
                            <p className="text-body-xs text-gray">Créé le {formatToNumericDate(project.createdAt)}</p>
                        </div>
                        <TrashIcon
                            className="ml-auto size-4 text-gray hover:text-danger cursor-pointer transition-colors shrink-0"
                            strokeWidth={2}
                            onClick={() => setShowDeleteConfirm(true)}
                        />
                    </div>


                    <TextArea
                        simple
                        placeholder="Écrivez une description (optionnel)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                    />

                    <h3 className="text-heading-sm">Types</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {projectTypeOptions.map(type => (
                            <Pill
                                key={type}
                                label={projectTypeToFrenchTranslation[type]}
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
                            <p className="text-sm">Enregistrer</p>
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
                message="En supprimant ce projet, vous supprimez toutes les données qui lui sont associés. Cette action est irréversible."
            />
        </>
    );
}
