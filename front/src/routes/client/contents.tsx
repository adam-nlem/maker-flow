import ContentsPageView from "~/components/contents/ContentsPageView";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";

export default function ClientContentsPage() {
  const projectUuid = useFocusProjectStore((state) => state.focusedProjectUuid);

  if (!projectUuid) return null;

  return (
    <div className="h-full">
      <ContentsPageView projectUuid={projectUuid} isReadOnly />
    </div>
  );
}
