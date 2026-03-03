import { CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import type { PlanConfig } from "~/models/PlanConfig";
import { formatPriceEur } from "~/utils/priceFormatters";

interface PlanCardProps {
    config: PlanConfig;
    isPending: boolean;
    disabled?: boolean;
    onSelect: () => void;
    actionLabel?: string;
}

export default function PlanCard({ config, isPending, disabled = false, onSelect, actionLabel = "Choisir" }: PlanCardProps) {
    return (
        <div className={`flex flex-col border rounded-xl p-5 ${config.isHighlighted ? 'border-primary' : 'border-light-gray'}`}>
            {config.isHighlighted && (
                <span className="text-body-xs text-primary mb-2">Recommandé</span>
            )}

            <h3 className="text-heading-lg">{config.name}</h3>

            <div className="flex flex-row items-baseline gap-1 mt-2">
                <span className="text-heading-2xl">{formatPriceEur(config.monthlyPrice)}</span>
                <span className="text-body-sm text-gray">/ mois</span>
            </div>

            <p className="text-body-sm text-gray mt-1">
                {config.creditsPerMonth} crédits / mois
            </p>

            <ul className="flex flex-col gap-2 mt-5 flex-1">
                {config.features.map((feature) => (
                    <li key={feature} className="flex flex-row items-center gap-2">
                        <CheckIcon className="size-4 text-primary shrink-0" strokeWidth={2} />
                        <span className="text-body-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-5">
                <Button
                    style={config.isHighlighted ? "primary" : "secondary"}
                    isLoading={isPending}
                    disabled={isPending || disabled}
                    onClick={onSelect}
                >
                    {actionLabel}
                </Button>
            </div>
        </div>
    );
}
