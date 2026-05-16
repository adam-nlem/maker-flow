import type { Project } from "~/models/Project";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';

interface ProjectTileProps {
  project: Project;
  isSelected?: boolean;
  showCreatedAt?: boolean;
  rightIcon?: ReactNode;
  onHoverRightIcon?: ReactNode;
  onClick?: () => void;
  compact?: boolean;
}

export default function ProjectTile({
  project,
  isSelected = false,
  showCreatedAt = false,
  rightIcon,
  onHoverRightIcon,
  onClick,
  compact = false,
}: ProjectTileProps) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)

  const avatar = useMemo(() => {
    return createAvatar(shapes, {
      size: 128,
      seed: project.uuid,
      backgroundType: ["gradientLinear"],
    }).toDataUri()
  }, [project.uuid])

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={project.name}
        className="relative group size-9 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-pale-gray-2 shrink-0"
      >
        <img src={avatar} alt="" className="w-full h-full" />
        <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-dark text-clear text-body-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {project.name}
        </span>
      </button>
    );
  }

  return (
    <div
      className="flex flex-row justify-between gap-3 items-center hover:bg-pale-gray-2 cursor-pointer rounded-md p-2"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-row gap-3 items-center">
        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>}
        <img src={avatar} alt="Project Avatar" className="rounded-md h-10 w-10 shrink-0" />
        <div className="flex flex-col">
          <h1 className="text-heading-sm whitespace-nowrap">{project.name}</h1>
          {showCreatedAt && (
            <p className="text-body-xs text-muted-2 whitespace-nowrap">{t("projects:tile.createdAt", { date: formatToFrenchDateShort(project.createdAt) })}</p>
          )}
        </div>
      </div>
      {isHovered && onHoverRightIcon}
      {rightIcon}
    </div>
  );
}
