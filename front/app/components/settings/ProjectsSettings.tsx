import { useEffect, useRef, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";
import { Button } from "~/components/ui/Button";
import Shimmer from "~/components/ui/Shimmer";
import CreateProjectModal from "~/components/projects/CreateProjectModal";
import ProjectSettingsCard from "./project/ProjectSettingsCard";

export default function ProjectsSettings() {
    const [showCreate, setShowCreate] = useState(false);
    const { projects, isLoading, hasMore, isLoadingMore, listMore } = useListPaginatedProjects();
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    listMore();
                }
            },
            { rootMargin: "0px 0px 200px 0px" },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoadingMore, listMore]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-light-gray flex flex-col gap-1">
                <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.Projects]}</h2>
                <p className="text-body-sm text-gray">Gérez vos projets et leurs paramètres.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
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
                        <div ref={sentinelRef} className="h-1" />
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
