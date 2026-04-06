import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface CreatePostGroupData {
    title: string;
    postUuids?: string[];
}

export function useCreatePostGroup({ projectUuid }: { projectUuid: string }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreatePostGroupData) => {
            await httpClient.post('/post-groups', {
                "projectUuid": projectUuid,
                ...data,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postGroupQueryKeys.all })
        },
    })

    return {
        createPostGroup: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
