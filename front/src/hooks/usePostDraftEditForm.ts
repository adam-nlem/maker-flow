import { useEffect, useState } from "react";
import { PostDraft } from "~/models/PostDraft";
import type { Script } from "~/models/Script";
import { UserRole } from "~/models/enums/UserRole";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useUpdatePostDraft } from "~/hooks/api/postDrafts/useUpdatePostDraft";

export function usePostDraftEditForm(postDraft: PostDraft, projectUuid: string) {
    const [title, setTitle] = useState(postDraft.title);
    const [description, setDescription] = useState(postDraft.description ?? "");
    const [notes, setNotes] = useState(postDraft.notes ?? "");
    const [linkedScript, setLinkedScript] = useState<Script | null>(postDraft.script ?? null);

    const { user } = useCurrentUser();
    const { updatePostDraft, isPending } = useUpdatePostDraft();

    useEffect(() => {
        setTitle(postDraft.title);
        setDescription(postDraft.description ?? "");
        setNotes(postDraft.notes ?? "");
        setLinkedScript(postDraft.script ?? null);
    }, [postDraft]);

    const canEdit = user?.hasRole(UserRole.Admin) || user?.hasRole(UserRole.Editor) || false;

    const linkedScriptUuid = linkedScript?.uuid ?? "";
    const initialScriptUuid = postDraft.script?.uuid ?? "";

    const hasChanges = canEdit && (
        title !== postDraft.title
        || description !== (postDraft.description ?? "")
        || notes !== (postDraft.notes ?? "")
        || linkedScriptUuid !== initialScriptUuid
    );

    const submit = async () => {
        if (!hasChanges) return;
        await updatePostDraft({
            uuid: postDraft.uuid,
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

export type PostDraftEditForm = ReturnType<typeof usePostDraftEditForm>;
