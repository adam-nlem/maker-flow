import { useEffect, useState } from "react";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";

export function useShowModuleIcon(moduleUuid?: string) {
    const [iconUrl, setIconUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!moduleUuid) {
            setIconUrl(null);
            setIsLoading(false);
            return;
        }
        let url: string | null = null;
        const showIcon = async () => {
            setIsLoading(true);
            try {
                const res = await httpClient.get(`/modules/${moduleUuid}/icon`, {
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
    }, [moduleUuid]);

    return {
        iconUrl,
        isLoading,
        errorMessage
    };
}