import { OAuthCallbackStatus } from "~/models/enums/OAuthCallbackStatus";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { IntegrationProvider } from "~/models/enums/IntegrationProvider";

export class OAuthCallbackReponseDTO {
    constructor(
        public readonly status: OAuthCallbackStatus,
        public readonly provider: IntegrationProvider,
        public readonly errorCode?: OAuthErrorCode,
        public readonly integrationUuid?: string,
    ) {}

    static fromSearchParams(params: URLSearchParams): OAuthCallbackReponseDTO {
        return new OAuthCallbackReponseDTO(
            params.get("status") as OAuthCallbackStatus,
            params.get("provider") as IntegrationProvider,
            (params.get("errorCode") as OAuthErrorCode) ?? undefined,
            params.get("integrationUuid") ?? undefined,
        );
    }
}