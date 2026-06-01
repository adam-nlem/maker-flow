import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRightStartOnRectangleIcon, Cog6ToothIcon, EnvelopeIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Tag } from "~/components/ui/Tag";
import AgencyLogo from "~/components/agency/AgencyLogo";
import { userRoleTranslationKeys } from "~/models/enums/UserRole";
import type { Agency } from "~/models/Agency";
import type { User } from "~/models/User";

interface CurrentAgencyPopoverViewProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  agency?: Agency;
  logoUrl?: string | null;
  user?: User | null;
  onSettings?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

const CurrentAgencyPopoverView = forwardRef<HTMLDivElement, CurrentAgencyPopoverViewProps>(
  ({ name, agency, logoUrl, user, onSettings, onLogout, isLoggingOut = false, className = "", ...props }, ref) => {
    const { t } = useTranslation();
    return (
      <div
        ref={ref}
        className={`w-90 rounded-xl border border-pale-gray shadow-lg bg-clear overflow-hidden ${className}`}
        {...props}
      >
        <div className="h-20 w-full bg-pale-gray-2" />

        <div className="px-5 -mt-10">
          <div className="inline-block rounded-md bg-clear p-1">
            <AgencyLogo agencyName={name} agencyUuid={agency?.uuid} logoUrl={logoUrl} className="size-16" />
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 pt-3">
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-heading-md font-semibold truncate">
              {name}
            </span>
            {agency?.contactEmail && (
              <div className="flex flex-row items-center gap-2 text-body-sm text-muted-2 min-w-0">
                <EnvelopeIcon className="size-4 shrink-0" strokeWidth={1.8} />
                <span className="truncate">{agency.contactEmail}</span>
              </div>
            )}
            {agency?.website && (
              <div className="flex flex-row items-center gap-2 text-body-sm text-muted-2 min-w-0">
                <GlobeAltIcon className="size-4 shrink-0" strokeWidth={1.8} />
                <span className="truncate">{agency.website}</span>
              </div>
            )}
          </div>

          {user && (
            <div className="flex flex-col gap-2 border-t border-pale-gray pt-4">
              <h3 className="text-body-xs text-muted-2 uppercase">{t("identityPopover:sections.account")}</h3>
              <span className="text-heading-sm font-semibold truncate">{user.fullName}</span>
              <span className="text-body-sm text-muted-2 truncate">{user.email}</span>
              {user.displayRole && (
                <Tag bgClassName="bg-primary/10" textClassName="text-primary" label={t(userRoleTranslationKeys[user.displayRole])} className="self-start" />
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-5">
            <Button type="button" style="secondary" onClick={onSettings}>
              <Cog6ToothIcon className="size-4" strokeWidth={1.8} />
              <p className="text-sm">{t("identityPopover:settings")}</p>
            </Button>
            <Button type="button" style="danger" onClick={onLogout} isLoading={isLoggingOut} disabled={isLoggingOut}>
              <ArrowRightStartOnRectangleIcon className="size-4" strokeWidth={1.8} />
              <p className="text-sm">{t("identityPopover:logout")}</p>
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

export default CurrentAgencyPopoverView;
