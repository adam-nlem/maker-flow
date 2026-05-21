import { useTranslation } from "react-i18next";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Review } from "~/models/Review";
import { mediaTypeToIcon } from "~/models/enums/MediaType";
import type { ReviewEditForm } from "~/hooks/useReviewEditForm";
import { formatToRelative } from "~/utils/dateFormatters";

interface ReviewDetailHeaderProps {
    review: Review;
    form: ReviewEditForm;
    onOpenLinkedScript: (scriptUuid: string) => void;
    onDeleteClick: () => void;
}

export default function ReviewDetailHeader({
    review,
    form,
    onOpenLinkedScript,
    onDeleteClick,
}: ReviewDetailHeaderProps) {
    const { t } = useTranslation();
    const MediaTypeIcon = mediaTypeToIcon[review.mediaType];
    const typeLabel = t(`reviews:detail.eyebrow.${review.mediaType}`);
    const relativeCreatedAt = formatToRelative(new Date(review.createdAt));

    return (
        <header className="flex flex-row items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
                <div className="flex flex-row items-center gap-2 text-body-xs uppercase tracking-wider text-muted-2 mb-2">
                    <MediaTypeIcon className="size-3.5" />
                    <span>{typeLabel}</span>
                    <span aria-hidden className="text-pale-gray-2">·</span>
                    <span>{relativeCreatedAt}</span>
                    {review.script && !form.canEdit && (
                        <>
                            <span aria-hidden className="text-pale-gray-2">·</span>
                            <button
                                type="button"
                                onClick={() => onOpenLinkedScript(review.script!.uuid)}
                                className="uppercase tracking-wider hover:text-dark transition-colors cursor-pointer"
                            >
                                {t("reviews:detail.fromScript", { title: review.script.title })}
                            </button>
                        </>
                    )}
                </div>

                {form.canEdit ? (
                    <Input
                        value={form.title}
                        onChange={(e) => form.setTitle(e.target.value)}
                        simple
                        required
                        textStyle="text-heading-2xl"
                        placeholder={t("reviews:form.titlePlaceholder")}
                    />
                ) : (
                    <h1 className="text-heading-2xl text-dark wrap-break-word">{review.title}</h1>
                )}
            </div>

            <div className="flex flex-row gap-2 shrink-0">
                {form.hasChanges && (
                    <Button
                        type="submit"
                        style="primary"
                        width="w-auto"
                        isLoading={form.isPending}
                        disabled={form.isPending}
                    >
                        <PencilSquareIcon className="size-4 mr-1" strokeWidth={2} />
                        {t("reviews:actions.save")}
                    </Button>
                )}
                <Button type="button" style="secondary" width="w-auto" onClick={onDeleteClick}>
                    <TrashIcon className="size-4 mr-1" strokeWidth={2} />
                    {t("reviews:actions.delete")}
                </Button>
            </div>
        </header>
    );
}
