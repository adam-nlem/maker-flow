import { useTranslation } from "react-i18next";
import { SettingsSection, settingsSectionTranslationKeys } from "~/models/enums/SettingsSection";
import CreditBalanceCard from "./subscription/CreditBalanceCard";
import CreditTransactionHistory from "./subscription/CreditTransactionHistory";
import SubscriptionOverview from "./subscription/SubscriptionOverview";

export default function SubscriptionSettings() {
    const { t } = useTranslation();

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-light-gray flex flex-col gap-1">
                <h2 className="text-heading-xl">{t(settingsSectionTranslationKeys[SettingsSection.Subscription])}</h2>
                <p className="text-body-sm text-gray">{t("settings:subscription.subtitle")}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 flex flex-col gap-6">
                <CreditBalanceCard />
                <SubscriptionOverview />
                <CreditTransactionHistory />
            </div>
        </div>
    );
}
