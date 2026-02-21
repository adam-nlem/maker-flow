import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface Props {
    icon: HeroIcon;
    label: string;
    colorClassName: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptPartHeader({ icon: Icon, label, colorClassName, dragHandleProps }: Props) {
    return (
        <div
            {...dragHandleProps}
            className={`flex flex-row justify-center items-center gap-3 cursor-grab rounded-lg p-1 ${colorClassName}`}
        >
            <Icon className="size-5 shrink-0 text-dark" strokeWidth={1} />
            <span className="text-body-sm whitespace-nowrap text-dark">{label}</span>
        </div>
    );
}
