export interface CreditBalanceJSON {
    uuid: string;
    subscriptionCredits: number;
    topupCredits: number;
    createdAt: string;
    updatedAt: string | null;
}

export class CreditBalance {
    constructor(
        public readonly uuid: string,
        public readonly subscriptionCredits: number,
        public readonly topupCredits: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date | null,
    ) {}

    static fromJSON(json: CreditBalanceJSON): CreditBalance {
        return new CreditBalance(
            json.uuid,
            json.subscriptionCredits,
            json.topupCredits,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : null,
        );
    }

    get totalCredits(): number {
        return this.subscriptionCredits + this.topupCredits;
    }
}
