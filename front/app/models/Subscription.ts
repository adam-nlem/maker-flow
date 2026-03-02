import { SubscriptionPlan } from "./enums/SubscriptionPlan";
import { SubscriptionStatus } from "./enums/SubscriptionStatus";

export interface SubscriptionJSON {
    uuid: string;
    stripeSubscriptionId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export class Subscription {
    constructor(
        public readonly uuid: string,
        public readonly stripeSubscriptionId: string,
        public readonly plan: SubscriptionPlan,
        public readonly status: SubscriptionStatus,
        public readonly currentPeriodStart: Date,
        public readonly currentPeriodEnd: Date,
        public readonly cancelAtPeriodEnd: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date | null,
    ) {}

    static fromJSON(json: SubscriptionJSON): Subscription {
        return new Subscription(
            json.uuid,
            json.stripeSubscriptionId,
            json.plan,
            json.status,
            new Date(json.currentPeriodStart),
            new Date(json.currentPeriodEnd),
            json.cancelAtPeriodEnd,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : null,
        );
    }

    get isActive(): boolean {
        return this.status === SubscriptionStatus.Active;
    }
}
