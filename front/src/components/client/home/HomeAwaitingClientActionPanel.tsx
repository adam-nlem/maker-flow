import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import ReviewTile from "~/components/reviews/ReviewTile";
import Shimmer from "~/components/ui/Shimmer";
import { Tag } from "~/components/ui/Tag";
import { useListReviewsAwaitingCurrentUserAction } from "~/hooks/api/reviews/useListReviewsAwaitingCurrentUserAction";
import { clientReviewsPath } from "~/routes/routePaths";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";

interface HomeAwaitingClientActionPanelProps {
    projectUuid: string;
}

export default function HomeAwaitingClientActionPanel({ projectUuid }: HomeAwaitingClientActionPanelProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const selectReview = useReviewsStore((s) => s.selectReview);

    const { reviews, isLoading } = useListReviewsAwaitingCurrentUserAction({
        projectUuid,
        limit: 100,
    });

    const handleSelectReview = (reviewUuid: string) => {
        selectReview(reviewUuid);
        navigate(clientReviewsPath);
    };

    return (
        <div className="w-full flex-1 min-h-0 flex flex-col border border-pale-gray rounded-lg bg-clear overflow-hidden">
            <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-pale-gray">
                <div className="flex flex-row items-center gap-2">
                    <ClipboardDocumentCheckIcon className="size-5 text-muted-2" strokeWidth={2} />
                    <h2 className="text-heading-md">{t("home:awaitingClientAction.header")}</h2>
                </div>
                {!isLoading && reviews.length > 0 && (
                    <Tag
                        label={t("home:awaitingClientAction.count", { count: reviews.length })}
                        bgClassName="bg-primary/10"
                        borderClassName="border border-primary/20"
                        textClassName="text-primary"
                    />
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-2 p-3">
                    {[...Array(3)].map((_, i) => (
                        <Shimmer key={i} width="w-full" height="h-20" radius="rounded-xl" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-muted-2">
                    <p className="text-body-sm text-center">{t("home:awaitingClientAction.empty.title")}</p>
                    <p className="text-body-xs text-center mt-1">{t("home:awaitingClientAction.empty.subtitle")}</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-1 p-3">
                    {reviews.map((reviewDTO) => (
                        <ReviewTile
                            key={reviewDTO.review.uuid}
                            reviewDTO={reviewDTO}
                            isSelected={false}
                            onSelect={() => handleSelectReview(reviewDTO.review.uuid)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
