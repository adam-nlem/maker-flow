import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { TargetAudience, type TargetAudienceJSON } from "~/models/TargetAudience";
import { targetAudienceQueryKeys } from "./targetAudienceQueryKeys";

interface UseListTargetAudiencesProps {
    projectUuid: string;
}

export function useListTargetAudiences({ projectUuid }: UseListTargetAudiencesProps) {
    const query = useQuery({
        queryKey: targetAudienceQueryKeys.list(projectUuid),
        queryFn: async () => {
            const res = await httpClient.get<TargetAudienceJSON[]>('/target-audiences', {
                params: { projectUuid },
            });
            return res.data.map((json) => TargetAudience.fromJSON(json));
        },
    });

    return {
        targetAudiences: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
