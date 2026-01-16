import type { IntegrationProvider } from "../enums/IntegrationProvider";
import { Integration, type IntegrationJSON } from "../Integration";

export interface IntegrationsGroupedByProviderDTOJSON {
    provider: IntegrationProvider;
    integrations: IntegrationJSON[];
}

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
