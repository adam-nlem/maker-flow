import { Button } from "~/components/ui/Button"
import Pill from "~/components/ui/Pill"
import { useContentStore } from "~/stores/content/contentStore"
import { contentTabOptions, contentTabToFrenchTranslation } from "~/models/enums/ContentTab"
import { PlusIcon } from "@heroicons/react/24/outline"
import ContentPlatformFilter from "./ContentPlatformFilter"
import ContentList from "./ContentList"
import ContentGroupDetailPanel from "./ContentGroupDetailPanel"
import ContentPostDetailPanel from "./ContentPostDetailPanel"
import CreateGroupModal from "./CreateGroupModal"

interface ContentPageViewProps {
    projectUuid: string
}

export default function ContentPageView({ projectUuid }: ContentPageViewProps) {
    const activeTab = useContentStore((s) => s.activeTab)
    const setActiveTab = useContentStore((s) => s.setActiveTab)
    const platformFilter = useContentStore((s) => s.platformFilter)
    const setPlatformFilter = useContentStore((s) => s.setPlatformFilter)
    const selectedGroupUuid = useContentStore((s) => s.selectedGroupUuid)
    const selectedPostUuid = useContentStore((s) => s.selectedPostUuid)
    const isCreateGroupModalOpen = useContentStore((s) => s.isCreateGroupModalOpen)
    const setIsCreateGroupModalOpen = useContentStore((s) => s.setIsCreateGroupModalOpen)

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
                {contentTabOptions.map((tab) => (
                    <Pill
                        key={tab}
                        label={contentTabToFrenchTranslation[tab]}
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
                <ContentPlatformFilter
                    projectUuid={projectUuid}
                    platformFilter={platformFilter}
                    onPlatformChange={setPlatformFilter}
                />
            </div>

            {/* Content + panel */}
            <div className="flex flex-row flex-1 min-h-0">
                {/* Main content area */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <ContentList projectUuid={projectUuid} />
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
