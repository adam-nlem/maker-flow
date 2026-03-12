import { useCallback, useEffect, useState } from "react";
import { OAuthCallbackStatus } from "~/models/enums/OAuthCallbackStatus";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { Platform } from "~/models/enums/Platform";
import { WindowMessageType } from "~/models/enums/WindowMessageType";
import { OAuthCallbackReponseDTO } from "~/models/dtos/OAuthCallbackReponseDTO";

interface OAuthCallbackMessage {
    type: WindowMessageType.OAuthCallback;
    payload: OAuthCallbackReponseDTO;
}

interface UseOAuthMessageListenerProps {
    platform: Platform;
}

export function useOAuthMessageListener({ platform }: UseOAuthMessageListenerProps) {
    const [integrationUuid, setIntegrationUuid] = useState<string | null>(null);
    const [oauthError, setOauthError] = useState<OAuthErrorCode | null>(null);

    const handleMessage = useCallback((event: MessageEvent<OAuthCallbackMessage>) => {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data?.type !== WindowMessageType.OAuthCallback) {
            return;
        }

        const { payload } = event.data;

        if (payload.platform !== platform) {
            return;
        }

        if (payload.status === OAuthCallbackStatus.Success && payload.integrationUuid) {
            setIntegrationUuid(payload.integrationUuid);
            setOauthError(null);
        } else if (payload.status === OAuthCallbackStatus.Error && payload.errorCode) {
            setOauthError(payload.errorCode ?? OAuthErrorCode.Unknown);
            setIntegrationUuid(null);
        }
    }, [platform]);

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    const reset = useCallback(() => {
        setIntegrationUuid(null);
        setOauthError(null);
    }, []);

    return {
        integrationUuid,
        oauthError,
        reset,
    };
}
