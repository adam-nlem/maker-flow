import { useMemo, useState } from "react";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { Project } from "~/models/Project";
import type { User } from "~/models/User";
import type { Invitation } from "~/models/Invitation";
import { ProjectType, projectTypeOptions, projectTypeTranslationKeys } from "~/models/enums/ProjectType";
import { UserRole } from "~/models/enums/UserRole";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import Shimmer from "~/components/ui/Shimmer";
import { Tag } from "~/components/ui/Tag";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { useUpdateProject } from "~/hooks/api/projects/useUpdateProject";
import { useDeleteProject } from "~/hooks/api/projects/useDeleteProject";
import { useListProjectClients } from "~/hooks/api/projectClients/useListProjectClients";
import { useRemoveClient } from "~/hooks/api/projectClients/useRemoveClient";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { formatToNumericDate } from "~/utils/dateFormatters";
import { createAvatar } from "@dicebear/core";
import { shapes } from "@dicebear/collection";
import InviteClientModal from "./InviteClientModal";
import DeleteInvitationModal from "~/components/invitations/DeleteInvitationModal";

interface ProjectSettingsCardProps {
    project: Project;
}

export default function ProjectSettingsCard({ project }: ProjectSettingsCardProps) {
    const { t } = useTranslation();
    const { user } = useCurrentUser();
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [types, setTypes] = useState<ProjectType[]>(project.types);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showInviteClient, setShowInviteClient] = useState(false);
    const [removingClient, setRemovingClient] = useState<User | null>(null);
    const [deletingInvitation, setDeletingInvitation] = useState<Invitation | null>(null);

    const { updateProject, isPending: isUpdating } = useUpdateProject();
    const { deleteProject, isPending: isDeleting } = useDeleteProject();
    const { projectClients, isLoading: isLoadingClients } = useListProjectClients(project.uuid);
    const clients = projectClients?.clients ?? [];
    const pendingInvitations = projectClients?.pendingInvitations ?? [];
    const { removeClient, isPending: isRemovingClient } = useRemoveClient();

    const canManageClients = user?.hasRole(UserRole.Admin) || user?.hasRole(UserRole.Editor) || false;

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
    }, [project.uuid])

    return (
        <>
            <form onSubmit={handleSubmit} className="border border-pale-gray rounded-xl overflow-hidden">
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
                            <p className="text-body-xs text-muted-2">{t("settings:projects.card.createdAt", { date: formatToNumericDate(project.createdAt) })}</p>
                        </div>
                        <TrashIcon
                            className="ml-auto size-4 text-muted-2 hover:text-danger cursor-pointer transition-colors shrink-0"
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

                    <div className="flex flex-row justify-between items-center mt-3">
                        <h3 className="text-heading-sm">{t("settings:projects.card.clients.title")}</h3>
                        {canManageClients && (
                            <button
                                type="button"
                                className="flex flex-row items-center gap-1 text-body-xs text-primary hover:opacity-80 transition-opacity cursor-pointer"
                                onClick={(e) => { e.preventDefault(); setShowInviteClient(true); }}
                            >
                                <PlusIcon className="size-3.5" strokeWidth={2} />
                                <span>{t("settings:projects.card.clients.invite")}</span>
                            </button>
                        )}
                    </div>

                    {isLoadingClients ? (
                        <div className="flex flex-col gap-2">
                            <Shimmer width="w-full" height="h-8" radius="rounded-md" />
                            <Shimmer width="w-full" height="h-8" radius="rounded-md" />
                        </div>
                    ) : clients.length === 0 && pendingInvitations.length === 0 ? (
                        <p className="text-body-xs text-muted-2">{t("settings:projects.card.clients.empty")}</p>
                    ) : (
                        <ul className="flex flex-col gap-1.5">
                            {clients.map((client) => (
                                <li key={`client-${client.uuid}`} className="flex flex-row items-center gap-3 py-1.5 px-2 rounded-md border border-pale-gray">
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-body-sm truncate">{client.fullName}</span>
                                        <span className="text-body-xs text-muted-2 truncate">{client.email}</span>
                                    </div>
                                    <Tag bgClassName="bg-primary/10" textClassName="text-primary" label={t("settings:projects.card.clients.status.active")} className="shrink-0" />
                                    {canManageClients && (
                                        <TrashIcon
                                            className="size-4 text-muted-2 hover:text-danger cursor-pointer transition-colors shrink-0"
                                            strokeWidth={2}
                                            onClick={(e) => { e.preventDefault(); setRemovingClient(client); }}
                                        />
                                    )}
                                </li>
                            ))}
                            {pendingInvitations.map((invitation) => (
                                <li key={`invitation-${invitation.uuid}`} className="flex flex-row items-center gap-3 py-1.5 px-2 rounded-md border border-pale-gray">
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-body-sm truncate">{invitation.fullName}</span>
                                        <span className="text-body-xs text-muted-2 truncate">{invitation.email}</span>
                                    </div>
                                    <Tag bgClassName="bg-yellow/10" textClassName="text-yellow" label={t("settings:projects.card.clients.status.pending")} className="shrink-0" />
                                    {canManageClients && (
                                        <XMarkIcon
                                            className="size-4 text-muted-2 hover:text-danger cursor-pointer transition-colors shrink-0"
                                            strokeWidth={2}
                                            onClick={(e) => { e.preventDefault(); setDeletingInvitation(invitation); }}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}


                </div>

                {hasChanges && (
                    <div className="border-t border-pale-gray px-5 py-3">
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

            <InviteClientModal
                showModal={showInviteClient}
                projectUuid={project.uuid}
                projectName={project.name}
                onClose={() => setShowInviteClient(false)}
            />

            <ConfirmDeleteDialog
                isOpen={removingClient !== null}
                onClose={() => setRemovingClient(null)}
                onConfirm={async () => {
                    if (!removingClient) return;
                    await removeClient({ projectUuid: project.uuid, clientUserUuid: removingClient.uuid });
                    setRemovingClient(null);
                }}
                isPending={isRemovingClient}
                message={t("settings:projects.card.clients.removeConfirm", { target: removingClient?.fullName ?? '' })}
            />

            <DeleteInvitationModal
                isOpen={deletingInvitation !== null}
                invitationUuid={deletingInvitation?.uuid ?? null}
                displayLabel={deletingInvitation?.fullName ?? ''}
                onClose={() => setDeletingInvitation(null)}
            />
        </>
    );
}
