import { Agency, type AgencyJSON } from "./Agency"
import type { ProjectType } from "./enums/ProjectType"

export interface ProjectJSON {
    uuid: string;
    name: string;
    description?: string;
    types?: ProjectType[];
    createdAt?: string;
    updatedAt?: string;
    finishedAt?: string;
    agency?: AgencyJSON | null;
}

export class Project {
    constructor(
        public readonly uuid: string,
        public name: string,
        public description: string,
        public types: ProjectType[],
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
        public readonly finishedAt?: Date,
        public readonly agency: Agency | null = null,
    ) { }

    static fromJSON(json: ProjectJSON): Project {
        return new Project(
            json.uuid,
            json.name,
            json.description ?? "",
            json.types ?? [],
            json.createdAt ? new Date(json.createdAt) : new Date(0),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.finishedAt ? new Date(json.finishedAt) : undefined,
            json.agency ? Agency.fromJSON(json.agency) : null,
        )
    }

    toJSON(): ProjectJSON {
        return {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            types: this.types,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            finishedAt: this.finishedAt?.toISOString(),
            agency: this.agency?.toJSON() ?? null,
        }
    }

    get isFinished(): boolean {
        return this.finishedAt !== undefined;
    }
}
