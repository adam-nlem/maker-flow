import { useQuery } from "@tanstack/react-query"
import { PrelaunchStatusResponseDTO } from "~/models/dtos/PrelaunchStatusResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"
import { prelaunchQueryKeys } from "./prelaunchQueryKeys"

export function usePrelaunchStatus() {
  const query = useQuery({
    queryKey: prelaunchQueryKeys.status(),
    queryFn: async () => {
      const res = await httpClient.get(`/prelaunch/status`)
      return PrelaunchStatusResponseDTO.fromJSON(res.data)
    },
    refetchOnWindowFocus: true,
    retry: false,
  })

  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
