import { useEffect, type CSSProperties } from "react";
import { FloatingPortal } from "@floating-ui/react";
import CurrentProjectPopoverView from "./CurrentProjectPopoverView";
import type { Project } from "~/models/Project";

interface CurrentProjectPopoverProps {
  project: Project;
  projects?: Project[];
  onSelectProject?: (projectUuid: string) => void;
  onCreateProject?: () => void;
  onEditProject?: () => void;
  canCreateProject?: boolean;
  floatingRef: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
  getFloatingProps: () => Record<string, unknown>;
  onClose: () => void;
}

export default function CurrentProjectPopover({
  project,
  projects,
  onSelectProject,
  onCreateProject,
  onEditProject,
  canCreateProject,
  floatingRef,
  floatingStyles,
  getFloatingProps,
  onClose,
}: CurrentProjectPopoverProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <FloatingPortal>
      <div className="fixed inset-0 z-40 bg-black/40" />

      <CurrentProjectPopoverView
        ref={floatingRef}
        style={floatingStyles}
        className="z-50"
        project={project}
        name={project.name}
        description={project.description}
        types={project.types}
        projects={projects}
        focusedProjectUuid={project.uuid}
        onSelectProject={onSelectProject ? (uuid) => { onClose(); onSelectProject(uuid); } : undefined}
        onCreateProject={onCreateProject ? () => { onClose(); onCreateProject(); } : undefined}
        onEditProject={onEditProject ? () => { onClose(); onEditProject(); } : undefined}
        canCreateProject={canCreateProject}
        {...getFloatingProps()}
      />
    </FloatingPortal>
  );
}
