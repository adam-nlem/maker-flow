import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import type { ReviewEditForm } from "~/hooks/useReviewEditForm";

interface ReviewDetailBodyProps {
  reviewDTO: ReviewWithLatestVersionDTO;
  form?: ReviewEditForm;
  /** Right-aligned buttons rendered next to the title (e.g. delete). */
  actions?: ReactNode;
  /** Rendered when the body should expose a "linked script" picker (agency edit flow). */
  linkedScriptField?: ReactNode;
}

export default function ReviewDetailBody({ reviewDTO, form, actions, linkedScriptField }: ReviewDetailBodyProps) {
  const { t } = useTranslation();
  const canEdit = form?.canEdit ?? false;
  const hasActions = form?.hasChanges || actions;

  return (
    <div className="flex flex-col gap-5 w-2/3">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {canEdit && form ? (
            <Input
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              simple
              required
              textStyle="text-heading-2xl"
              placeholder={t("reviews:form.titlePlaceholder")}
            />
          ) : (
            <h1 className="text-heading-2xl text-dark wrap-break-word">{reviewDTO.review.title}</h1>
          )}
        </div>

        {hasActions && (
          <div className="flex flex-row gap-2 shrink-0">
            {form?.hasChanges && (
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
            {actions}
          </div>
        )}
      </div>

      {(canEdit || reviewDTO.review.description) && (
        <section>
          <h3 className="uppercase text-body-xs tracking-wider text-muted-2 mb-2">
            {t("reviews:detail.descriptionLabel")}
          </h3>
          {canEdit && form ? (
            <TextArea
              simple
              textStyle="text-body-sm"
              placeholder={t("reviews:form.descriptionPlaceholder")}
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
            />
          ) : (
            <p className="text-body-sm text-dark-2 whitespace-pre-wrap">{reviewDTO.review.description}</p>
          )}
        </section>
      )}


      {(canEdit || reviewDTO.review.notes) && (
        <section>
          <h3 className="uppercase text-body-xs tracking-wider text-muted-2 mb-2">
            {t("reviews:detail.notesLabel")}
          </h3>
          <div className="bg-clear-2 border border-dashed border-pale-gray-2 p-3 rounded-lg">
            <span className="block text-body-xs text-muted-2 mb-1">
              {t("reviews:detail.notesHint")}
            </span>
            {canEdit && form ? (
              <TextArea
                simple
                className="p-1 bg-clear-2"
                textStyle="text-body-sm"
                placeholder={t("reviews:form.notesPlaceholder")}
                value={form.notes}
                onChange={(e) => form.setNotes(e.target.value)}
              />
            ) : (
              <p className="text-body-sm text-dark-2 whitespace-pre-wrap italic">{reviewDTO.review.notes}</p>
            )}
          </div>
        </section>
      )}

      {linkedScriptField && (
        <section className="flex flex-col gap-2">
          <h3 className="uppercase text-body-xs tracking-wider text-muted-2">
            {t("scripts:picker.linkedField.label")}
          </h3>
          {linkedScriptField}
        </section>
      )}
    </div>
  );
}
