import { Outlet } from "react-router-dom";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";

export default function SidebarLayout() {
  return (
    <>
      <MobileSidebar />

      <div className="flex w-full h-screen">
        {/* Desktop sidebar: hidden on mobile */}
        <div className="hidden md:block">
          <DesktopSidebar />
        </div>

        {/* Page content: top padding on mobile for the fixed header */}
        <div className="flex-1 min-w-0 pt-12 md:pt-0 h-full">
          <Outlet />
        </div>
      </div>
    </>
  );
}
