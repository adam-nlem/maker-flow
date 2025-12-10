import { useState, useEffect } from "react";
import { UserModule } from "~/models/UserModule";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";

export function useProjectUserModules(projectUuid?: string) {
    const [userModules, setUserModules] = useState<UserModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!projectUuid) {
            setUserModules([]);
            setIsLoading(false);
            return;
        }

        const fetchUserModules = async () => {
            setIsLoading(true);
            try {
                const res = await httpClient.get(`/projects/${projectUuid}/user-modules`);
                const modulesData = res.data.map((json: any) => UserModule.fromJSON(json));
                setUserModules(modulesData);
                setErrorMessage(null);
            } catch (err) {
                setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserModules();
    }, [projectUuid]);

    return {
        userModules,
        isLoading,
        errorMessage
    };
}
