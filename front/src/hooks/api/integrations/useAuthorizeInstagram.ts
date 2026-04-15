import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { useOAuthPopup } from "~/hooks/useOAuthPopup";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { Platform } from "~/models/enums/Platform";
import { integrationQueryKeys } from "./integrationQueryKeys";
import { integrationInsightQueryKeys } from "../integrationInsights/integrationInsightQueryKeys";

interface CreateIntegrationResponse {
    authorization_url: string;
}

interface UseCreateIntegrationProps {
    projectUuid: string;
    platform: Platform;
}

export function useCreateIntegration({ projectUuid, platform }: UseCreateIntegrationProps) {
    const queryClient = useQueryClient();

    const handleOAuthSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
        queryClient.invalidateQueries({ queryKey: integrationInsightQueryKeys.all });
        track(AnalyticsEvent.IntegrationConnected, { platform })
    }, [queryClient, projectUuid, platform]);

    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        platform,
        onSuccess: handleOAuthSuccess,
        onPopupClosed: handleOAuthSuccess,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post<CreateIntegrationResponse>('/integrations', {
                projectUuid,
                platform: platform,
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
