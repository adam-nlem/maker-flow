import { useCallback, useEffect, useState } from "react";
import { OAuthCallbackStatus } from "~/models/enums/OAuthCallbackStatus";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { IntegrationProvider } from "~/models/enums/IntegrationProvider";
import { WindowMessageType } from "~/models/enums/WindowMessageType";
import { OAuthCallbackReponseDTO } from "~/models/dtos/OAuthCallbackReponseDTO";

interface OAuthCallbackMessage {
    type: WindowMessageType.OAuthCallback;
    payload: OAuthCallbackReponseDTO;
}

interface UseOAuthMessageListenerProps {
    provider: IntegrationProvider;
}

export function useOAuthMessageListener({ provider }: UseOAuthMessageListenerProps) {
    const [integrationUuid, setIntegrationUuid] = useState<string | null>(null);
    const [oauthError, setOauthError] = useState<OAuthErrorCode | null>(null);

    const handleMessage = useCallback((event: MessageEvent<OAuthCallbackMessage>) => {

        console.log(event)
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data?.type !== WindowMessageType.OAuthCallback) {
            return;
        }

        const { payload } = event.data;

        if (payload.provider !== provider) {
            return;
        }

        if (payload.status === OAuthCallbackStatus.Success && payload.integrationUuid) {
            setIntegrationUuid(payload.integrationUuid);
            setOauthError(null);
        } else if (payload.status === OAuthCallbackStatus.Error && payload.errorCode) {
            setOauthError(payload.errorCode ?? OAuthErrorCode.Unknown);
            setIntegrationUuid(null);
        }
    }, [provider]);

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
