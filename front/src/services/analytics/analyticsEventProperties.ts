import type { WelcomeStep } from "~/models/enums/WelcomeStep";
import type { OtpType } from "~/models/enums/OtpType";
import type { OnboardingStep } from "~/models/enums/OnboardingStep";
import type { ProjectType } from "~/models/enums/ProjectType";
import type { ScriptPartType } from "~/models/enums/ScriptPartType";
import type { ScriptGoal } from "~/models/enums/ScriptGoal";
import type { OpeningStyle } from "~/models/enums/OpeningStyle";
import type { VideoDuration } from "~/models/enums/VideoDuration";
import type { AiModel } from "~/models/enums/AiModel";
import type { Platform } from "~/models/enums/Platform";
import type { SubscriptionPlan } from "~/models/enums/SubscriptionPlan";

export interface EventProperties {}

export interface WelcomeStepViewedEvent extends EventProperties {
    step: WelcomeStep;
}

export interface UserLoggedInEvent extends EventProperties {
    method: OtpType;
}

export interface OnboardingStepCompletedEvent extends EventProperties {
    step: OnboardingStep;
}

export interface ProjectCreatedEvent extends EventProperties {
    project_types: ProjectType[];
}

export interface ScriptPartAddedEvent extends EventProperties {
    part_type: ScriptPartType;
}

export interface ScriptGenerationCreatedEvent extends EventProperties {
    goal: ScriptGoal;
    opening_style: OpeningStyle;
    duration: VideoDuration;
    ai_model: AiModel;
    skills_count: number;
}

export interface ScriptGenerationRegeneratedEvent extends EventProperties {
    ai_model: AiModel;
}

export interface IntegrationConnectedEvent extends EventProperties {
    platform: Platform;
}

export interface SubscriptionCheckoutStartedEvent extends EventProperties {
    plan: SubscriptionPlan;
}

export interface SubscriptionPurchasedEvent extends EventProperties {
    plan: SubscriptionPlan;
}
