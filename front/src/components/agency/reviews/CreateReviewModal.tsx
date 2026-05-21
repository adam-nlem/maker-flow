import { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { ModalAlign } from "~/models/enums/ModalAlign";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import LinkedScriptField from "~/components/agency/scripts/LinkedScriptField";
import type { Script } from "~/models/Script";
import { MediaType, mediaTypeToIcon, mediaTypeTranslationKeys, mediaTypeUploadHintTranslationKeys } from "~/models/enums/MediaType";
import { useCreateReview } from "~/hooks/api/reviews/useCreateReview";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { HttpException } from "~/services/httpClient/HttpException";
import ReviewFileDropzone from "./ReviewFileDropzone";

interface CreateReviewModalProps {
    projectUuid: string;
    showModal: boolean;
    onClose: () => void;
}

export default function CreateReviewModal({ projectUuid, showModal, onClose }: CreateReviewModalProps) {
    const { t } = useTranslation();
    const selectReview = useReviewsStore((s) => s.selectReview);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [mediaType, setMediaType] = useState<MediaType>(MediaType.Video);
    const [linkedScript, setLinkedScript] = useState<Script | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const { createReview, isPending, error, validationErrorKey, clearValidationError } = useCreateReview();

    const handleMediaTypeChange = (next: MediaType) => {
        setMediaType(next);
        setFiles([]);
        clearValidationError();
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const created = await createReview({
            projectUuid,
            title: title.trim(),
            description: description.trim() || null,
            notes: notes.trim() || null,
            mediaType,
            scriptUuid: linkedScript?.uuid ?? null,
            files,
        });

        if (created) {
            selectReview(created.review.uuid);
        }
    };

    const submitErrorKey = validationErrorKey
        ?? (error instanceof HttpException && error.response.httpStatus === 409 ? "reviews:validation.scriptAlreadyHasReview" : null);

    if (!showModal) return null;

    const handleClose = () => {
        if (isPickerOpen) return;
        onClose();
    };

    return (
        <ModalOverlay
            isOpen={showModal}
            onClose={handleClose}
            width="w-160"
            height="max-h-[calc(100vh-80px)]"
            align={isPickerOpen ? ModalAlign.LeftOfCenter : ModalAlign.Center}
        >
            <form className="flex flex-col h-full" onSubmit={handleSubmit}>
                <div className="px-5 pt-5 pb-3 border-b border-pale-gray">
                    <h2 className="text-heading-lg">{t("reviews:form.modalTitle")}</h2>
                    <p className="text-body-sm text-muted">{t("reviews:form.modalSubtitle")}</p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="block text-heading-sm">{t("reviews:form.mediaType")}</label>
                        <div className="flex flex-row gap-2">
                            {Object.values(MediaType).map((value) => {
                                const Icon = mediaTypeToIcon[value];
                                const isSelected = mediaType === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => handleMediaTypeChange(value)}
                                        className={`flex-1 min-w-30 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${isSelected ? "bg-clear border-dark shadow-sm" : "bg-clear-2 border-pale-gray hover:border-pale-gray-2"}`}
                                    >
                                        <div className="flex flex-row gap-2 items-center">
                                            <Icon
                                                className={`size-4 shrink-0 ${isSelected ? "text-primary" : "text-dark-2"}`}
                                                strokeWidth={1.5}
                                            />
                                            <p className="text-heading-sm">
                                                {t(mediaTypeTranslationKeys[value])}
                                            </p>
                                        </div>
                                        <p className="text-body-xs text-muted-2 mt-1">
                                            {t(mediaTypeUploadHintTranslationKeys[value])}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="block text-heading-sm">{t("reviews:form.files")}</label>
                        <ReviewFileDropzone
                            mediaType={mediaType}
                            files={files}
                            onChange={setFiles}
                        />
                    </div>

                    <Input
                        label={t("reviews:form.title")}
                        placeholder={t("reviews:form.titlePlaceholder")}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="block text-heading-sm">{t("reviews:form.description")}</label>
                        <TextArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("reviews:form.descriptionPlaceholder")}
                            rows={3}
                        />
                        <p className="text-body-xs text-muted-2">{t("reviews:form.descriptionHint")}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="block text-heading-sm">{t("reviews:form.notes")}</label>
                        <TextArea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t("reviews:form.notesPlaceholder")}
                            rows={3}
                        />
                        <p className="text-body-xs text-muted-2">{t("reviews:form.notesHint")}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="block text-heading-sm">{t("scripts:picker.linkedField.label")}</label>
                        <LinkedScriptField
                            projectUuid={projectUuid}
                            value={linkedScript}
                            onChange={setLinkedScript}
                            pickerAlign={ModalAlign.RightOfCenter}
                            onPickerOpenChange={setIsPickerOpen}
                        />
                    </div>
                </div>

                {submitErrorKey && (
                    <p className="text-body-sm text-danger px-5 pb-2">{t(submitErrorKey)}</p>
                )}

                <div className="px-5 py-3.5 bg-clear-2 border-t border-pale-gray flex flex-row gap-2 justify-end">
                    <Button type="button" style="outline" onClick={onClose} disabled={isPending}>
                        {t("reviews:actions.cancel")}
                    </Button>
                    <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                        {t("reviews:form.submit")}
                    </Button>
                </div>
            </form>
        </ModalOverlay>
    );
}
