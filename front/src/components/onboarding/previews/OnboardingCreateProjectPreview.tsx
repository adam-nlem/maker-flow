import CurrentProjectPopoverView from "~/components/sidebar/CurrentProjectPopoverView";
import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useOnboardingCreateProjectStore } from "~/stores/onboarding/onboardingCreateProjectStore";

export default function OnboardingCreateProjectPreview() {
  const projectName = useOnboardingCreateProjectStore((state) => state.projectName);
  const projectLogoPreviewUrl = useOnboardingCreateProjectStore((state) => state.projectLogoPreviewUrl);
  const projectTypes = useOnboardingCreateProjectStore((state) => state.projectTypes);
  const project = useOnboardingCreateProjectStore((state) => state.project);

  return (
    <OnboardingPreviewLayout>
      <div className="self-start pt-5 pl-4">
        {project ? (
          <CurrentProjectPopoverView name={project.name} types={project.types} project={project} />
        ) : (
          <CurrentProjectPopoverView name={projectName} types={projectTypes} logoUrl={projectLogoPreviewUrl} />
        )}
      </div>
    </OnboardingPreviewLayout>
  )
}
