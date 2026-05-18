import { useTranslation } from "react-i18next";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { PostDraft } from "~/models/PostDraft";
import { mediaTypeToIcon } from "~/models/enums/MediaType";
import type { PostDraftEditForm } from "~/hooks/usePostDraftEditForm";
import { formatToRelative } from "~/utils/dateFormatters";

interface PostDraftDetailHeaderProps {
    postDraft: PostDraft;
    form: PostDraftEditForm;
    onOpenLinkedScript: (scriptUuid: string) => void;
    onDeleteClick: () => void;
}

export default function PostDraftDetailHeader({
    postDraft,
    form,
    onOpenLinkedScript,
    onDeleteClick,
}: PostDraftDetailHeaderProps) {
    const { t } = useTranslation();
    const MediaTypeIcon = mediaTypeToIcon[postDraft.mediaType];
    const typeLabel = t(`postDrafts:detail.eyebrow.${postDraft.mediaType}`);
    const relativeCreatedAt = formatToRelative(new Date(postDraft.createdAt));

    return (
        <header className="flex flex-row items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
                <div className="flex flex-row items-center gap-2 text-body-xs uppercase tracking-wider text-muted-2 mb-2">
                    <MediaTypeIcon className="size-3.5" />
                    <span>{typeLabel}</span>
                    <span aria-hidden className="text-pale-gray-2">·</span>
                    <span>v{postDraft.revisions.length} · {relativeCreatedAt}</span>
                    {postDraft.script && !form.canEdit && (
                        <>
                            <span aria-hidden className="text-pale-gray-2">·</span>
                            <button
                                type="button"
                                onClick={() => onOpenLinkedScript(postDraft.script!.uuid)}
                                className="uppercase tracking-wider hover:text-dark transition-colors cursor-pointer"
                            >
                                {t("postDrafts:detail.fromScript", { title: postDraft.script.title })}
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
                        placeholder={t("postDrafts:form.titlePlaceholder")}
                    />
                ) : (
                    <h1 className="text-heading-2xl text-dark wrap-break-word">{postDraft.title}</h1>
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
                        {t("postDrafts:actions.save")}
                    </Button>
                )}
                <Button type="button" style="secondary" width="w-auto" onClick={onDeleteClick}>
                    <TrashIcon className="size-4 mr-1" strokeWidth={2} />
                    {t("postDrafts:actions.delete")}
                </Button>
            </div>
        </header>
    );
}
