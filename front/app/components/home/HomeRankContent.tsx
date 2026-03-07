import { useHomeFilterStore } from "~/stores/homeFilterStore"
import RankedPostsList from "~/components/home/RankedPostsList"
import RankedPostGroupsList from "~/components/home/RankedPostGroupsList"

interface HomeRankContentProps {
    projectUuid: string
}

export default function HomeRankContent({ projectUuid }: HomeRankContentProps) {
    const focusedIntegrationUuid = useHomeFilterStore((state) => state.focusedIntegrationUuid)

    if (focusedIntegrationUuid) {
        return <RankedPostsList integrationUuid={focusedIntegrationUuid} />
    }

    return <RankedPostGroupsList projectUuid={projectUuid} />
}
