import { useEffect, useState } from "react";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import type { Script } from "~/models/Script";
import { UserRole } from "~/models/enums/UserRole";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useUpdateReview } from "~/hooks/api/reviews/useUpdateReview";

export function useReviewEditForm(reviewDTO: ReviewWithLatestVersionDTO, projectUuid: string) {
    const [title, setTitle] = useState(reviewDTO.review.title);
    const [description, setDescription] = useState(reviewDTO.review.description ?? "");
    const [notes, setNotes] = useState(reviewDTO.review.notes ?? "");
    const [linkedScript, setLinkedScript] = useState<Script | null>(reviewDTO.review.script ?? null);

    const { user } = useCurrentUser();
    const { updateReview, isPending } = useUpdateReview();

    useEffect(() => {
        setTitle(reviewDTO.review.title);
        setDescription(reviewDTO.review.description ?? "");
        setNotes(reviewDTO.review.notes ?? "");
        setLinkedScript(reviewDTO.review.script ?? null);
    }, [reviewDTO]);

    const canEdit = user?.hasRole(UserRole.Admin) || user?.hasRole(UserRole.Editor) || false;

    const linkedScriptUuid = linkedScript?.uuid ?? "";
    const initialScriptUuid = reviewDTO.review.script?.uuid ?? "";

    const hasChanges = canEdit && (
        title !== reviewDTO.review.title
        || description !== (reviewDTO.review.description ?? "")
        || notes !== (reviewDTO.review.notes ?? "")
        || linkedScriptUuid !== initialScriptUuid
    );

    const submit = async () => {
        if (!hasChanges) return;
        await updateReview({
            uuid: reviewDTO.review.uuid,
            projectUuid,
            title: title.trim(),
            description: description.trim() || null,
            notes: notes.trim() || null,
            scriptUuid: linkedScriptUuid || null,
        });
    };

    return {
        title,
        setTitle,
        description,
        setDescription,
        notes,
        setNotes,
        linkedScript,
        setLinkedScript,
        canEdit,
        hasChanges,
        isPending,
        submit,
    };
}

export type ReviewEditForm = ReturnType<typeof useReviewEditForm>;
