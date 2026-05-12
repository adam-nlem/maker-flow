import { useContentsStore } from "~/stores/contents/contentsStore"
import ContentListPanel from "./ContentListPanel"
import ContentGroupDetailPanel from "./ContentGroupDetailPanel"
import ContentPostDetailPanel from "./ContentPostDetailPanel"

interface ContentsPageViewProps {
    projectUuid: string
    isReadOnly?: boolean
}

export default function ContentsPageView({ projectUuid, isReadOnly = false }: ContentsPageViewProps) {
    const selectedGroupUuid = useContentsStore((s) => s.selectedGroupUuid)
    const selectedPostUuid = useContentsStore((s) => s.selectedPostUuid)

    const rightPanels = (
        <>
            <ContentGroupDetailPanel
                groupUuid={selectedGroupUuid}
                isReadOnly={isReadOnly}
            />
            <ContentPostDetailPanel
                postUuid={selectedPostUuid}
            />
        </>
    )

    return (
        <div className="flex flex-row h-full overflow-hidden">
            <ContentListPanel projectUuid={projectUuid} isReadOnly={isReadOnly} />
            {rightPanels}
        </div>
    )
}
