import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { HookTemplate, type HookTemplateJSON } from "~/models/HookTemplate";
import { hookTemplateQueryKeys } from "./hookTemplateQueryKeys";

export function useListHookTemplates({ searchTerm }: { searchTerm?: string } = {}) {
    const query = useQuery({
        queryKey: hookTemplateQueryKeys.list(searchTerm),
        queryFn: async () => {
            const res = await httpClient.get('/hook-templates', {
                params: searchTerm ? { searchTerm } : undefined,
            })
            return res.data.map((json: HookTemplateJSON) => HookTemplate.fromJSON(json)) as HookTemplate[]
        },
    })

    return {
        hookTemplates: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
