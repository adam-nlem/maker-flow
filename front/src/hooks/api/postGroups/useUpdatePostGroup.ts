import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface UpdatePostGroupData {
    title?: string;
    addPostUuids?: string[];
    removePostUuids?: string[];
}

interface UpdatePostGroupParams {
    postGroupUuid: string;
    data: UpdatePostGroupData;
}

export function useUpdatePostGroup() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ postGroupUuid, data }: UpdatePostGroupParams) => {
            await httpClient.patch(`/post-groups/${postGroupUuid}`, {
                ...data,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postGroupQueryKeys.all })
        },
    })

    return {
        updatePostGroup: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
