import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Project } from "~/models/project";
import { usePaginatedProjects } from "~/hooks/projects/usePaginatedProjects";

interface ProjectContextType {
    focusedProject: Project | null;
    projects: Project[];
    isLoading: boolean;
    errorMessage: string | null;
    setFocusedProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const { projects, isLoading, errorMessage } = usePaginatedProjects();
    const [focusedProject, setFocusedProject] = useState<Project | null>(null);

    // Set the first project as current when projects are loaded
    useEffect(() => {
        if (projects.length > 0 && !focusedProject) {
            setFocusedProject(projects[0]);
        }
    }, [projects, focusedProject]);

    const value = {
        focusedProject,
        projects,
        isLoading,
        errorMessage,
        setFocusedProject
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
