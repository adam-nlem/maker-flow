import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import ReviewsList from "./ReviewsList";

interface ReviewsLayoutProps {
    projectUuid: string;
    /**
     * When provided, the list's empty state renders a primary CTA button.
     * Agency surfaces wire this to "open create modal"; client surfaces omit it.
     */
    onCreateReview?: () => void;
    /**
     * The detail panel to render when a review is selected. Agency and client
     * surfaces each pass their own panel here.
     */
    detail: ReactNode;
    /**
     * Whether a review is currently selected — drives the choice between the
     * `detail` slot and the empty state.
     */
    hasSelection: boolean;
}

export default function ReviewsLayout({
    projectUuid,
    onCreateReview,
    detail,
    hasSelection,
}: ReviewsLayoutProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-row h-full overflow-hidden">
            <aside className="w-75 shrink-0 border-r border-pale-gray overflow-y-auto">
                <ReviewsList projectUuid={projectUuid} onCreateReview={onCreateReview} />
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto">
                {hasSelection ? (
                    detail
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                        <DocumentDuplicateIcon className="size-12 text-muted-2" />
                        <h2 className="text-heading-md text-dark">{t("reviews:emptyState.noSelection.title")}</h2>
                        <p className="text-body-sm text-muted-2 max-w-sm">{t("reviews:emptyState.noSelection.subtitle")}</p>
                    </div>
                )}
            </main>
        </div>
    );
}
