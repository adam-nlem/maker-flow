import type { ComponentType, SVGProps } from "react";
import { useLocation, useNavigate } from "react-router";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface NavigationTileProps {
    isExpanded: boolean;
    isBold: boolean;
    route: string;
    outlineIcon: HeroIcon;
    solidIcon: HeroIcon;
    label: string;
}

export default function NavigationTile({ 
    isExpanded, 
    isBold,
    route, 
    outlineIcon: OutlineIcon, 
    solidIcon: SolidIcon, 
    label 
}: NavigationTileProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = location.pathname === route;
    const Icon = isActive ? SolidIcon : OutlineIcon;

    return (
        <div
            className="flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-light-gray"
            onClick={() => navigate(route)}
        >
            <Icon className={`size-5 shrink-0 ${isActive ? 'text-dark' : 'text-gray'}`} strokeWidth={isBold ? 2 : 1} />
            {isExpanded && <h1 className={`${isBold ? 'text-heading-sm' : 'text-body-sm'} whitespace-nowrap ${isActive ? 'text-dark' : 'text-gray'}`}>{label}</h1>}
        </div>
    );
}