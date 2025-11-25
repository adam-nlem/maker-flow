export class User {
    constructor(
        public uuid: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public createdAt: Date,
    ) { }

    static fromJSON(json: any): User {

        return new User(
            json.uuid,
            json.firstName,
            json.lastName,
            json.email,
            new Date(json.createdAt),
        );
    }

    toJSON(): any {
        return {
            uuid: this.uuid,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            createdAt: this.createdAt.toISOString(),
        };
    }
}
