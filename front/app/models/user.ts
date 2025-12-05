interface UserJSON {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
}

export class User {
    constructor(
        public readonly uuid: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public readonly createdAt: Date,
    ) { }

    static fromJSON(json: UserJSON): User {
        return new User(
            json.uuid,
            json.firstName,
            json.lastName,
            json.email,
            new Date(json.createdAt),
        );
    }

    toJSON(): UserJSON {
        return {
            uuid: this.uuid,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            createdAt: this.createdAt.toISOString(),
        };
    }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
