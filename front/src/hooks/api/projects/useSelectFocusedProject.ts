import { useEffect } from "react"
import type { Project } from "~/models/Project"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"

export default function useSelectFocusedProject({ projects }: { projects: Project[] }) {
    const focusedProjectUuid = useFocusProjectStore((state) => state.focusedProjectUuid)
    const setFocusedProjectUuid = useFocusProjectStore((state) => state.setFocusedProjectUuid)

    useEffect(() => {
        if (projects.length === 0) return

        const existsInList = projects.some((p) => p.uuid === focusedProjectUuid)

        if (!focusedProjectUuid || !existsInList) {
            setFocusedProjectUuid(projects[0].uuid)
        }
    }, [projects, focusedProjectUuid, setFocusedProjectUuid])

    return {
        focusedProjectUuid,
        setFocusedProjectUuid
    }
}
