import { Button } from "~/components/ui/Button"
import Pill from "~/components/ui/Pill"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { contentsTabOptions, contentsTabToFrenchTranslation } from "~/models/enums/ContentsTab"
import { PlusIcon } from "@heroicons/react/24/outline"
import ContentsPlatformFilter from "./ContentsPlatformFilter"
import ContentsList from "./ContentsList"
import ContentGroupDetailPanel from "./ContentGroupDetailPanel"
import ContentPostDetailPanel from "./ContentPostDetailPanel"
import CreateGroupModal from "./CreateGroupModal"

interface ContentsPageViewProps {
    projectUuid: string
}

export default function ContentsPageView({ projectUuid }: ContentsPageViewProps) {
    const activeTab = useContentsStore((s) => s.activeTab)
    const setActiveTab = useContentsStore((s) => s.setActiveTab)
    const platformFilter = useContentsStore((s) => s.platformFilter)
    const setPlatformFilter = useContentsStore((s) => s.setPlatformFilter)
    const selectedGroupUuid = useContentsStore((s) => s.selectedGroupUuid)
    const selectedPostUuid = useContentsStore((s) => s.selectedPostUuid)
    const isCreateGroupModalOpen = useContentsStore((s) => s.isCreateGroupModalOpen)
    const setIsCreateGroupModalOpen = useContentsStore((s) => s.setIsCreateGroupModalOpen)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-row items-center justify-between px-6 py-4 border-b border-light-gray">
                <h1 className="text-heading-xl">Contenus</h1>
                <Button
                    style="primary"
                    width="w-fit"
                    onClick={() => setIsCreateGroupModalOpen(true)}
                >
                    <div className="flex flex-row items-center gap-2">
                        <PlusIcon className="size-4" strokeWidth={2} />
                        <p className="text-sm">Nouveau groupe</p>
                    </div>
                </Button>
            </div>

            {/* Tab bar */}
            <div className="flex flex-row items-center gap-2 px-6 py-3 border-b border-light-gray">
                {contentsTabOptions.map((tab) => (
                    <Pill
                        key={tab}
                        label={contentsTabToFrenchTranslation[tab]}
                        isSelected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        bgColorClassName="bg-primary/10"
                        borderColorClassName="border-primary/30"
                        textColorClassName="text-primary"
                    />
                ))}

            </div>

            {/* Platform filter */}
            <div className="px-6 py-3">
                <ContentsPlatformFilter
                    projectUuid={projectUuid}
                    platformFilter={platformFilter}
                    onPlatformChange={setPlatformFilter}
                />
            </div>

            {/* Content + panel */}
            <div className="flex flex-row flex-1 min-h-0">
                {/* Main content area */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <ContentsList projectUuid={projectUuid} />
                </div>

                {/* Side panels */}
                {selectedGroupUuid && (
                    <ContentGroupDetailPanel
                        groupUuid={selectedGroupUuid}
                        projectUuid={projectUuid}
                    />
                )}

                {selectedPostUuid && (
                    <ContentPostDetailPanel
                        postUuid={selectedPostUuid}
                        projectUuid={projectUuid}
                    />
                )}

            </div>

            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={() => setIsCreateGroupModalOpen(false)}
                projectUuid={projectUuid}
            />
        </div>
    )
}
