import ClientDesktopSidebar from "./ClientDesktopSidebar";
import MobileSidebarShell from "~/components/sidebar/MobileSidebarShell";

export default function ClientMobileSidebar() {
    return <MobileSidebarShell desktop={<ClientDesktopSidebar />} />;
}
