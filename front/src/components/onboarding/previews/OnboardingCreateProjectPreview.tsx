import IdentityPopoverView from "~/components/sidebar/IdentityPopoverView";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore";

export default function OnboardingCreateProjectPreview() {
  const { user } = useCurrentUser();

  return (
    <OnboardingPreviewLayout>
      <div className="p-4">
      </div>
    </OnboardingPreviewLayout>
  )
}
