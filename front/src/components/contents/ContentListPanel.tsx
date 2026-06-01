import { useTranslation } from "react-i18next"
import Pill from "~/components/ui/Pill"
import { ContentsTab, contentsTabOptions, contentsTabTranslationKeys } from "~/models/enums/ContentsTab"
import { useContentsStore } from "~/stores/contents/contentsStore"
import { useContentsRightPanelStore } from "~/stores/contents/contentsRightPanelStore"
import ContentsPlatformFilter from "./ContentsPlatformFilter"
import CreateGroupModal from "./CreateGroupModal"
import SearchBar from "../ui/SearchBar"
import ContentGroupList from "./ContentGroupList"
import ContentPostList from "./ContentPostList"

interface ContentListPanelProps {
  projectUuid: string
  isReadOnly?: boolean
}

export default function ContentListPanel({ projectUuid, isReadOnly = false }: ContentListPanelProps) {
  const { t } = useTranslation()
  const activeTab = useContentsStore((s) => s.activeTab)
  const setActiveTab = useContentsStore((s) => s.setActiveTab)
  const platformFilter = useContentsStore((s) => s.platformFilter)
  const setPlatformFilter = useContentsStore((s) => s.setPlatformFilter)
  const setSearchTerm = useContentsStore((s) => s.setSearchTerm)
  const isCreateGroupModalOpen = useContentsStore((s) => s.isCreateGroupModalOpen)
  const setIsCreateGroupModalOpen = useContentsStore((s) => s.setIsCreateGroupModalOpen)
  const closeRightPanel = useContentsRightPanelStore((s) => s.closePanel)

  const isGroupTab = activeTab === ContentsTab.Groups

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      {!isReadOnly && <div className="flex flex-row items-center gap-2 px-6 py-3 border-b border-pale-gray">
        {contentsTabOptions.map((tab) => (
          <Pill
            key={tab}
            label={t(contentsTabTranslationKeys[tab])}
            isSelected={activeTab === tab}
            onClick={() => {
              setActiveTab(tab)
              closeRightPanel()
            }}
            bgColorClassName="bg-primary/10"
            borderColorClassName="border-primary/30"
            textColorClassName="text-primary"
          />
        ))}
      </div>}

      <div className="px-6 py-3 flex flex-row justify-between">
        <ContentsPlatformFilter
          projectUuid={projectUuid}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
        />

        <SearchBar
          setDebouncedSearchTerm={setSearchTerm}
          width="max-w-72"
          focusShortcut={{ key: "f", label: "F" }}
        />
      </div>

      {isGroupTab ? <ContentGroupList projectUuid={projectUuid} /> : <ContentPostList projectUuid={projectUuid} />}

      {!isReadOnly && (
        <CreateGroupModal
          isOpen={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
          projectUuid={projectUuid}
        />
      )}
    </div>
  )
}
