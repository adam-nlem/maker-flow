import { useMutation } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";

interface InstagramAuthorizeResponse {
    authorization_url: string;
}

export function useInstagramAuthorize() {
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.get<InstagramAuthorizeResponse>('/integrations/instagram/authorize');
            return res.data;
        },
        onSuccess: (data) => {
            window.location.href = data.authorization_url;
        },
    });

    return {
        authorize: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
}
