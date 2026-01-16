import type { Integration } from "~/models/Integration";

interface SocialAnalyticsDashboardContentProps {
    userModuleUuid: string;
    integrations: Integration[];
}

export default function SocialAnalyticsDashboardContent({
    userModuleUuid,
    integrations,
}: SocialAnalyticsDashboardContentProps) {
    return (
        <div className="m-5 w-1/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <h2 className="text-heading-lg text-primary">Social Analytics</h2>
                <p className="text-body-md text-secondary">
                    {integrations.length} account(s) connected
                </p>
                <p className="text-body-sm text-gray">
                    Dashboard content coming soon...
                </p>
            </div>
        </div>
    );
}
