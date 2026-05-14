export interface AgencyJSON {
    uuid: string;
    name: string;
    accentColor: string | null;
    backgroundColor: string | null;
    backgroundSecondaryColor: string | null;
    textColor: string | null;
    textSecondaryColor: string | null;
    headingFont: string | null;
    bodyFont: string | null;
    contactEmail: string | null;
    website: string | null;
}

export class Agency {
    constructor(
        public readonly uuid: string,
        public name: string,
        public accentColor: string | null,
        public backgroundColor: string | null,
        public backgroundSecondaryColor: string | null,
        public textColor: string | null,
        public textSecondaryColor: string | null,
        public headingFont: string | null,
        public bodyFont: string | null,
        public contactEmail: string | null,
        public website: string | null,
    ) { }

    static fromJSON(json: AgencyJSON): Agency {
        return new Agency(
            json.uuid,
            json.name,
            json.accentColor ?? null,
            json.backgroundColor ?? null,
            json.backgroundSecondaryColor ?? null,
            json.textColor ?? null,
            json.textSecondaryColor ?? null,
            json.headingFont ?? null,
            json.bodyFont ?? null,
            json.contactEmail ?? null,
            json.website ?? null,
        )
    }

    toJSON(): AgencyJSON {
        return {
            uuid: this.uuid,
            name: this.name,
            accentColor: this.accentColor,
            backgroundColor: this.backgroundColor,
            backgroundSecondaryColor: this.backgroundSecondaryColor,
            textColor: this.textColor,
            textSecondaryColor: this.textSecondaryColor,
            headingFont: this.headingFont,
            bodyFont: this.bodyFont,
            contactEmail: this.contactEmail,
            website: this.website,
        }
    }
}
