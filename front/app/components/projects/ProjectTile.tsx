import type { Project } from "~/models/Project";
import { useState, type ReactNode } from "react";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";
import { useSidebarStore } from "~/stores/sidebar/sidebarStore";

interface ProjectTileProps {
    project: Project;
    isSelected?: boolean;
    moduleCount?: number;
    showCreatedAt?: boolean;
    rightIcon?: ReactNode;
    onHoverRightIcon?: ReactNode;
    onClick?: () => void;
}

export default function ProjectTile({
    project,
    isSelected = false,
    moduleCount,
    showCreatedAt = false,
    rightIcon,
    onHoverRightIcon,
    onClick
}: ProjectTileProps) {
    const isExpanded = useSidebarStore((state) => state.isExpanded)
    const [isHovered, setIsHovered] = useState(false)

    return (

        <div
            className="flex flex-row justify-between gap-3 items-center hover:bg-light-gray cursor-pointer rounded-md p-2"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-row gap-3 items-center">
                {(isExpanded && isSelected) && <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>}
                <div className="rounded-md bg-primary flex items-center justify-center h-10 w-10 text-heading-md">
                    {project.name.charAt(0).toUpperCase()}
                </div>
                {isExpanded && <div className="flex flex-col">
                    <h1 className="text-heading-sm whitespace-nowrap">{project.name}</h1>
                    {showCreatedAt ? (
                        <p className="text-body-xs text-gray whitespace-nowrap">Créé le {formatToFrenchDateShort(project.createdAt)}</p>
                    ) : moduleCount !== undefined ? <p className="text-body-xs whitespace-nowrap">
                        {moduleCount} Module{moduleCount !== 1 ? 's' : ''} Actif{moduleCount !== 1 ? 's' : ''}</p> : null}
                </div>}
            </div>
            {isHovered && onHoverRightIcon}
            {rightIcon}
        </div>

    );
}
