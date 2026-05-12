import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useListPaginatedProjects } from "./useListPaginatedProjects"
import useSelectFocusedProject from "./useSelectFocusedProject"

export default function useSyncFocusedProject() {
    const { user } = useCurrentUser()
    const { projects } = useListPaginatedProjects({ enabled: !!user })
    return useSelectFocusedProject({ projects })
}
