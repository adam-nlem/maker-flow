export interface AgencyJSON {
    uuid: string;
    name: string;
    contactEmail: string | null;
    website: string | null;
}

export class Agency {
    constructor(
        public readonly uuid: string,
        public name: string,
        public contactEmail: string | null,
        public website: string | null,
    ) { }

    static fromJSON(json: AgencyJSON): Agency {
        return new Agency(
            json.uuid,
            json.name,
            json.contactEmail ?? null,
            json.website ?? null,
        )
    }

    toJSON(): AgencyJSON {
        return {
            uuid: this.uuid,
            name: this.name,
            contactEmail: this.contactEmail,
            website: this.website,
        }
    }
}
