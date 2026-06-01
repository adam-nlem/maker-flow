import { Agency, type AgencyJSON } from "./Agency"
import { Project, type ProjectJSON } from "./Project"
import { User, type UserJSON } from "./User"
import { InvitationType } from "./enums/InvitationType"
import { UserRole } from "./enums/UserRole"

export interface InvitationJSON {
    uuid: string;
    type?: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string | null;
    agency?: AgencyJSON | null;
    project?: ProjectJSON | null;
    createdBy?: UserJSON | null;
    expiresAt: string;
    createdAt: string;
}

export class Invitation {
    constructor(
        public readonly uuid: string,
        public readonly type: InvitationType | null,
        public readonly email: string,
        public readonly firstName: string | null,
        public readonly lastName: string | null,
        public readonly role: UserRole | null,
        public readonly agency: Agency | null,
        public readonly project: Project | null,
        public readonly createdBy: User | null,
        public readonly expiresAt: Date,
        public readonly createdAt: Date,
    ) { }

    static fromJSON(json: InvitationJSON): Invitation {
        return new Invitation(
            json.uuid,
            json.type ? (json.type as InvitationType) : null,
            json.email,
            json.firstName ?? null,
            json.lastName ?? null,
            json.role ? (json.role as UserRole) : null,
            json.agency ? Agency.fromJSON(json.agency) : null,
            json.project ? Project.fromJSON(json.project) : null,
            json.createdBy ? User.fromJSON(json.createdBy) : null,
            new Date(json.expiresAt),
            new Date(json.createdAt),
        )
    }

    get fullName(): string {
        return [this.firstName, this.lastName].filter(Boolean).join(' ') || this.email
    }
}
