import type { Project } from "~/models/project";
import type { ReactNode } from "react";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";

interface ProjectTileProps {
    project: Project;
    moduleCount?: number;
    showCreatedAt?: boolean;
    rightIcon?: ReactNode;
    onClick?: () => void;
}

export default function ProjectTile({
    project,
    moduleCount,
    showCreatedAt = false,
    rightIcon,
    onClick
}: ProjectTileProps) {
    return (
        <div
            className="flex flex-row justify-between gap-3 items-center hover:bg-light-gray cursor-pointer rounded-md p-2"
            onClick={onClick}
        >
            <div className="flex flex-row gap-3 ">
                <div className="rounded-md bg-primary flex items-center justify-center h-10 w-10 text-heading-md">
                    {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col ">
                    <h1 className="text-heading-sm">{project.name}</h1>
                    {showCreatedAt ? (
                        <p className="text-body-xs text-gray">Créé le {formatToFrenchDateShort(project.createdAt)}</p>
                    ) : moduleCount !== undefined ? <p className="text-body-xs">
                        {moduleCount} Module{moduleCount !== 1 ? 's' : ''} Actif{moduleCount !== 1 ? 's' : ''}</p> : null}
                </div>
            </div>
            {rightIcon}
        </div>
    );
}
