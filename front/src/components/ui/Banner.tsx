import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface BannerProps {
    icon: HeroIcon;
    title: string;
    subtitle?: string;
    bgClassName?: string;
    textClassName?: string;
    borderClassName?: string;
    className?: string;
}

export function Banner({ icon: Icon, title, subtitle, bgClassName = "", textClassName = "text-dark", borderClassName = "", className = "" }: BannerProps) {
    return (
        <div className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl ${bgClassName} ${borderClassName} ${className}`}>
            <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${bgClassName}`}>
                <Icon className={`size-5 ${textClassName}`} />
            </div>
            <div className="flex flex-col">
                <span className="text-heading-sm text-dark">{title}</span>
                {subtitle && <span className="text-body-sm text-muted">{subtitle}</span>}
            </div>
        </div>
    );
}
