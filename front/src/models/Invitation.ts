import { UserRole } from "./enums/UserRole"

export interface InvitationJSON {
    uuid: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string | null;
    expiresAt: string;
    createdAt: string;
}

export class Invitation {
    constructor(
        public readonly uuid: string,
        public readonly email: string,
        public readonly firstName: string | null,
        public readonly lastName: string | null,
        public readonly role: UserRole | null,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
    ) { }

    static fromJSON(json: InvitationJSON): Invitation {
        return new Invitation(
            json.uuid,
            json.email,
            json.firstName ?? null,
            json.lastName ?? null,
            json.role ? (json.role as UserRole) : null,
            new Date(json.expiresAt),
            new Date(json.createdAt),
        )
    }

    toJSON(): InvitationJSON {
        return {
            uuid: this.uuid,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            expiresAt: this.expiresAt.toISOString(),
            createdAt: this.createdAt.toISOString(),
        }
    }

    get fullName(): string {
        return [this.firstName, this.lastName].filter(Boolean).join(' ') || this.email
    }
}
