import { IntegrationProvider } from "./enums/IntegrationProvider";

export interface IntegrationJSON {
    uuid: string;
    provider: IntegrationProvider;
    accountId: string;
    userName: string;
    name: string | null;
    profilePictureUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
    expiresAt: string | null;
    lastSyncedAt: string;
    status: string;
}

export class Integration {
    constructor(
        public readonly uuid: string,
        public readonly provider: IntegrationProvider,
        public readonly accountId: string,
        public readonly userName: string,
        public readonly name: string | null,
        public readonly profilePictureUrl: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date | null,
        public readonly expiresAt: Date | null,
        public readonly lastSyncedAt: Date,
        public readonly status: string,
    ) {}

    static fromJSON(json: IntegrationJSON): Integration {
        return new Integration(
            json.uuid,
            json.provider,
            json.accountId,
            json.userName,
            json.name,
            json.profilePictureUrl,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : null,
            json.expiresAt ? new Date(json.expiresAt) : null,
            new Date(json.lastSyncedAt),
            json.status,
        );
    }

    get displayName(): string {
        return this.name ?? this.userName;
    }
}
