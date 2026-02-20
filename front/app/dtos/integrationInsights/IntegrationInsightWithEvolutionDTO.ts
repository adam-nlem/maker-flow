import type { IntegrationInsightType } from "~/models/enums/IntegrationInsightType";


export interface IntegrationInsightWithEvolutionDTOJSON {
    type: IntegrationInsightType;
    value: number;
    evolutionPercentage: string | null;
}

export class IntegrationInsightWithEvolutionDTO {
    constructor(
        public readonly type: IntegrationInsightType,
        public readonly value: number,
        public readonly evolutionPercentage: string | null,
    ) { }

    static fromJSON(json: IntegrationInsightWithEvolutionDTOJSON): IntegrationInsightWithEvolutionDTO {
        return new IntegrationInsightWithEvolutionDTO(
            json.type,
            json.value,
            json.evolutionPercentage,
        );
    }
}
