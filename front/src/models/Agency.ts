interface AgencyJSON {
    uuid: string;
    name: string;
    brandColor: string | null;
    contactEmail: string | null;
    website: string | null;
}

export class Agency {
    constructor(
        public readonly uuid: string,
        public name: string,
        public brandColor: string | null,
        public contactEmail: string | null,
        public website: string | null,
    ) { }

    static fromJSON(json: AgencyJSON): Agency {
        return new Agency(
            json.uuid,
            json.name,
            json.brandColor ?? null,
            json.contactEmail ?? null,
            json.website ?? null,
        )
    }

    toJSON(): AgencyJSON {
        return {
            uuid: this.uuid,
            name: this.name,
            brandColor: this.brandColor,
            contactEmail: this.contactEmail,
            website: this.website,
        }
    }
}
