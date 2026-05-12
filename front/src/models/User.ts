import { Agency } from "./Agency"
import { UserRole, userRolePrecedence } from "./enums/UserRole"

export interface UserJSON {
    uuid: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    createdAt: string;
    verifiedAt: string | null;
    referralCode: string | null;
    roles: string[];
    agency: ReturnType<Agency["toJSON"]> | null;
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
        public readonly roles: UserRole[],
        public readonly agency: Agency | null,
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
            (json.roles ?? []).map((r) => r as UserRole),
            json.agency ? Agency.fromJSON(json.agency) : null,
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
            roles: this.roles,
            agency: this.agency?.toJSON() ?? null,
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

    get isClient(): boolean {
        return this.hasRole(UserRole.Client);
    }

    get displayRole(): UserRole | null {
        return userRolePrecedence.find((role) => this.roles.includes(role)) ?? null;
    }

    hasRole(role: UserRole): boolean {
        return this.roles.includes(role);
    }
}
