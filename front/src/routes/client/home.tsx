import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useLogout } from "~/hooks/api/users/useLogout"

export default function ClientHomePage() {
    const { t } = useTranslation()
    const { user } = useCurrentUser()
    const { logout, isPending: isLoggingOut } = useLogout()

    const accent = user?.agency?.brandColor ?? undefined

    return (
        <div className="bg-clear bg-dot-pattern h-full flex items-center justify-center px-4">
            <div className="bg-white border border-light-gray rounded-2xl shadow-sm max-w-md w-full p-8 flex flex-col items-center gap-4">
                {user?.agency && (
                    <span
                        className="text-heading-sm font-semibold"
                        style={accent ? { color: accent } : undefined}
                    >
                        {user.agency.name}
                    </span>
                )}
                <h1 className="text-heading-lg font-semibold text-dark text-center">
                    {t("clientPortal:home.title")}
                </h1>
                {user?.firstName && (
                    <p className="text-body text-dark/80 text-center">
                        {t("clientPortal:home.greeting", { name: user.firstName })}
                    </p>
                )}
                <p className="text-body text-dark/60 text-center">
                    {t("clientPortal:home.subtitle")}
                </p>
                <Button
                    type="button"
                    style="outline"
                    width="w-auto"
                    onClick={logout}
                    isLoading={isLoggingOut}
                    disabled={isLoggingOut}
                >
                    <span className="text-sm">{t("clientPortal:home.logout")}</span>
                </Button>
            </div>
        </div>
    )
}
