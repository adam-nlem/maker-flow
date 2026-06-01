import { Fragment, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bars3Icon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useMobileSidebarStore } from "~/stores/sidebar/mobileSidebarStore";
import { getCurrentBreadcrumbKeys } from "~/utils/navigationHelpers";

interface TopBarShellProps {
    brand: ReactNode;
    settingsPath: string;
    actions?: ReactNode;
}

export default function TopBarShell({ brand, settingsPath, actions }: TopBarShellProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const setMobileSidebarOpen = useMobileSidebarStore((s) => s.setIsOpen);

    const breadcrumbKeys = getCurrentBreadcrumbKeys(location.pathname);

    return (
        <header className="shrink-0 h-14 border-b border-pale-gray bg-clear flex items-center px-3 md:px-4 gap-3">
            {!isDesktop && (
                <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-1 -ml-1 shrink-0"
                    aria-label={t("navigation:openSidebar")}
                >
                    <Bars3Icon className="size-6 text-dark" strokeWidth={2} />
                </button>
            )}

            <div className="flex items-center gap-2 shrink-0">
                {brand}
            </div>

            {breadcrumbKeys.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5 min-w-0">
                    {breadcrumbKeys.map((key, index) => {
                        const isLast = index === breadcrumbKeys.length - 1;
                        return (
                            <Fragment key={key}>
                                <span className="text-muted-2 shrink-0">/</span>
                                <span className={`text-body-sm truncate ${isLast ? "text-dark" : "text-muted"}`}>
                                    {t(key)}
                                </span>
                            </Fragment>
                        );
                    })}
                </div>
            )}

            <div className="ml-auto flex items-center gap-2 shrink-0">
                {actions}
                <button
                    type="button"
                    onClick={() => navigate(settingsPath)}
                    className="size-8 rounded-md hover:bg-surface-hover flex items-center justify-center"
                    aria-label={t("navigation:openSettings")}
                >
                    <Cog6ToothIcon className="size-5 text-muted" strokeWidth={2} />
                </button>
            </div>
        </header>
    );
}
