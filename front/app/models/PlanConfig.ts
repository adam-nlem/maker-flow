import { SubscriptionPlan } from "./enums/SubscriptionPlan";

export interface PlanConfig {
    plan: SubscriptionPlan;
    name: string;
    monthlyPrice: number;
    creditsPerMonth: number;
    maxProjects: number | null;
    features: string[];
    isHighlighted: boolean;
}

export const planConfigs: PlanConfig[] = [
    {
        plan: SubscriptionPlan.Starter,
        name: "Starter",
        monthlyPrice: 9.99,
        creditsPerMonth: 50,
        maxProjects: 1,
        features: [
            "Génération de scripts IA",
            "Analytiques de base",
        ],
        isHighlighted: false,
    },
    {
        plan: SubscriptionPlan.Creator,
        name: "Créateur",
        monthlyPrice: 19.99,
        creditsPerMonth: 150,
        maxProjects: 3,
        features: [
            "Génération de scripts IA",
            "Analytiques avancées",
            "Support prioritaire",
        ],
        isHighlighted: true,
    },
    {
        plan: SubscriptionPlan.Agency,
        name: "Agence",
        monthlyPrice: 49.99,
        creditsPerMonth: 500,
        maxProjects: null,
        features: [
            "Génération de scripts IA",
            "Analytiques avancées",
            "Support prioritaire",
            "Accès API",
        ],
        isHighlighted: false,
    },
];

export function getMaxProjectsForPlan(plan: SubscriptionPlan | null | undefined): number | null {
    if (!plan || plan === SubscriptionPlan.Free) return 1;
    return planConfigs.find((c) => c.plan === plan)?.maxProjects ?? null;
}
