import type { ComponentType, ReactNode, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface SocialAnalyticsInsightTileProps {
  label: string;
  value: number;
  Icon: HeroIcon;
  evolutionPercentage?: string | null;
  chart?: ReactNode;
}

export default function SocialAnalyticsInsightTile({
  label,
  value,
  Icon,
  evolutionPercentage,
  chart,
}: SocialAnalyticsInsightTileProps) {
  return (
    <div className="flex flex-row gap-3 border border-light-gray rounded-lg p-2 w-fit items-center">
      <div>
        <p className="text-xs whitespace-nowrap">{label}</p>
        <h1 className="text-heading-sm">{value.toLocaleString("fr-FR")}</h1>
      </div>
      {chart && <div>{chart}</div>}
      {!chart && (
        <div className="flex flex-col items-end">
          <Icon className="size-5 text-dark" strokeWidth={2} />
          {evolutionPercentage !== undefined && evolutionPercentage !== null && (
            <span
              className={`text-sm font-medium ${evolutionPercentage.startsWith('+') ? "text-green-500" : "text-red-500"
                }`}
            >
              {evolutionPercentage}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
 