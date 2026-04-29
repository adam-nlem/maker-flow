import { createPortal } from "react-dom";
import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMobileSidebarStore } from "~/stores/sidebar/mobileSidebarStore";
import { getCurrentPageLabelKey } from "~/utils/navigationHelpers";
import { useTranslation } from "react-i18next";
import DesktopSidebar from "./DesktopSidebar";

export default function MobileSidebar() {
  const isOpen = useMobileSidebarStore((state) => state.isOpen);
  const setIsOpen = useMobileSidebarStore((state) => state.setIsOpen);
  const toggle = useMobileSidebarStore((state) => state.toggle);
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const { t } = useTranslation();
  const currentPageLabelKey = getCurrentPageLabelKey(location.pathname);

  // Auto-close on route change
  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      setIsOpen(false);
      previousPathname.current = location.pathname;
    }
  }, [location.pathname, setIsOpen]);

  // ESC key handler + body scroll lock
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-12 bg-clear border-b border-light-gray flex items-center px-3 gap-2">
        <button type="button" onClick={toggle} className="p-1">
          {isOpen
            ? <XMarkIcon className="size-6 text-dark" strokeWidth={2} />
            : <Bars3Icon className="size-6 text-dark" strokeWidth={2} />
          }
        </button>
        <span className="text-heading-sm text-primary">MakerFlow</span>
        {currentPageLabelKey && (
          <>
            <ChevronRightIcon className="size-4 text-gray shrink-0" strokeWidth={2} />
            <span className="text-body-sm text-dark">{t(currentPageLabelKey)}</span>
          </>
        )}
      </div>

      {/* Drawer overlay */}
      {isOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Drawer panel */}
          <div
            className="relative h-screen w-50 bg-clear shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <DesktopSidebar />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
