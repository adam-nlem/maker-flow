import DesktopSidebar from "./DesktopSidebar";
import MobileSidebarShell from "./MobileSidebarShell";
import { getCurrentPageLabelKey } from "~/utils/navigationHelpers";

export default function MobileSidebar() {
    return (
        <MobileSidebarShell
            desktop={<DesktopSidebar />}
            getPageLabelKey={getCurrentPageLabelKey}
        />
    );
}
