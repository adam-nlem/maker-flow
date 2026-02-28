import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";

export default function ProjectSettings() {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.Project]}</h2>
            <p className="text-body-sm text-gray">Cette section sera bientôt disponible.</p>
        </div>
    );
}
