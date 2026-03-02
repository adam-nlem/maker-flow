import { SubscriptionPlan } from "./enums/SubscriptionPlan";

export interface PlanConfig {
    plan: SubscriptionPlan;
    name: string;
    monthlyPrice: number;
    creditsPerMonth: number;
    features: string[];
    isHighlighted: boolean;
}

export const planConfigs: PlanConfig[] = [
    {
        plan: SubscriptionPlan.Starter,
        name: "Starter",
        monthlyPrice: 9.99,
        creditsPerMonth: 50,
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
        features: [
            "Génération de scripts IA",
            "Analytiques avancées",
            "Support prioritaire",
            "Accès API",
        ],
        isHighlighted: false,
    },
];
