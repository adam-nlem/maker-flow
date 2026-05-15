import { useQuery } from '@tanstack/react-query';
import { PostDraft } from '~/models/PostDraft';
import { httpClient } from '~/services/httpClient/httpClient';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

const POLL_INTERVAL_MS = 4000;

export function useShowPostDraft(uuid: string | null | undefined) {
    const query = useQuery({
        queryKey: postDraftsQueryKeys.detail(uuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/post-drafts/${uuid}`);
            return PostDraft.fromJSON(res.data);
        },
        enabled: Boolean(uuid),
        refetchInterval: (q) => q.state.data?.isOptimizing ? POLL_INTERVAL_MS : false,
    });

    return {
        postDraft: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
