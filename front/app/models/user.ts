interface UserJSON {
    uuid: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    createdAt: string;
    verifiedAt: string | null;
    referralCode: string | null;
}

export class User {
    constructor(
        public readonly uuid: string,
        public firstName: string | null,
        public lastName: string | null,
        public email: string,
        public readonly createdAt: Date,
        public readonly verifiedAt: Date | null,
        public readonly referralCode: string | null,
    ) { }

    static fromJSON(json: UserJSON): User {
        return new User(
            json.uuid,
            json.firstName,
            json.lastName,
            json.email,
            new Date(json.createdAt),
            json.verifiedAt ? new Date(json.verifiedAt) : null,
            json.referralCode ?? null,
        );
    }

    toJSON(): UserJSON {
        return {
            uuid: this.uuid,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            createdAt: this.createdAt.toISOString(),
            verifiedAt: this.verifiedAt?.toISOString() ?? null,
            referralCode: this.referralCode,
        };
    }

    get fullName(): string {
        return [this.firstName, this.lastName].filter(Boolean).join(' ') || this.email;
    }

    get isVerified(): boolean {
        return this.verifiedAt !== null;
    }

    get isPrelaunchSubscriber(): boolean {
        return this.referralCode !== null;
    }
}
