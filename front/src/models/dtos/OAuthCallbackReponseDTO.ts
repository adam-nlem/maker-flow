import { OAuthCallbackStatus } from "~/models/enums/OAuthCallbackStatus";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { Platform } from "~/models/enums/Platform";

export class OAuthCallbackReponseDTO {
    constructor(
        public readonly status: OAuthCallbackStatus,
        public readonly platform: Platform,
        public readonly errorCode?: OAuthErrorCode,
        public readonly integrationUuid?: string,
    ) {}

    static fromSearchParams(params: URLSearchParams): OAuthCallbackReponseDTO {
        return new OAuthCallbackReponseDTO(
            params.get("status") as OAuthCallbackStatus,
            params.get("platform") as Platform,
            (params.get("errorCode") as OAuthErrorCode) ?? undefined,
            params.get("integrationUuid") ?? undefined,
        );
    }
}
