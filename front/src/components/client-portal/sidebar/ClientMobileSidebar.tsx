import ClientDesktopSidebar from "./ClientDesktopSidebar";
import MobileSidebarShell from "~/components/sidebar/MobileSidebarShell";
import { clientHomePath, clientContentsPath, clientSettingsPath } from "~/routes/routePaths";

function getClientPageLabelKey(pathname: string): string | null {
    if (pathname === clientHomePath) return "navigation:items.home";
    if (pathname === clientContentsPath) return "navigation:items.contents";
    if (pathname.startsWith(clientSettingsPath)) return "navigation:items.settings";
    return null;
}

export default function ClientMobileSidebar() {
    return (
        <MobileSidebarShell
            desktop={<ClientDesktopSidebar />}
            getPageLabelKey={getClientPageLabelKey}
        />
    );
}
