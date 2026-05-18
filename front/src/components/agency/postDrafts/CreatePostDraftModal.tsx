import { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { ModalAlign } from "~/models/enums/ModalAlign";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import LinkedScriptField from "~/components/agency/scripts/LinkedScriptField";
import type { Script } from "~/models/Script";
import { MediaType, mediaTypeToIcon } from "~/models/enums/MediaType";
import { useCreatePostDraft } from "~/hooks/api/postDrafts/useCreatePostDraft";
import { usePostDraftsStore } from "~/stores/postDrafts/postDraftsStore";
import { HttpException } from "~/services/httpClient/HttpException";
import PostDraftFileDropzone from "./PostDraftFileDropzone";

interface CreatePostDraftModalProps {
    projectUuid: string;
    showModal: boolean;
    onClose: () => void;
}

export default function CreatePostDraftModal({ projectUuid, showModal, onClose }: CreatePostDraftModalProps) {
    const { t } = useTranslation();
    const selectDraft = usePostDraftsStore((s) => s.selectDraft);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [mediaType, setMediaType] = useState<MediaType>(MediaType.Video);
    const [linkedScript, setLinkedScript] = useState<Script | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const { createPostDraft, isPending, error, validationErrorKey, clearValidationError } = useCreatePostDraft();

    const handleMediaTypeChange = (next: MediaType) => {
        setMediaType(next);
        setFiles([]);
        clearValidationError();
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const created = await createPostDraft({
            projectUuid,
            title: title.trim(),
            description: description.trim() || null,
            notes: notes.trim() || null,
            mediaType,
            scriptUuid: linkedScript?.uuid ?? null,
            files,
        });

        if (created) {
            selectDraft(created.uuid);
        }
    };

    const submitErrorKey = validationErrorKey
        ?? (error instanceof HttpException && error.response.httpStatus === 409 ? "postDrafts:validation.scriptAlreadyHasDraft" : null);

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
            height="h-160"
            align={isPickerOpen ? ModalAlign.LeftOfCenter : ModalAlign.Center}
        >
            <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit}>
                <Input
                    label={t("postDrafts:form.title")}
                    placeholder={t("postDrafts:form.titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="block text-heading-sm">{t("postDrafts:form.mediaType")}</label>
                    <div className="flex flex-row gap-2">
                        {Object.values(MediaType).map((value) => {
                            const Icon = mediaTypeToIcon[value];
                            return <button
                                key={value}
                                type="button"
                                onClick={() => handleMediaTypeChange(value)}
                                className={`flex-1 px-3 py-2 rounded-xl border text-body-xs cursor-pointer transition-colors ${mediaType === value ? "bg-primary/10 border-primary text-primary" : "bg-clear border-pale-gray text-dark hover:bg-pale-gray-2/30"}`}
                            >
                                <div className="flex flex-row gap-3 justify-center items-center">

                                    <Icon
                                        className={`size-4 shrink-0 ${mediaType === value ? 'text-primary' : 'text-dark-2'}`}
                                        strokeWidth={1.5}
                                    />
                                    <p>
                                        {t(`postDrafts:form.mediaType${value.charAt(0).toUpperCase()}${value.slice(1)}`)}
                                    </p>
                                </div>
                            </button>
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="block text-heading-sm">{t("postDrafts:form.files")}</label>
                    <PostDraftFileDropzone
                        mediaType={mediaType}
                        files={files}
                        onChange={setFiles}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="block text-heading-sm">{t("postDrafts:form.description")}</label>
                    <TextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("postDrafts:form.descriptionPlaceholder")}
                        rows={3}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="block text-heading-sm">{t("postDrafts:form.notes")}</label>
                    <TextArea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t("postDrafts:form.notesPlaceholder")}
                        rows={3}
                    />
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

                {submitErrorKey && (
                    <p className="text-body-sm text-danger">{t(submitErrorKey)}</p>
                )}

                <div className="flex flex-row gap-2 pt-2">
                    <Button type="button" style="outline" onClick={onClose} disabled={isPending}>
                        {t("postDrafts:actions.cancel")}
                    </Button>
                    <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                        {t("postDrafts:form.submit")}
                    </Button>
                </div>
            </form>
        </ModalOverlay>
    );
}