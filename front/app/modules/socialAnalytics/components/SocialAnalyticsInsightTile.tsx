import type { ComponentType, ReactNode, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface SocialAnalyticsInsightTileProps<T> {
  insight: { type: T; value: number };
  Icon: HeroIcon;
  getLabel: (type: T) => string;
}

export default function SocialAnalyticsInsightTile<T>({
  insight,
  Icon,
  getLabel
}: SocialAnalyticsInsightTileProps<T>) {
  return (
    <div className="flex flex-row gap-3 bg-light-gray rounded-lg p-2 w-fit">
      <div>
        <h1 className="text-heading-sm">{insight.value}</h1>
        <p className="text-sm whitespace-nowrap">
          {getLabel(insight.type)}
        </p>
      </div>
      <Icon className="size-5 text-dark" strokeWidth={2} />
    </div>
  );
}