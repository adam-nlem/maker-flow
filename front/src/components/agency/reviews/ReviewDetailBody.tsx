import { useTranslation } from "react-i18next";
import { TextArea } from "~/components/ui/TextArea";
import LinkedScriptField from "~/components/agency/scripts/LinkedScriptField";
import { Review } from "~/models/Review";
import type { ReviewEditForm } from "~/hooks/useReviewEditForm";

interface ReviewDetailBodyProps {
    review: Review;
    projectUuid: string;
    form: ReviewEditForm;
}

export default function ReviewDetailBody({ review, projectUuid, form }: ReviewDetailBodyProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-5 w-2/3">
            {(form.canEdit || review.description) && (
                <section>
                    <h3 className="uppercase text-body-xs tracking-wider text-muted-2 mb-2">
                        {t("reviews:detail.descriptionLabel")}
                    </h3>
                    {form.canEdit ? (
                        <TextArea
                            simple
                            textStyle="text-body-sm"
                            placeholder={t("reviews:form.descriptionPlaceholder")}
                            value={form.description}
                            onChange={(e) => form.setDescription(e.target.value)}
                        />
                    ) : (
                        <p className="text-body-sm text-dark-2 whitespace-pre-wrap">{review.description}</p>
                    )}
                </section>
            )}

            {(form.canEdit || review.notes) && (
                <section>
                    <h3 className="uppercase text-body-xs tracking-wider text-muted-2 mb-2">
                        {t("reviews:detail.notesLabel")}
                    </h3>
                    <div className="bg-clear-2 border border-dashed border-pale-gray-2 p-3 rounded-lg">
                        <span className="block text-body-xs text-muted-2 mb-1">
                            {t("reviews:detail.notesHint")}
                        </span>
                        {form.canEdit ? (
                            <TextArea
                                simple
                                className="p-1 bg-clear-2"
                                textStyle="text-body-sm"
                                placeholder={t("reviews:form.notesPlaceholder")}
                                value={form.notes}
                                onChange={(e) => form.setNotes(e.target.value)}
                            />
                        ) : (
                            <p className="text-body-sm text-dark-2 whitespace-pre-wrap italic">{review.notes}</p>
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
