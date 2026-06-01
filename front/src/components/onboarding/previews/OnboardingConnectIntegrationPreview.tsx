import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import ContentListPanel from "~/components/contents/ContentListPanel";

export default function OnboardingConnectIntegrationPreview() {

  const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
  return (
    <OnboardingPreviewLayout>
      <div className="h-screen">
        <ContentListPanel projectUuid={projectUuid!} isReadOnly />
      </div>
    </OnboardingPreviewLayout>
  )
}
