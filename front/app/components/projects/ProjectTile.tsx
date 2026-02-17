import type { Project } from "~/models/Project";
import { useMemo, useState, type ReactNode } from "react";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";
import { useSidebarStore } from "~/stores/sidebar/sidebarStore";
import { createAvatar } from '@dicebear/core';
import { glass, lorelei, shapes } from '@dicebear/collection';

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

  const avatar = useMemo(() => {
    return createAvatar(shapes, {
      size: 128,
      seed: project.uuid,
      backgroundType: ["gradientLinear"],
    }).toDataUri()
  }, [])

  return (

    <div
      className="flex flex-row justify-between gap-3 items-center hover:bg-light-gray cursor-pointer rounded-md p-2"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-row gap-3 items-center">
        {(isExpanded && isSelected) && <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>}
        <img src={avatar} alt="Project Avatar" className="rounded-md h-10 w-10 shrink-0" />
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
