import { useTranslation } from "react-i18next";
import { TextArea } from "~/components/ui/TextArea";
import LinkedScriptField from "~/components/agency/scripts/LinkedScriptField";
import { PostDraft } from "~/models/PostDraft";
import type { PostDraftEditForm } from "~/hooks/usePostDraftEditForm";

interface PostDraftDetailBodyProps {
    postDraft: PostDraft;
    projectUuid: string;
    form: PostDraftEditForm;
}

export default function PostDraftDetailBody({ postDraft, projectUuid, form }: PostDraftDetailBodyProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-5 w-2/3">
            {(form.canEdit || postDraft.description) && (
                <section>
                    <h3 className="uppercase text-body-xs tracking-wider text-muted-2 mb-2">
                        {t("postDrafts:detail.descriptionLabel")}
                    </h3>
                    {form.canEdit ? (
                        <TextArea
                            simple
                            textStyle="text-body-sm"
                            placeholder={t("postDrafts:form.descriptionPlaceholder")}
                            value={form.description}
                            onChange={(e) => form.setDescription(e.target.value)}
                        />
                    ) : (
                        <p className="text-body-sm text-dark-2 whitespace-pre-wrap">{postDraft.description}</p>
                    )}
                </section>
            )}

            {(form.canEdit || postDraft.notes) && (
                <section>
                    <h3 className="uppercase text-body-xs tracking-wider text-muted-2 mb-2">
                        {t("postDrafts:detail.notesLabel")}
                    </h3>
                    <div className="bg-clear-2 border border-dashed border-pale-gray-2 p-3 rounded-lg">
                        <span className="block text-body-xs text-muted-2 mb-1">
                            {t("postDrafts:detail.notesHint")}
                        </span>
                        {form.canEdit ? (
                            <TextArea
                                simple
                                className="p-1 bg-clear-2"
                                textStyle="text-body-sm"
                                placeholder={t("postDrafts:form.notesPlaceholder")}
                                value={form.notes}
                                onChange={(e) => form.setNotes(e.target.value)}
                            />
                        ) : (
                            <p className="text-body-sm text-dark-2 whitespace-pre-wrap italic">{postDraft.notes}</p>
                        )}
                    </div>
                </section>
            )}

            {form.canEdit && (
                <section className="flex flex-col gap-2">
                    <h3 className="uppercase text-body-xs tracking-wider text-muted-2">
                        {t("scripts:picker.linkedField.label")}
                    </h3>
                    <LinkedScriptField
                        projectUuid={projectUuid}
                        value={form.linkedScript}
                        onChange={form.setLinkedScript}
                    />
                </section>
            )}
        </div>
    );
}
