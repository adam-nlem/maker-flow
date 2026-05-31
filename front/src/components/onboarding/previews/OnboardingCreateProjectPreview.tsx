import CurrentProjectPopoverView from "~/components/sidebar/CurrentProjectPopoverView";
import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore";

export default function OnboardingCreateProjectPreview() {
  const projectName = useOnboardingStore((state) => state.projectName);
  const projectLogoPreviewUrl = useOnboardingStore((state) => state.projectLogoPreviewUrl);
  const projectTypes = useOnboardingStore((state) => state.projectTypes);

  return (
    <OnboardingPreviewLayout>
      <div className="self-start pt-5 pl-4">
        <CurrentProjectPopoverView name={projectName} types={projectTypes} logoUrl={projectLogoPreviewUrl} />
      </div>
    </OnboardingPreviewLayout>
  )
}
