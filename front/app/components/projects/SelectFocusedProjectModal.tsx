import type { Project } from "~/models/project";
import ProjectTile from "./ProjectTile";
import { CheckIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/Button";

interface SelectFocusedProjectModalProps {
    showModal: boolean;
    focusedProject: Project | null;
    projects: Project[];
    onClose: () => void;
    onClickCreateProjectButton: () => void;
    setFocusedProject: (project: Project) => void;
}
export default function SelectFocusedProjectModal({ showModal, focusedProject, projects, onClose, onClickCreateProjectButton, setFocusedProject }: SelectFocusedProjectModalProps) {
    if (!showModal) return null;

    return (
        <div className="border rounded-xl border-light-gray w-fit h-min flex flex-col gap-3 p-3 shadow-lg bg-white" onClick={(e) => e.stopPropagation()}>
            {projects.map((project) => (
                <ProjectTile
                    key={project.uuid}
                    project={project}
                    showCreatedAt={true}
                    rightIcon={
                        project.uuid === focusedProject?.uuid ? <CheckIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} /> : null
                    }
                    onClick={() => {
                        setFocusedProject(project);
                        onClose();
                    }} />
            ))}

            <Button
                type="submit"
                fullWidth
                size="lg"
                variant="secondary"
                onClick={onClickCreateProjectButton}
            >
                <div className="flex flex-row justify-center items-center gap-3">
                    <p className="text-sm">Créer un nouveau Projet</p>
                    <PlusCircleIcon className="size-4 text-clear" strokeWidth={2} />
                </div>
            </Button>
        </div>
    )
}