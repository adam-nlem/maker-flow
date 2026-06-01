import { agencySettingsSubscriptionPath } from "~/routes/routePaths";
import CreditBalanceCard from "./subscription/CreditBalanceCard";
import CreditTransactionHistory from "./subscription/CreditTransactionHistory";
import SubscriptionOverview from "./subscription/SubscriptionOverview";
import UsageOverview from "./subscription/UsageOverview";

export default function SubscriptionSettings() {

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 flex flex-col gap-6">
                <CreditBalanceCard />
                <SubscriptionOverview checkoutRedirectPath={agencySettingsSubscriptionPath} />
                <UsageOverview />
                <CreditTransactionHistory />
            </div>
        </div>
    );
}
