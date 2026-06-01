import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { sidebarMainNavigationItems, navigationItemToIconSolid, navigationItemToIcon, navigationItemTranslationKeys } from "~/models/enums/NavigationItem"
import { isNavigationItemSelected } from "~/utils/navigationHelpers"
import AgencyLogo from "../agency/AgencyLogo"
import IconWithTextTile from "../ui/IconWithTextTile"
import Shimmer from "../ui/Shimmer"
import { useOnboardingCreateAgencyStore } from "~/stores/onboarding/onboardingCreateAgencyStore"
import { useOnboardingCreateProjectStore } from "~/stores/onboarding/onboardingCreateProjectStore"
import ProjectLogo from "../project/ProjectLogo"

interface OnboardingPreviewLayoutProps {
  children: ReactNode
}

export default function OnboardingPreviewLayout({
  children,
}: OnboardingPreviewLayoutProps) {
  const { t } = useTranslation()
  const { currentStepConfig } = useOnboardingFlow()
  const stagedAgencyName = useOnboardingCreateAgencyStore((state) => state.agencyName);
  const agencyLogoPreviewUrl = useOnboardingCreateAgencyStore((state) => state.agencyLogoPreviewUrl);
  const agency = useOnboardingCreateAgencyStore((state) => state.agency);
  const stagedProjectName = useOnboardingCreateProjectStore((state) => state.projectName);
  const projectLogoPreviewUrl = useOnboardingCreateProjectStore((state) => state.projectLogoPreviewUrl);
  const project = useOnboardingCreateProjectStore((state) => state.project);

  // Once an entity is created, mirror the persisted record (real name + uuid-driven logo fetch)
  // instead of the staging blob URL, which gets revoked and would leave a broken logo.
  const agencyName = agency?.name ?? stagedAgencyName;
  const projectName = project?.name ?? stagedProjectName;

  if (!currentStepConfig) {
    return null
  }

  return (
    <div className="h-screen w-1/2 flex flex-col justify-center items-center p-5">
      <div className="bg-clear w-full h-full grid place-items-center">
        <div className="border border-pale-gray w-screen h-full rounded-xl flex items-end">
          <div className="h-full w-50 border-r border-pale-gray rounded-l-xl p-2 flex flex-col">
            {projectName ? (
              <div className="m-3 flex flex-row items-center gap-3 rounded-lg p-1 border border-transparent min-w-0">
                {project ? (
                  <ProjectLogo projectUuid={project.uuid} projectName={projectName} className="size-9 shrink-0" />
                ) : (
                  <ProjectLogo logoUrl={projectLogoPreviewUrl} projectName={projectName} className="size-9 shrink-0" />
                )}
                <span className="text-heading-sm font-semibold whitespace-nowrap truncate text-left">
                  {projectName}
                </span>
              </div>
            ) : (
              <div className="m-3">
                <Shimmer width="w-full" height="h-11" radius="rounded-lg" />
              </div>
            )}
            <div className="mt-4 flex flex-col p-3 gap-1">
              {sidebarMainNavigationItems.map((item) => {
                const selected = isNavigationItemSelected(item, location.pathname);
                return (
                  <IconWithTextTile
                    key={item}
                    icon={selected ? navigationItemToIconSolid[item] : navigationItemToIcon[item]}
                    label={t(navigationItemTranslationKeys[item])}
                    isSelected={selected}
                    className="w-full"
                  />
                );
              })}
            </div>

            <div className="mt-auto">
              {agencyName ? (
                <div className="m-3 flex flex-row items-center gap-3 rounded-lg p-1 border border-transparent min-w-0">
                  {agency ? (
                    <AgencyLogo agencyUuid={agency.uuid} agencyName={agencyName} className="size-9 shrink-0" />
                  ) : (
                    <AgencyLogo logoUrl={agencyLogoPreviewUrl} agencyName={agencyName} className="size-9 shrink-0" />
                  )}
                  <span className="text-heading-sm font-semibold whitespace-nowrap truncate text-left">
                    {agencyName}
                  </span>
                </div>
              ) : (
                <div className="m-3">
                  <Shimmer width="w-full" height="h-11" radius="rounded-lg" />
                </div>
              )}
            </div>

          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
