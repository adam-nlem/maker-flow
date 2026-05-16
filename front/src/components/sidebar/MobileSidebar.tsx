import DesktopSidebar from "./DesktopSidebar";
import MobileSidebarShell from "./MobileSidebarShell";

export default function MobileSidebar() {
    return <MobileSidebarShell desktop={<DesktopSidebar />} />;
}
