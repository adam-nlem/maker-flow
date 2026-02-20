import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { useOAuthPopup } from "~/hooks/useOAuthPopup";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { IntegrationProvider } from "~/models/enums/IntegrationProvider";
import { integrationQueryKeys } from "./integrationQueryKeys";

interface CreateIntegrationResponse {
    authorization_url: string;
}

interface UseCreateIntegrationProps {
    projectUuid: string;
    provider: IntegrationProvider;
}

export function useCreateIntegration({ projectUuid, provider }: UseCreateIntegrationProps) {
    const queryClient = useQueryClient();

    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        provider,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
        },
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post<CreateIntegrationResponse>('/integrations', {
                projectUuid,
                provider: provider,
            });
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
        createIntegration: mutation.mutate,
        isPending: mutation.isPending || isOpen,
        integrationUuid,
        oauthError: oauthError ?? (mutation.error ? OAuthErrorCode.TokenExchangeFailed : null),
        error: mutation.error,
        reset,
    };
}
