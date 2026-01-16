import type { IntegrationProvider } from "../enums/IntegrationProvider";
import { Integration, type IntegrationJSON } from "../Integration";

/**
 * @deprecated This DTO is currently unused. The API now returns a flat list of integrations
 * (one per provider per userModule). Kept for potential future use if grouped responses are needed.
 */
export interface IntegrationsGroupedByProviderDTOJSON {
    provider: IntegrationProvider;
    integrations: IntegrationJSON[];
}

/**
 * @deprecated This DTO is currently unused. The API now returns a flat list of integrations
 * (one per provider per userModule). Kept for potential future use if grouped responses are needed.
 */
export class IntegrationsGroupedByProviderDTO {
    constructor(
        public readonly provider: IntegrationProvider,
        public integrations: Integration[],
    ) { }

    static fromJSON(json: IntegrationsGroupedByProviderDTOJSON): IntegrationsGroupedByProviderDTO {
        return new IntegrationsGroupedByProviderDTO(
            json.provider,
            json.integrations.map(integration => Integration.fromJSON(integration)),
        );
    }
}
