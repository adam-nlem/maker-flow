import { useQuery } from '@tanstack/react-query';
import { PostDraft } from '~/models/PostDraft';
import { httpClient } from '~/services/httpClient/httpClient';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

export function useShowPostDraft(uuid: string | null | undefined) {
    const query = useQuery({
        queryKey: postDraftsQueryKeys.detail(uuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/post-drafts/${uuid}`);
            return PostDraft.fromJSON(res.data);
        },
        enabled: Boolean(uuid),
    });

    return {
        postDraft: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
