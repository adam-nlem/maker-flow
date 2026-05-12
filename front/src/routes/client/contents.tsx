import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import ContentsPageView from "~/components/contents/ContentsPageView";

export default function ClientContentsPage() {
  const { user } = useCurrentUser();
  const projectUuid = user?.clientProjectUuid ?? null;

  if (!projectUuid) return null;

  return (
    <div className="h-full">
      <ContentsPageView projectUuid={projectUuid} isReadOnly />
    </div>
  );
}
