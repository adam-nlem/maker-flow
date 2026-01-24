import type { ComponentType, ReactNode, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface SocialAnalyticsInsightTileProps {
  label: string;
  value: number;
  Icon: HeroIcon;
}

export default function SocialAnalyticsInsightTile({
  label,
  value,
  Icon,
}: SocialAnalyticsInsightTileProps) {
  return (
    <div className="flex flex-row gap-3 bg-light-gray rounded-lg p-2 w-fit">
      <div>
        <h1 className="text-heading-sm">{value}</h1>
        <p className="text-sm whitespace-nowrap">
          {label}
        </p>
      </div>
      <Icon className="size-5 text-dark" strokeWidth={2} />
    </div>
  );
}