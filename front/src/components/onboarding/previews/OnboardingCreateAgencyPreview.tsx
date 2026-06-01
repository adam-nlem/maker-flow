import CurrentAgencyPopoverView from "~/components/sidebar/CurrentAgencyPopoverView";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useOnboardingCreateAgencyStore } from "~/stores/onboarding/onboardingCreateAgencyStore";

export default function OnboardingCreateAgencyPreview() {
  const { user } = useCurrentUser();
  const agencyName = useOnboardingCreateAgencyStore((state) => state.agencyName);
  const agencyLogoPreviewUrl = useOnboardingCreateAgencyStore((state) => state.agencyLogoPreviewUrl);
  const agency = useOnboardingCreateAgencyStore((state) => state.agency);

  return (
    <OnboardingPreviewLayout>
      <div className="p-4">
        {agency ? (
          <CurrentAgencyPopoverView name={agency.name} agency={agency} user={user} />
        ) : (
          <CurrentAgencyPopoverView name={agencyName} logoUrl={agencyLogoPreviewUrl} user={user} />
        )}
      </div>
    </OnboardingPreviewLayout>
  )
}
