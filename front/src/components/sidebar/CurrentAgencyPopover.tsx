import { useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingPortal } from "@floating-ui/react";
import CurrentAgencyPopoverView from "./CurrentAgencyPopoverView";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useLogout } from "~/hooks/api/users/useLogout";
import { agencySettingsGeneralPath, clientSettingsGeneralPath } from "~/routes/routePaths";
import type { Agency } from "~/models/Agency";

interface CurrentAgencyPopoverProps {
  agency: Agency;
  floatingRef: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
  getFloatingProps: () => Record<string, unknown>;
  onClose: () => void;
}

export default function CurrengAgencyPopover({ agency, floatingRef, floatingStyles, getFloatingProps, onClose }: CurrentAgencyPopoverProps) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { logout, isPending } = useLogout();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const settingsPath = user?.isClient ? clientSettingsGeneralPath : agencySettingsGeneralPath;

  return (
    <FloatingPortal>
      <div className="fixed inset-0 z-40 bg-black/40" />

      <CurrentAgencyPopoverView
        ref={floatingRef}
        style={floatingStyles}
        className="z-50"
        agency={agency}
        name={agency.name}
        user={user}
        onSettings={() => { onClose(); navigate(settingsPath); }}
        onLogout={() => { onClose(); void logout(); }}
        isLoggingOut={isPending}
        {...getFloatingProps()}
      />
    </FloatingPortal>
  );
}
