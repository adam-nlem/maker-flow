import type { ReactNode } from "react";

interface SidebarShellProps {
    topSection: ReactNode;
    bottomNav?: ReactNode;
    identityTile?: ReactNode;
}

export default function SidebarShell({ topSection, bottomNav, identityTile }: SidebarShellProps) {
    return (
        <div className="w-14 shrink-0 h-full border-r border-pale-gray bg-clear flex flex-col justify-between overflow-visible">
            <div className="p-2 flex flex-col items-center gap-2">
                {topSection}
            </div>

            <div>
                {bottomNav && (
                    <div className="mb-2 flex flex-col items-center gap-1 p-2">
                        {bottomNav}
                    </div>
                )}

                {identityTile && (
                    <div className="border-t border-pale-gray">
                        {identityTile}
                    </div>
                )}
            </div>
        </div>
    );
}
