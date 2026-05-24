import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Shimmer from "~/components/ui/Shimmer";
import { Tag } from "~/components/ui/Tag";
import { useListPendingReviewComments } from "~/hooks/api/reviews/useListPendingReviewComments";
import HomePendingReviewGroup from "./HomePendingReviewGroup";

interface HomePendingReviewCommentsPanelProps {
    projectUuid: string;
}

export default function HomePendingReviewCommentsPanel({ projectUuid }: HomePendingReviewCommentsPanelProps) {
    const { t } = useTranslation();
    const { groups, isLoading } = useListPendingReviewComments({ projectUuid, limit: 100 });

    const totalOpenCount = useMemo(
        () => groups.reduce((sum, group) => sum + group.comments.length, 0),
        [groups],
    );

    return (
        <div className="w-full flex-1 min-h-0 flex flex-col border border-pale-gray rounded-lg bg-clear overflow-hidden">
            <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-pale-gray">
                <div className="flex flex-row items-center gap-2">
                    <ChatBubbleLeftRightIcon className="size-5 text-muted-2" strokeWidth={2} />
                    <h2 className="text-heading-md">{t("home:pendingReviewComments.header")}</h2>
                </div>
                {!isLoading && totalOpenCount > 0 && (
                    <Tag
                        label={t("home:pendingReviewComments.openCount", { count: totalOpenCount })}
                        bgClassName="bg-primary/10"
                        borderClassName="border border-primary/20"
                        textClassName="text-primary"
                    />
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3 p-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <Shimmer width="w-40" height="h-4" />
                            <div className="flex flex-row items-center gap-2">
                                <Shimmer width="w-7" height="h-7" radius="rounded-md" />
                                <div className="flex flex-col gap-1 flex-1">
                                    <Shimmer width="w-32" height="h-3" />
                                    <Shimmer width="w-full" height="h-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-muted-2">
                    <p className="text-body-sm text-center">{t("home:pendingReviewComments.empty.title")}</p>
                    <p className="text-body-xs text-center mt-1">{t("home:pendingReviewComments.empty.subtitle")}</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
                    {groups.map((group) => (
                        <HomePendingReviewGroup key={group.review.review.uuid} group={group} projectUuid={projectUuid} />
                    ))}
                </div>
            )}
        </div>
    );
}
