import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { SettingsSection, settingsSectionTranslationKeys } from "~/models/enums/SettingsSection";
import Shimmer from "~/components/ui/Shimmer";
import CreateProjectModal from "~/components/projects/CreateProjectModal";
import ProjectSettingsCard from "./project/ProjectSettingsCard";

export default function ProjectsSettings() {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const { projects, isLoading, hasMore, isLoadingMore, listMore } = useListPaginatedProjects();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollContainerRef, hasMore, isLoadingMore, listMore);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-light-gray flex flex-col gap-1">
                <h2 className="text-heading-xl">{t(settingsSectionTranslationKeys[SettingsSection.Projects])}</h2>
                <p className="text-body-sm text-gray">{t("settings:projects.subtitle")}</p>
            </div>

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
