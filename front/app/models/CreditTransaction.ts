import { CreditTransactionType } from "./enums/CreditTransactionType";
import { SourceBucket } from "./enums/SourceBucket";

export interface CreditTransactionJSON {
    uuid: string;
    amount: number;
    type: CreditTransactionType;
    sourceBucket: SourceBucket;
    balanceAfter: number;
    description: string | null;
    createdAt: string;
}

export class CreditTransaction {
    constructor(
        public readonly uuid: string,
        public readonly amount: number,
        public readonly type: CreditTransactionType,
        public readonly sourceBucket: SourceBucket,
        public readonly balanceAfter: number,
        public readonly description: string | null,
        public readonly createdAt: Date,
    ) {}

    static fromJSON(json: CreditTransactionJSON): CreditTransaction {
        return new CreditTransaction(
            json.uuid,
            json.amount,
            json.type,
            json.sourceBucket,
            json.balanceAfter,
            json.description,
            new Date(json.createdAt),
        );
    }

    get isCredit(): boolean {
        return this.amount > 0;
    }
}
