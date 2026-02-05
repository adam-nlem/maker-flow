import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";

interface SocialAnalyticsPostEvolutionBadgeProps {
    evolutionPercentage: string | null;
}

export default function SocialAnalyticsPostEvolutionBadge({ evolutionPercentage }: SocialAnalyticsPostEvolutionBadgeProps) {
    if (!evolutionPercentage) return null;

    const isPositive = evolutionPercentage.startsWith('+');

    return (
        <div
            className={`${isPositive ? "text-green bg-pastel-green" : "text-danger bg-danger/10"} w-fit h-fit p-0.5 rounded flex flex-row items-center gap-1`}
            title="Évolution par rapport au contenu précédent à la même durée après publication"
        >
            {isPositive
                ? <ArrowTrendingUpIcon className="size-3" />
                : <ArrowTrendingDownIcon className="size-3" />
            }
            <p className="text-xs">{evolutionPercentage}</p>

        </div>
    );
}
