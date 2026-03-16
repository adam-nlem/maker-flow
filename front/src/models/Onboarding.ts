import { OnboardingStep, onboardingStepOptions } from "./enums/OnboardingStep"

interface OnboardingJSON {
    uuid: string;
    completedSteps: string[];
    dismissedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export class Onboarding {
    constructor(
        public readonly uuid: string,
        public readonly completedSteps: string[],
        public readonly dismissedAt: Date | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static fromJSON(json: OnboardingJSON): Onboarding {
        return new Onboarding(
            json.uuid,
            json.completedSteps,
            json.dismissedAt ? new Date(json.dismissedAt) : null,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        )
    }

    get isCompleted(): boolean {
        return onboardingStepOptions.every((step) => this.completedSteps.includes(step))
    }

    get isDismissed(): boolean {
        return this.dismissedAt !== null
    }

    get completionCount(): number {
        return onboardingStepOptions.filter((step) => this.completedSteps.includes(step)).length
    }

    get totalSteps(): number {
        return onboardingStepOptions.length
    }

    isStepCompleted(step: OnboardingStep): boolean {
        return this.completedSteps.includes(step)
    }
}
