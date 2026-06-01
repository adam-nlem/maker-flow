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

    get isDismissed(): boolean {
        return this.dismissedAt !== null
    }

    isStepCompleted(step: string): boolean {
        return this.completedSteps.includes(step)
    }
}
