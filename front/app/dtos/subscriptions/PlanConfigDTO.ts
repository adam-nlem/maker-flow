import type { SubscriptionPlan } from "~/models/enums/SubscriptionPlan";

export interface PlanConfigDTOJSON {
    plan: string;
    name: string;
    monthlyPrice: number;
    currency: string;
    creditsPerMonth: number;
    maxProjects: number | null;
    maxScriptsPerProject: number | null;
    features: string[];
    isHighlighted: boolean;
    sortOrder: number;
}

export class PlanConfigDTO {
    constructor(
        public readonly plan: SubscriptionPlan,
        public readonly name: string,
        public readonly monthlyPrice: number,
        public readonly currency: string,
        public readonly creditsPerMonth: number,
        public readonly maxProjects: number | null,
        public readonly maxScriptsPerProject: number | null,
        public readonly features: string[],
        public readonly isHighlighted: boolean,
        public readonly sortOrder: number,
    ) {}

    static fromJSON(json: PlanConfigDTOJSON): PlanConfigDTO {
        return new PlanConfigDTO(
            json.plan as SubscriptionPlan,
            json.name,
            json.monthlyPrice,
            json.currency,
            json.creditsPerMonth,
            json.maxProjects,
            json.maxScriptsPerProject,
            json.features,
            json.isHighlighted,
            json.sortOrder,
        );
    }
}
