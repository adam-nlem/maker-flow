import { OAuthCallbackStatus } from "~/models/enums/OAuthCallbackStatus";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { IntegrationPlatform } from "~/models/enums/IntegrationPlatform";

export class OAuthCallbackReponseDTO {
    constructor(
        public readonly status: OAuthCallbackStatus,
        public readonly platform: IntegrationPlatform,
        public readonly errorCode?: OAuthErrorCode,
        public readonly integrationUuid?: string,
    ) {}

    static fromSearchParams(params: URLSearchParams): OAuthCallbackReponseDTO {
        return new OAuthCallbackReponseDTO(
            params.get("status") as OAuthCallbackStatus,
            params.get("platform") as IntegrationPlatform,
            (params.get("errorCode") as OAuthErrorCode) ?? undefined,
            params.get("integrationUuid") ?? undefined,
        );
    }
}
