import { useTranslation } from "react-i18next";
import AgencyLogo from "~/components/agency/AgencyLogo";
import { User } from "~/models/User";

interface ReviewCommentAuthorBadgeProps {
  author: User | null;
}

export default function ReviewCommentAuthorBadge({ author }: ReviewCommentAuthorBadgeProps) {
  const { t } = useTranslation();

  const authorName = author?.fullName ?? t("reviews:comments.unknownAuthor");
  const contextLabel = author?.agency?.name ?? author?.project?.name ?? null;

  return (
    <div className="flex flex-row items-center gap-2.5">
      <Avatar author={author} />
      <div className="flex flex-col leading-tight">
        <span className="text-heading-sm text-dark">{authorName}</span>
        {contextLabel && (
          <span className="text-body-xs text-muted-2">{contextLabel}</span>
        )}
      </div>
    </div>
  );
}

function Avatar({ author }: { author: User | null }) {
  if (author?.agency) {
    return <AgencyLogo agency={author.agency} className="size-8 shrink-0" />;
  }

  const initial = (author?.project?.name?.trim().charAt(0) ?? "?").toUpperCase();

  return (
    <div className="size-8 shrink-0 flex items-center justify-center rounded-md bg-pale-gray-2 text-muted-2">
      <span className="text-heading-sm font-semibold leading-none">{initial}</span>
    </div>
  );
}
