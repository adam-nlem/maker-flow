import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { privacyPolicyPath, termsOfServicePath } from "~/routes/routePaths";

interface SidebarShellProps {
    topSection: ReactNode;
    bottomNav: ReactNode;
    identityTile?: ReactNode;
}

export default function SidebarShell({ topSection, bottomNav, identityTile }: SidebarShellProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="w-50 shrink-0 h-screen border-r border-light-gray bg-clear flex flex-col justify-between overflow-hidden">
            <div className="p-3">
                {topSection}
            </div>

            <div>
                <div className="mb-5 flex flex-col p-3">
                    {bottomNav}
                </div>

                <div className="border-t border-light-gray rounded w-full"></div>

                {identityTile}

                <div className="px-3 pb-3 flex gap-2 justify-center items-center text-body-xs">
                    <SimpleTextButton onClick={() => navigate(privacyPolicyPath)}>
                        {t("legal.privacyPolicy")}
                    </SimpleTextButton>
                    <span className="text-xs text-gray">·</span>
                    <SimpleTextButton onClick={() => navigate(termsOfServicePath)}>
                        {t("legal.termsOfService")}
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    );
}
