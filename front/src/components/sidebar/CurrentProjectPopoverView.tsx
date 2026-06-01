import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Tag } from "~/components/ui/Tag";
import ProjectLogo from "~/components/project/ProjectLogo";
import ProjectTile from "~/components/agency/projects/ProjectTile";
import { projectTypeTranslationKeys, type ProjectType } from "~/models/enums/ProjectType";
import type { Project } from "~/models/Project";

interface CurrentProjectPopoverViewProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  description?: string | null;
  types?: ProjectType[];
  project?: Project;
  logoUrl?: string | null;
  projects?: Project[];
  focusedProjectUuid?: string | null;
  onSelectProject?: (projectUuid: string) => void;
  onCreateProject?: () => void;
  onEditProject?: () => void;
  canCreateProject?: boolean;
}

const CurrentProjectPopoverView = forwardRef<HTMLDivElement, CurrentProjectPopoverViewProps>(
  ({
    name,
    description,
    types,
    project,
    logoUrl,
    projects,
    focusedProjectUuid,
    onSelectProject,
    onCreateProject,
    onEditProject,
    canCreateProject = true,
    className = "",
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const otherProjects = projects?.filter((p) => p.uuid !== focusedProjectUuid) ?? [];
    const showSwitcher = otherProjects.length > 0 && !!onSelectProject;
    const showActions = !!onEditProject || !!onCreateProject;

    return (
      <div
        ref={ref}
        className={`w-90 rounded-xl border border-pale-gray shadow-lg bg-clear overflow-hidden ${className}`}
        {...props}
      >
        <div className="h-20 w-full bg-pale-gray-2" />

        <div className="px-5 -mt-10">
          <div className="inline-block rounded-md bg-clear p-1">
            <ProjectLogo projectUuid={project?.uuid} projectName={name} logoUrl={logoUrl} className="size-16" />
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 pt-3">
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-heading-md font-semibold truncate">
              {name}
            </span>
            {description && (
              <p className="text-body-sm text-muted-2 whitespace-pre-wrap break-words">
                {description}
              </p>
            )}
            {types && types.length > 0 && (
              <div className="flex flex-row flex-wrap gap-1.5">
                {types.map((type) => (
                  <Tag key={type} label={t(projectTypeTranslationKeys[type])} />
                ))}
              </div>
            )}
          </div>

          {showSwitcher && (
            <div className="flex flex-col gap-2 border-t border-pale-gray pt-4">
              <h3 className="text-body-xs text-muted-2 uppercase">{t("projects:popover.sections.switchProject")}</h3>
              <div className="flex flex-col">
                {otherProjects.map((p) => (
                  <ProjectTile
                    key={p.uuid}
                    project={p}
                    onClick={() => onSelectProject!(p.uuid)}
                  />
                ))}
              </div>
            </div>
          )}

          {showActions && (
            <div className="flex flex-col gap-3 mt-5">
              {onEditProject && (
                <Button type="button" style="secondary" onClick={onEditProject}>
                  <PencilSquareIcon className="size-4" strokeWidth={1.8} />
                  <p className="text-sm">{t("projects:popover.actions.edit")}</p>
                </Button>
              )}
              {onCreateProject && (
                <Button type="button" style="primary" onClick={onCreateProject} disabled={!canCreateProject}>
                  <PlusIcon className="size-4" strokeWidth={1.8} />
                  <p className="text-sm">{t("projects:popover.actions.create")}</p>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default CurrentProjectPopoverView;
