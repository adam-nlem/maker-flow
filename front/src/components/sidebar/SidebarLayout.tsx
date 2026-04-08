import { Outlet } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";

export default function SidebarLayout() {
  const isDesktop = useIsDesktop();

  return (
    <>
      {!isDesktop && <MobileSidebar />}

      <div className="flex w-full h-screen">
        {isDesktop && <DesktopSidebar />}

        <div className={`flex-1 min-w-0 h-full ${isDesktop ? '' : 'pt-12'}`}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
