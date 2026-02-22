import type { IntegrationPlatform } from "../enums/IntegrationPlatform";
import { Integration, type IntegrationJSON } from "../Integration";

/**
 * @deprecated This DTO is currently unused. The API now returns a flat list of integrations
 * (one per platform per project). Kept for potential future use if grouped responses are needed.
 */
export interface IntegrationsGroupedByPlatformDTOJSON {
    platform: IntegrationPlatform;
    integrations: IntegrationJSON[];
}

/**
 * @deprecated This DTO is currently unused. The API now returns a flat list of integrations
 * (one per platform per project). Kept for potential future use if grouped responses are needed.
 */
export class IntegrationsGroupedByPlatformDTO {
    constructor(
        public readonly platform: IntegrationPlatform,
        public integrations: Integration[],
    ) { }

    static fromJSON(json: IntegrationsGroupedByPlatformDTOJSON): IntegrationsGroupedByPlatformDTO {
        return new IntegrationsGroupedByPlatformDTO(
            json.platform,
            json.integrations.map(integration => Integration.fromJSON(integration)),
        );
    }
}
