import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useShowReviewVersionFile } from "~/hooks/api/reviews/useShowReviewVersionFile";

interface ReviewCarouselViewerProps {
    reviewVersionUuid: string;
    fileCount: number;
}

export default function ReviewCarouselViewer({ reviewVersionUuid, fileCount }: ReviewCarouselViewerProps) {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const slides = Array.from({ length: fileCount }, (_, i) => i + 1);
    const isFirst = activeIndex === 0;
    const isLast = activeIndex === fileCount - 1;

    const handlePrevious = () => setActiveIndex((index) => Math.max(0, index - 1));
    const handleNext = () => setActiveIndex((index) => Math.min(fileCount - 1, index + 1));

    return (
        <div className="rounded-2xl overflow-hidden bg-dark shadow-md mb-4">
            <div className="relative w-full bg-dark flex items-center justify-center min-h-80">
                <CarouselSlideImage
                    reviewVersionUuid={reviewVersionUuid}
                    fileIndex={slides[activeIndex]}
                    className="max-h-[70vh] w-auto max-w-full object-contain"
                />

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-dark/60 text-clear text-body-xs">
                    {t("reviews:detail.carousel.slideCounter", { current: activeIndex + 1, total: fileCount })}
                </div>

                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={isFirst}
                    aria-label={t("reviews:detail.carousel.previousSlide")}
                    className="absolute top-1/2 left-3 -translate-y-1/2 size-9 rounded-full bg-dark/40 hover:bg-dark/60 text-clear flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeftIcon className="size-5" />
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLast}
                    aria-label={t("reviews:detail.carousel.nextSlide")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 size-9 rounded-full bg-dark/40 hover:bg-dark/60 text-clear flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRightIcon className="size-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            aria-label={t("reviews:detail.carousel.goToSlide", { index: i + 1 })}
                            className={`size-1.5 rounded-full transition-colors ${i === activeIndex ? "bg-clear" : "bg-clear/40 hover:bg-clear/70"}`}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-clear-3 p-3 flex gap-1.5 overflow-x-auto scrollbar-none">
                {slides.map((fileIndex, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        className={`size-14 rounded-md overflow-hidden border-2 shrink-0 transition-colors ${i === activeIndex ? "border-dark" : "border-transparent hover:border-pale-gray-2"}`}
                    >
                        <CarouselSlideImage reviewVersionUuid={reviewVersionUuid} fileIndex={fileIndex} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}

interface CarouselSlideImageProps {
    reviewVersionUuid: string;
    fileIndex: number;
    className: string;
}

function CarouselSlideImage({ reviewVersionUuid, fileIndex, className }: CarouselSlideImageProps) {
    const { fileUrl } = useShowReviewVersionFile(reviewVersionUuid, fileIndex);

    if (!fileUrl) {
        return <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
    }

    return <img className={className} src={fileUrl} alt="" />;
}
