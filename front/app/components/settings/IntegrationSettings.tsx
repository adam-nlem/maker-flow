import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";



export default function IntegrationSettings() {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.Integration]}</h2>
            <p className="text-body-sm text-gray">Cette section sera bientôt disponible.</p>
        </div>
    );
}
