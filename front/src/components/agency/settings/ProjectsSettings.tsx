import { useState, useRef } from "react";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import Shimmer from "~/components/ui/Shimmer";
import CreateProjectModal from "~/components/agency/projects/CreateProjectModal";
import ProjectSettingsCard from "./project/ProjectSettingsCard";

export default function ProjectsSettings() {
    const [showCreate, setShowCreate] = useState(false);
    const { projects, isLoading, hasMore, isLoadingMore, listMore } = useListPaginatedProjects();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollContainerRef, hasMore, isLoadingMore, listMore);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 flex flex-col gap-4">
                {isLoading ? (
                    <>
                        <Shimmer width="w-full" height="h-28" radius="rounded-xl" />
                        <Shimmer width="w-full" height="h-28" radius="rounded-xl" />
                    </>
                ) : (
                    <>
                        {projects.map(project => (
                            <ProjectSettingsCard key={project.uuid} project={project} />
                        ))}

                    </>
                )}
            </div>

            <CreateProjectModal
                showModal={showCreate}
                onClose={() => setShowCreate(false)}
                onProjectCreated={() => setShowCreate(false)}
            />
        </div>
    );
}
