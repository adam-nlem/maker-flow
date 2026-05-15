import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon, Cog6ToothIcon, EnvelopeIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { FloatingPortal } from "@floating-ui/react";
import type { CSSProperties } from "react";
import { Button } from "~/components/ui/Button";
import { Tag } from "~/components/ui/Tag";
import AgencyLogo from "~/components/agency/AgencyLogo";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useLogout } from "~/hooks/api/users/useLogout";
import { userRoleTranslationKeys } from "~/models/enums/UserRole";
import { agencySettingsGeneralPath, clientSettingsGeneralPath } from "~/routes/routePaths";
import type { Agency } from "~/models/Agency";

interface IdentityModalProps {
    agency: Agency;
    floatingRef: (node: HTMLElement | null) => void;
    floatingStyles: CSSProperties;
    getFloatingProps: () => Record<string, unknown>;
}

export default function IdentityModal({ agency, floatingRef, floatingStyles, getFloatingProps }: IdentityModalProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useCurrentUser();
    const { logout, isPending } = useLogout();

    const settingsPath = user?.isClient ? clientSettingsGeneralPath : agencySettingsGeneralPath;

    return (
        <FloatingPortal>
            <div
                ref={floatingRef}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-50 w-90 rounded-xl border border-pale-gray shadow-lg bg-clear overflow-hidden"
            >
                <div className="h-20 w-full bg-pale-gray-2" />

                <div className="px-5 -mt-10">
                    <div className="inline-block rounded-md bg-clear p-1">
                        <AgencyLogo agency={agency} className="size-16" />
                    </div>
                </div>

                <div className="flex flex-col gap-5 p-5 pt-3">
                    <div className="flex flex-col gap-2 min-w-0">
                        <span className="text-heading-md font-semibold truncate">
                            {agency.name}
                        </span>
                        {agency.contactEmail && (
                            <div className="flex flex-row items-center gap-2 text-body-sm text-muted-2 min-w-0">
                                <EnvelopeIcon className="size-4 shrink-0" strokeWidth={1.8} />
                                <span className="truncate">{agency.contactEmail}</span>
                            </div>
                        )}
                        {agency.website && (
                            <div className="flex flex-row items-center gap-2 text-body-sm text-muted-2 min-w-0">
                                <GlobeAltIcon className="size-4 shrink-0" strokeWidth={1.8} />
                                <span className="truncate">{agency.website}</span>
                            </div>
                        )}
                    </div>

                    {user && (
                        <div className="flex flex-col gap-2 border-t border-pale-gray pt-4">
                            <h3 className="text-body-xs text-muted-2 uppercase">{t("identityModal:sections.account")}</h3>
                            <span className="text-heading-sm font-semibold truncate">{user.fullName}</span>
                            <span className="text-body-sm text-muted-2 truncate">{user.email}</span>
                            {user.displayRole && (
                                <Tag color="primary" label={t(userRoleTranslationKeys[user.displayRole])} className="self-start" />
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 mt-5">


                        <Button type="button" style="secondary" onClick={() => navigate(settingsPath)}>
                            <Cog6ToothIcon className="size-4" strokeWidth={1.8} />
                            <p className="text-sm">{t("identityModal:settings")}</p>
                        </Button>
                        <Button type="button" style="danger" onClick={() => { void logout(); }} isLoading={isPending} disabled={isPending}>
                            <ArrowRightStartOnRectangleIcon className="size-4" strokeWidth={1.8} />
                            <p className="text-sm">{t("identityModal:logout")}</p>
                        </Button>
                    </div>
                </div>
            </div>
        </FloatingPortal>
    );
}
