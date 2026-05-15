import type { ComponentType, ReactNode, SVGProps } from "react";
import { formatCompactNumber } from "~/utils/numberFormatters";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface InsightTileProps {
  label: string;
  value: number;
  Icon: HeroIcon;
  evolutionPercentage?: string | null;
  chart?: ReactNode;
}

export default function InsightTile({
  label,
  value,
  Icon,
  evolutionPercentage,
  chart,
}: InsightTileProps) {
  return (
    <div className="flex flex-row gap-10 border border-pale-gray rounded-xl p-5 w-fit items-center">
      <div>
        <p className="text-xs whitespace-nowrap">{label}</p>
        <h1 className="text-heading-lg">{formatCompactNumber(value)}</h1>
      </div>
      {chart && <div>{chart}</div>}
      {!chart && (
        <div className="flex flex-col items-end">
          <Icon className="size-4 text-dark" strokeWidth={2} />
          {evolutionPercentage !== undefined && evolutionPercentage !== null && (
            <span
              className={`text-sm font-medium ${evolutionPercentage.startsWith('+') ? "text-primary" : "text-red-500"
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
 