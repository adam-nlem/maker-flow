import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";

export default function IntegrationSettings() {
    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-5 border-b border-light-gray">
                <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.Integration]}</h2>
            </div>
            <div className="flex-1 px-6 py-5">
                <p className="text-body-sm text-gray">Cette section sera bientôt disponible.</p>
            </div>
        </div>
    );
}
