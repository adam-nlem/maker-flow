import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { useOAuthPopup } from "~/hooks/useOAuthPopup";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { IntegrationProvider } from "~/models/enums/IntegrationProvider";

interface AuthorizeInstagramResponse {
    authorization_url: string;
}

export function useAuthorizeInstagram() {
    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        provider: IntegrationProvider.Instagram,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.get<AuthorizeInstagramResponse>('/integrations/instagram/authorize');
            return res.data;
        },
        onSuccess: (data) => {
            openPopup(data.authorization_url);
        },
    });

    const reset = useCallback(() => {
        mutation.reset();
        resetOAuth();
    }, [mutation, resetOAuth]);

    return {
        authorize: mutation.mutate,
        isPending: mutation.isPending || isOpen,
        integrationUuid,
        oauthError: oauthError ?? (mutation.error ? OAuthErrorCode.TokenExchangeFailed : null),
        error: mutation.error,
        reset,
    };
}
