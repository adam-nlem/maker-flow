import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptTag, type ScriptTagJSON } from "~/models/ScriptTag";
import { scriptTagQueryKeys } from "./scriptTagQueryKeys";

export function useListScriptTagsWithSearch({ projectUuid }: { projectUuid: string | null }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    // Debounce the search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const query = useQuery({
        queryKey: scriptTagQueryKeys.list(projectUuid ?? '', debouncedSearchTerm),
        queryFn: async () => {
            const res = await httpClient.get('/scripts/tags', {
                params: {
                    projectUuid,
                    searchTerm: debouncedSearchTerm || undefined,
                }
            })
            return res.data.map((json: ScriptTagJSON) => ScriptTag.fromJSON(json)) as ScriptTag[]
        },
        enabled: !!projectUuid,
    })

    return {
        searchTerm,
        setSearchTerm,
        scriptTags: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
