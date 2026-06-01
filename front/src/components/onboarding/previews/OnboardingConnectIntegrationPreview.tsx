import { useListPaginatedPosts } from "~/hooks/api/posts/useListPaginatedPosts";
import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import ContentPostCard from "~/components/contents/ContentPostCard";
import ContentListPanel from "~/components/contents/ContentListPanel";

export default function OnboardingConnectIntegrationPreview() {

  const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
  const { posts, isLoading } = useListPaginatedPosts({ projectUuid: projectUuid, platform: null, limit: 30 })
  return (
    <OnboardingPreviewLayout>
      <div className="h-330">
        <ContentListPanel projectUuid={projectUuid!} isReadOnly />
      </div>
    </OnboardingPreviewLayout>
  )
}
