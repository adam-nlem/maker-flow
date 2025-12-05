import { useState, useEffect, useCallback } from "react";
import { Project } from "~/models/project";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";

export function usePaginatedProjects(limit: number = 10) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const getPaginatedProjects = useCallback(async (pageToFetch: number, append: boolean = false) => {
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const res = await httpClient.get(`/projects/${pageToFetch}/${limit}`);
            const projectsData = res.data.map((json: any) => Project.fromJSON(json));
            
            if (append) {
                setProjects(prev => [...prev, ...projectsData]);
            } else {
                setProjects(projectsData);
            }
            
            // If we received fewer items than the limit, there are no more pages
            setHasMore(projectsData.length === limit);
            setErrorMessage(null);
        } catch (err) {
            setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [limit]);

    useEffect(() => {
        getPaginatedProjects(1, false);
    }, [getPaginatedProjects]);

    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            getPaginatedProjects(nextPage, true);
        }
    }, [page, isLoadingMore, hasMore, getPaginatedProjects]);


    return {
        projects,
        isLoading,
        isLoadingMore,
        hasMore,
        errorMessage,
        loadMore,
    };
}
