import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { agencySettingsSubscriptionPath } from "~/routes/routePaths";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";

interface PremiumPlaceholderProps {
    isRestricted: boolean;
    title?: string;
    description?: string;
    children: ReactNode;
}

export default function PremiumPlaceholder({
    isRestricted,
    title,
    description,
    children,
}: PremiumPlaceholderProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const resolvedTitle = title ?? t("premium.title");
    const resolvedDescription = description ?? t("premium.description");

    if (!isRestricted) return <>{children}</>;

    return (
        <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-clear/60 z-10 rounded-xl">
                <LockClosedIcon className="size-6 text-gray mb-2" />
                <h2 className="text-heading-md mb-1">{resolvedTitle}</h2>
                <p className="text-body-sm text-gray mb-3 text-center max-w-xs">{resolvedDescription}</p>
                <Button style="primary" width="w-fit" onClick={() => navigate(agencySettingsSubscriptionPath)}>
                    {t("premium.upgradeAction")}
                </Button>
            </div>
        </div>
    );
}
