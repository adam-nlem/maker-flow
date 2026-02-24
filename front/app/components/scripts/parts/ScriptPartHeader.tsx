import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface ScriptPartHeaderProps {
    icon: HeroIcon;
    label: string;
    colorClassName: string;
    borderClassName?: string;
}

export default function ScriptPartHeader({ icon: Icon, label, colorClassName, borderClassName = "" }: ScriptPartHeaderProps) {
    return (
        <div
            className={`flex flex-row justify-center items-center gap-3 rounded-lg p-1 ${colorClassName} ${borderClassName}`}
        >
            <Icon className="size-5 shrink-0 text-dark" strokeWidth={1} />
            <span className="text-body-sm whitespace-nowrap text-dark">{label}</span>
        </div>
    );
}
