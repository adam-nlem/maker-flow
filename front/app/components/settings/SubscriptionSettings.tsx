import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";



export default function SubscriptionSettings() {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.Subscription]}</h2>
            <p className="text-body-sm text-gray">Cette section sera bientôt disponible.</p>
        </div>
    );
}
