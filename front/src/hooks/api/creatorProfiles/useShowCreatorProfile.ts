import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { creatorProfileQueryKeys } from "./creatorProfileQueryKeys";
import { CreatorProfile, type CreatorProfileJSON } from "~/models/CreatorProfile";

interface UseShowCreatorProfileParams {
    projectUuid: string;
}

export function useShowCreatorProfile({ projectUuid }: UseShowCreatorProfileParams) {
    const query = useQuery({
        queryKey: creatorProfileQueryKeys.show(projectUuid),
        queryFn: async () => {
            try {
                const response = await httpClient.get<CreatorProfileJSON>('/creator-profiles', {
                    params: { projectUuid },
                });
                return CreatorProfile.fromJSON(response.data);
            } catch (error: any) {
                if (error?.response?.status === 404) {
                    return null;
                }
                throw error;
            }
        },
        enabled: !!projectUuid,
    });

    return {
        creatorProfile: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
