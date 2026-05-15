import { useTranslation } from "react-i18next";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { useLogout } from "~/hooks/api/users/useLogout";

export default function ClientPortalLockedView() {
    const { t } = useTranslation();
    const { logout, isPending: isLoggingOut } = useLogout();

    return (
        <div className="bg-clear bg-dot-pattern h-screen w-full flex items-center justify-center px-4">
            <div className="bg-pale-gray-2 border border-pale-gray rounded-2xl shadow-sm max-w-md w-full p-8 flex flex-col items-center gap-4">
                <div className="size-12 rounded-full bg-clear flex items-center justify-center">
                    <LockClosedIcon className="size-6 text-muted-2" />
                </div>
                <h1 className="text-heading-lg font-semibold text-dark text-center">
                    {t("clientPortal:locked.title")}
                </h1>
                <p className="text-body-base text-dark/70 text-center">
                    {t("clientPortal:locked.body")}
                </p>
                <Button
                    type="button"
                    style="outline"
                    width="w-auto"
                    onClick={logout}
                    isLoading={isLoggingOut}
                    disabled={isLoggingOut}
                >
                    <span className="text-sm">{t("clientPortal:locked.logout")}</span>
                </Button>
            </div>
        </div>
    );
}
