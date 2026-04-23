import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { TargetAudience, type TargetAudienceJSON } from "~/models/TargetAudience";
import { targetAudienceQueryKeys } from "./targetAudienceQueryKeys";

interface CreateTargetAudienceData {
    projectUuid: string;
    name: string;
}

export function useCreateTargetAudience() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateTargetAudienceData) => {
            const res = await httpClient.post<TargetAudienceJSON>('/target-audiences', {
                projectUuid: data.projectUuid,
                name: data.name,
            });
            return TargetAudience.fromJSON(res.data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: targetAudienceQueryKeys.list(variables.projectUuid) });
        },
    });

    return {
        createTargetAudience: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
