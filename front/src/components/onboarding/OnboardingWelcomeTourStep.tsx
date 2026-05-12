import { ChevronRightIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useShowProject } from "~/hooks/api/projects/useShowProject"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { UserRole } from "~/models/enums/UserRole"

function resolveRoleNamespace(role: UserRole | null): "admin" | "collaborator" | "client" {
    if (role === UserRole.Client) return "client"
    if (role === UserRole.Editor || role === UserRole.Viewer) return "collaborator"
    return "admin"
}

export default function OnboardingWelcomeTourStep() {
    const { t } = useTranslation()
    const { user } = useCurrentUser()
    const { advanceStep } = useAdvanceOnboardingStep()
    const focusedProjectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const { project } = useShowProject(user?.isClient ? focusedProjectUuid : null)

    const ns = resolveRoleNamespace(user?.displayRole ?? null)
    const agencyName = user?.isClient ? (project?.agency?.name ?? "") : (user?.agency?.name ?? "")

    const bullets = t(`onboarding:welcomeTour.${ns}.bullets`, { returnObjects: true, defaultValue: [] }) as string[]

    return (
        <OnboardingStepLayout maxWidth="max-w-md">
            <div className="flex flex-col items-center gap-5 w-full">
                <p className="text-body-md text-dark text-center">
                    {t(`onboarding:welcomeTour.${ns}.greeting`, { firstName: user?.firstName ?? "", agencyName })}
                </p>

                {bullets.length > 0 && (
                    <ul className="flex flex-col gap-2 w-full">
                        {bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-body-sm text-dark">
                                <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                                <span>{bullet}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <Button type="button" style="primary" className="mt-3" onClick={advanceStep}>
                    <div className="flex flex-row justify-center items-center gap-3">
                        <p className="text-sm">{t(`onboarding:welcomeTour.${ns}.cta`)}</p>
                        <ChevronRightIcon className="size-4" strokeWidth={2} />
                    </div>
                </Button>
            </div>
        </OnboardingStepLayout>
    )
}
