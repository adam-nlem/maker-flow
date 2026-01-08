import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Project } from "~/models/Project";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";

interface ProjectContextType {
    focusedProject: Project | null;
    projects: Project[];
    isLoadingProjects: boolean;
    error: Error | null;
    setFocusedProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "app:project:focused";

export function ProjectProvider({ children }: { children: ReactNode }) {

    const { projects, isLoading: isLoadingProjects, error } = useListPaginatedProjects();
    const [focusedProject, setFocusedProject] = useState<Project | null>(null);

    useEffect(() => {
        if (!projects.length || focusedProject) return;

        // Guard against SSR/hydration
        const isBrowser = typeof window !== "undefined";

        const focusedProjectUuid = isBrowser ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;

        const project = projects.find((project) => project.uuid === focusedProjectUuid) ?? projects[0]

        setFocusedProject(project);
    }, [projects]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (focusedProject) {
            localStorage.setItem(LOCAL_STORAGE_KEY, focusedProject.uuid)
        }
    }, [focusedProject])

    const value = useMemo(
        () => ({
            focusedProject,
            projects,
            isLoadingProjects,
            error,
            setFocusedProject,
        }),
        [focusedProject, projects, isLoadingProjects, error]
    );


    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
