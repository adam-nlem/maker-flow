import type { Platform } from "~/models/enums/Platform";
import { platformToIcon, PLATFORM_PLACEHOLDER_ICON } from "~/models/enums/Platform";
import Shimmer from "~/components/ui/Shimmer";
import { Button } from "~/components/ui/Button";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";

interface CreateIntegrationCardProps {
  projectUuid: string;
  platform: Platform;
}

export default function CreateIntegrationCard({ projectUuid, platform }: CreateIntegrationCardProps) {
  const { createIntegration, isPending, integrationUuid, oauthError, reset } = useCreateIntegration({
    projectUuid,
    platform: platform,
  });

  const iconUrl = platformToIcon[platform] ?? PLATFORM_PLACEHOLDER_ICON;

  return (
    <div className="border bg-clear border-light-gray rounded-lg p-2 flex flex-col gap-3 justify-between w-full">
      <div className="flex flex-row gap-10 justify-between">
        <div className="flex flex-row gap-1 items-center">
          <Shimmer width="w-10" height="h-10" radius="rounded-full" />

          <div className="flex flex-col gap-1">
            <Shimmer width="w-15" />
            <Shimmer width="w-25" />
          </div>
        </div>

        <img
          src={iconUrl}
          alt={platform}
          className="size-7"
        />
      </div>
      <div className="border-t border-light-gray rounded w-full"></div>
      <Button style="secondary" width="w-full" height="h-7" onClick={() => {
        reset();
        createIntegration();
      }}>
        Se connecter
      </Button>
    </div>
  );
}
