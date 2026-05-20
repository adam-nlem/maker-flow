import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { useContentsStore } from "~/stores/contents/contentsStore";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import { isScriptLimitReached } from "~/utils/subscriptionHelpers";
import { HttpException } from "~/services/httpClient/HttpException";
import { agencyContentsPath, agencyReviewsPath, agencyScriptsPath } from "~/routes/routePaths";

function NewReviewAction() {
    const { t } = useTranslation();
    const openCreatePanel = useReviewsStore((s) => s.openCreatePanel);

    return (
        <Button type="button" style="primary" width="w-auto" onClick={openCreatePanel}>
            <PlusIcon className="size-4 mr-1" strokeWidth={2} />
            {t("reviews:actions.create")}
        </Button>
    );
}

function NewContentGroupAction() {
    const { t } = useTranslation();
    const setIsCreateGroupModalOpen = useContentsStore((s) => s.setIsCreateGroupModalOpen);

    return (
        <Button type="button" style="primary" width="w-auto" onClick={() => setIsCreateGroupModalOpen(true)}>
            <PlusIcon className="size-4 mr-1" strokeWidth={2} />
            {t("contents:newGroup")}
        </Button>
    );
}

function NewScriptAction() {
    const { t } = useTranslation();
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);
    const { scripts } = useListPaginatedScripts({ projectUuid });
    const { subscription } = useShowCurrentSubscription();
    const { plans } = useListPlans();
    const { createScript, isPending } = useCreateScript();

    if (!projectUuid) return null;

    if (isScriptLimitReached(scripts.length, subscription, plans)) {
        return <span className="text-body-xs text-muted-2">{t("scripts:limitReached")}</span>;
    }

    const handleClick = async () => {
        try {
            const newScript = await createScript({ projectUuid, title: t("scripts:newScriptTitle") });
            setFocusedScriptUuid(newScript.uuid);
        } catch (error) {
            if (error instanceof HttpException && error.response.httpStatus === 402) return;
            throw error;
        }
    };

    return (
        <Button type="button" style="primary" width="w-auto" onClick={handleClick} isLoading={isPending} disabled={isPending}>
            <PlusIcon className="size-4 mr-1" strokeWidth={2} />
            {t("scripts:newScriptTitle")}
        </Button>
    );
}

export const agencyTopBarActions: Record<string, ComponentType> = {
    [agencyReviewsPath]: NewReviewAction,
    [agencyContentsPath]: NewContentGroupAction,
    [agencyScriptsPath]: NewScriptAction,
};
