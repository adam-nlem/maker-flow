import DesktopSidebar from "./DesktopSidebar";
import MobileSidebarShell from "~/components/sidebar/MobileSidebarShell";

export default function MobileSidebar() {
    return <MobileSidebarShell desktop={<DesktopSidebar />} />;
}
