import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { ScriptGeneration, type ScriptGenerationJSON } from "~/models/ScriptGeneration";
import { scriptGenerationQueryKeys } from "./scriptGenerationQueryKeys";
import type { ScriptGoal } from "~/models/enums/ScriptGoal";
import type { OpeningStyle } from "~/models/enums/OpeningStyle";
import type { VideoDuration } from "~/models/enums/VideoDuration";
import type { AiModel } from "~/models/enums/AiModel";

interface UpdateScriptGenerationData {
    generationUuid: string;
    scriptUuid: string;
    topic: string;
    goal: ScriptGoal;
    keyPoints?: string;
    openingStyle: OpeningStyle;
    duration: VideoDuration;
    callToAction?: string;
    extraContext?: string;
    activeSkills: string[];
    skillInputs: Record<string, string>;
    aiModel: AiModel;
}

export function useUpdateScriptGeneration() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ generationUuid, ...data }: UpdateScriptGenerationData) => {
            const response = await httpClient.patch<ScriptGenerationJSON>(`/script-generations/${generationUuid}`, data);
            return ScriptGeneration.fromJSON(response.data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptGenerationQueryKeys.list(variables.scriptUuid) });
            track(AnalyticsEvent.ScriptGenerationRegenerated, { ai_model: variables.aiModel })
        },
    });

    return {
        updateScriptGeneration: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
