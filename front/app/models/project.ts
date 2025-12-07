import type { ProjectType } from "./enums/ProjectType"

interface ProjectJSON {
    uuid: string;
    name: string;
    description: string;
    types: ProjectType[];
    createdAt: string;
    updatedAt?: string;
    finishedAt?: string;
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
    ) { }

    static fromJSON(json: ProjectJSON): Project {
        return new Project(
            json.uuid,
            json.name,
            json.description,
            json.types,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.finishedAt ? new Date(json.finishedAt) : undefined,
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
        }
    }

    get isFinished(): boolean {
        return this.finishedAt !== undefined;
    }
}