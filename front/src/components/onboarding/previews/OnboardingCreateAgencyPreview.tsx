import IdentityPopoverView from "~/components/sidebar/IdentityPopoverView";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore";

export default function OnboardingCreateAgencyPreview() {
  const { user } = useCurrentUser();
  const agencyName = useOnboardingStore((state) => state.agencyName);
  const agencyLogoPreviewUrl = useOnboardingStore((state) => state.agencyLogoPreviewUrl);

  return (
    <OnboardingPreviewLayout>
      <div className="p-4">
        <IdentityPopoverView name={agencyName} logoUrl={agencyLogoPreviewUrl} user={user} />
      </div>
    </OnboardingPreviewLayout>
  )
}
