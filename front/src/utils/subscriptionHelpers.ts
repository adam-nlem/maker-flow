import type { PlanConfigDTO } from "~/dtos/subscriptions/PlanConfigDTO";
import type { Subscription } from "~/models/Subscription";

/**
 * Returns whether the script limit for the current subscription plan has been reached.
 */
export function isScriptLimitReached(scriptCount: number, subscription: Subscription | null, plans: PlanConfigDTO[]): boolean {
    const currentPlanConfig = plans.find((p) => p.plan === subscription?.plan);
    const maxScripts = subscription ? (currentPlanConfig?.maxScriptsPerProject ?? null) : 1;
    return maxScripts !== null && scriptCount >= maxScripts;
}
