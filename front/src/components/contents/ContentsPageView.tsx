import { useContentsStore } from "~/stores/contents/contentsStore"
import ContentListPanel from "./ContentListPanel"
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
            <ContentListPanel projectUuid={projectUuid} />
            {rightPanels}
        </div>
    )
}
