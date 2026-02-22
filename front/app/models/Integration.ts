import { IntegrationPlatform } from "./enums/IntegrationPlatform";
import { IntegrationStatus } from "./enums/IntegrationStatus";

export interface IntegrationJSON {
    uuid: string;
    platform: IntegrationPlatform;
    accountId: string;
    userName: string;
    name: string | null;
    profilePictureUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
    expiresAt: string | null;
    lastSyncedAt: string;
    status: IntegrationStatus;
}

export class Integration {
    constructor(
        public readonly uuid: string,
        public readonly platform: IntegrationPlatform,
        public readonly accountId: string,
        public readonly userName: string,
        public readonly name: string | null,
        public readonly profilePictureUrl: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date | null,
        public readonly expiresAt: Date | null,
        public readonly lastSyncedAt: Date,
        public readonly status: IntegrationStatus,
    ) {}

    static fromJSON(json: IntegrationJSON): Integration {
        return new Integration(
            json.uuid,
            json.platform,
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
