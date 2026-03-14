import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { settingsSubscriptionPath } from "~/routes/routePaths";
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
    title = "Fonctionnalite Premium",
    description = "Passez à un abonnement payant pour acceder à cette fonctionnalite.",
    children,
}: PremiumPlaceholderProps) {
    const navigate = useNavigate();

    if (!isRestricted) return <>{children}</>;

    return (
        <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-clear/60 z-10 rounded-xl">
                <LockClosedIcon className="size-6 text-gray mb-2" />
                <h2 className="text-heading-md mb-1">{title}</h2>
                <p className="text-body-sm text-gray mb-3 text-center max-w-xs">{description}</p>
                <Button style="primary" width="w-fit" onClick={() => navigate(settingsSubscriptionPath)}>
                    Passer à un abonnement superieur
                </Button>
            </div>
        </div>
    );
}
