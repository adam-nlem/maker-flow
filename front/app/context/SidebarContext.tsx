import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SidebarContextType {
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const value = {
        isExpanded,
        setIsExpanded,
    };

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
