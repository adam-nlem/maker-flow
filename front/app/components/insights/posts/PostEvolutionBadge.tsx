import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";

interface PostEvolutionBadgeProps {
    evolutionPercentage: string | null;
}

export default function PostEvolutionBadge({ evolutionPercentage }: PostEvolutionBadgeProps) {
    if (!evolutionPercentage) return null;

    const isPositive = evolutionPercentage.startsWith('+');

    return (
        <div
            className={`${isPositive ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"} w-fit h-fit p-0.5 rounded flex flex-row items-center gap-1`}
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
