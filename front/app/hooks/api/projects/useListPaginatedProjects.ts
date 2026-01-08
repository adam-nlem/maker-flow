import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

export function useListPaginatedProjects(limit: number = 10) {
    const [page, setPage] = useState(1);
    const [additionalProjects, setAdditionalProjects] = useState<Project[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: projectQueryKeys.list(1, limit),
        queryFn: async () => {
            const res = await httpClient.get(`/projects`, {
                params: {
                    page: 1,
                    limit,
                }
            });
            const projectsData = res.data.map((json: any) => Project.fromJSON(json));
            setHasMore(projectsData.length === limit);
            setAdditionalProjects([]);
            setPage(1);
            return projectsData;
        },
    })

    const projects = useMemo(() => {
        return [...(query.data ?? []), ...additionalProjects];
    }, [query.data, additionalProjects]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get(`/projects`, {
                params: {
                    page: nextPage,
                    limit,
                }
            });
            const projectsData = res.data.map((json: any) => Project.fromJSON(json));
            setAdditionalProjects(prev => [...prev, ...projectsData]);
            setHasMore(projectsData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit]);

    return {
        projects,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
