import { UserCircleIcon } from "@heroicons/react/24/outline";
import OnboardingPreviewLayout from "../OnboardingPreviewLayout";
import { useOnboardingInviteFirstClientStore } from "~/stores/onboarding/onboardingInviteFirstClientStore";

export default function OnboardingInviteFirstClientPreview() {
  const stagedFirstName = useOnboardingInviteFirstClientStore((state) => state.firstName);
  const stagedLastName = useOnboardingInviteFirstClientStore((state) => state.lastName);
  const stagedEmail = useOnboardingInviteFirstClientStore((state) => state.email);
  const invitation = useOnboardingInviteFirstClientStore((state) => state.invitation);

  // Once the invitation is created, mirror the persisted record instead of the staging fields.
  const firstName = invitation?.firstName ?? stagedFirstName;
  const lastName = invitation?.lastName ?? stagedLastName;
  const email = invitation?.email ?? stagedEmail;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <OnboardingPreviewLayout>
      <div className="self-start pt-5 pl-4">
        <div className="w-90 rounded-xl border border-pale-gray shadow-lg bg-clear overflow-hidden">
          <div className="h-20 w-full bg-pale-gray-2" />

          <div className="px-5 -mt-10">
            <div className="inline-block rounded-md bg-clear p-1">
              <div className="flex size-16 items-center justify-center rounded-md bg-pale-gray-2 text-muted-2">
                <UserCircleIcon className="size-8" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-5 pt-3 min-w-0">
            <span className="text-heading-md font-semibold truncate">{fullName}</span>
            {email && <span className="text-body-sm text-muted-2 truncate">{email}</span>}
          </div>
        </div>
      </div>
    </OnboardingPreviewLayout>
  )
}
