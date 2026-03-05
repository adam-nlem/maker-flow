import { platformOptions } from "~/models/enums/Platform";
import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import IntegrationSettingCard from "./integration/IntegrationSettingCard";
import Shimmer from "~/components/ui/Shimmer";

interface IntegrationSettingsProps {
    projectUuid: string;
}

export default function IntegrationSettings({ projectUuid }: IntegrationSettingsProps) {
    const { integrations, isLoading } = useListIntegrations({ projectUuid });

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-light-gray flex flex-col gap-1">
                <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.Integration]}</h2>
                <p className="text-body-sm text-gray">Connectez vos réseaux sociaux pour analyser vos performances.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                {isLoading ? (
                    <Shimmer height="h-32" width="w-full" />
                ) : (
                    platformOptions.map((platform) => (
                        <IntegrationSettingCard
                            key={platform}
                            projectUuid={projectUuid}
                            platform={platform}
                            integration={integrations.find((i) => i.platform === platform) ?? null}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
