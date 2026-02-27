import { useMutation } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptGeneration, type ScriptGenerationJSON } from "~/models/ScriptGeneration";
import type { ScriptGoal } from "~/models/enums/ScriptGoal";
import type { OpeningStyle } from "~/models/enums/OpeningStyle";
import type { VideoDuration } from "~/models/enums/VideoDuration";

interface CreateScriptGenerationData {
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
    replaceExisting: boolean;
}

export function useCreateScriptGeneration() {
    const mutation = useMutation({
        mutationFn: async (data: CreateScriptGenerationData) => {
            const response = await httpClient.post<ScriptGenerationJSON>('/script-generations', data);
            return ScriptGeneration.fromJSON(response.data);
        },
    });

    return {
        createScriptGeneration: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
