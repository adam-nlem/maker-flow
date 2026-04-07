import { useContentsStore } from "~/stores/contents/contentsStore"
import ContentsListPanel from "./ContentsListPanel"
import ContentGroupDetailPanel from "./ContentGroupDetailPanel"
import ContentPostDetailPanel from "./ContentPostDetailPanel"

interface ContentsPageViewProps {
    projectUuid: string
}

export default function ContentsPageView({ projectUuid }: ContentsPageViewProps) {
    const selectedGroupUuid = useContentsStore((s) => s.selectedGroupUuid)
    const selectedPostUuid = useContentsStore((s) => s.selectedPostUuid)

    const rightPanels = (
        <>
            <ContentGroupDetailPanel
                groupUuid={selectedGroupUuid}
            />
            <ContentPostDetailPanel
                postUuid={selectedPostUuid}
            />
        </>
    )

    return (
        <div className="flex flex-row h-full overflow-hidden">
            <ContentsListPanel projectUuid={projectUuid} />
            {rightPanels}
        </div>
    )
}
