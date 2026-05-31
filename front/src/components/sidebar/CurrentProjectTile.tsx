import { useState } from "react";
import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import ProjectLogo from "~/components/project/ProjectLogo";
import CurrentProjectPopover from "./CurrentProjectPopover";
import type { Project } from "~/models/Project";

interface CurrentProjectTileProps {
  project: Project;
  projects?: Project[];
  onSelectProject?: (projectUuid: string) => void;
  onCreateProject?: () => void;
  onEditProject?: () => void;
  canCreateProject?: boolean;
  compact?: boolean;
}

export default function CurrentProjectTile({
  project,
  projects,
  onSelectProject,
  onCreateProject,
  onEditProject,
  canCreateProject,
  compact = false,
}: CurrentProjectTileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "right-start",
    middleware: [offset(20), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  return (
    <>
      <div
        ref={refs.setReference}
        onClick={() => setIsOpen((open) => !open)}
        {...getReferenceProps()}
        className={
          compact
            ? "m-2 flex items-center justify-center cursor-pointer rounded-lg hover:bg-surface-hover"
            : "m-3 flex flex-row items-center gap-3 cursor-pointer rounded-lg p-1 hover:bg-surface-hover border border-transparent min-w-0"
        }
        aria-label={project.name}
      >
        <ProjectLogo projectUuid={project.uuid} projectName={project.name} className="size-9 shrink-0" />
        {!compact && (
          <span className="text-heading-sm font-semibold whitespace-nowrap truncate text-left">
            {project.name}
          </span>
        )}
      </div>
      {isOpen && (
        <CurrentProjectPopover
          project={project}
          projects={projects}
          onSelectProject={onSelectProject}
          onCreateProject={onCreateProject}
          onEditProject={onEditProject}
          canCreateProject={canCreateProject}
          floatingRef={refs.setFloating}
          floatingStyles={floatingStyles}
          getFloatingProps={getFloatingProps}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
