import { useEffect, useState } from "react";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";

export function useShowModuleIcon(moduleIdentifier?: string) {
    const [iconUrl, setIconUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!moduleIdentifier) {
            setIconUrl(null);
            setIsLoading(false);
            return;
        }
        let url: string | null = null;
        const showIcon = async () => {
            setIsLoading(true);
            try {
                const res = await httpClient.get(`/modules/${moduleIdentifier}/icon`, {
                    responseType: 'blob'
                });
                const url = URL.createObjectURL(res.data);
                setIconUrl(url);
                setErrorMessage(null);
            } catch (err) {
                setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue");
            } finally {
                setIsLoading(false);
            }
        };

        showIcon();
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [moduleIdentifier]);

    return {
        iconUrl,
        isLoading,
        errorMessage
    };
}