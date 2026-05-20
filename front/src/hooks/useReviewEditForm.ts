import { useEffect, useState } from "react";
import { Review } from "~/models/Review";
import type { Script } from "~/models/Script";
import { UserRole } from "~/models/enums/UserRole";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useUpdateReview } from "~/hooks/api/reviews/useUpdateReview";

export function useReviewEditForm(review: Review, projectUuid: string) {
    const [title, setTitle] = useState(review.title);
    const [description, setDescription] = useState(review.description ?? "");
    const [notes, setNotes] = useState(review.notes ?? "");
    const [linkedScript, setLinkedScript] = useState<Script | null>(review.script ?? null);

    const { user } = useCurrentUser();
    const { updateReview, isPending } = useUpdateReview();

    useEffect(() => {
        setTitle(review.title);
        setDescription(review.description ?? "");
        setNotes(review.notes ?? "");
        setLinkedScript(review.script ?? null);
    }, [review]);

    const canEdit = user?.hasRole(UserRole.Admin) || user?.hasRole(UserRole.Editor) || false;

    const linkedScriptUuid = linkedScript?.uuid ?? "";
    const initialScriptUuid = review.script?.uuid ?? "";

    const hasChanges = canEdit && (
        title !== review.title
        || description !== (review.description ?? "")
        || notes !== (review.notes ?? "")
        || linkedScriptUuid !== initialScriptUuid
    );

    const submit = async () => {
        if (!hasChanges) return;
        await updateReview({
            uuid: review.uuid,
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
