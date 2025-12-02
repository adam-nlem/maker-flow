export class Project {
    constructor(
        public uuid: string,
        public name: string,
        public description: string,
        public projectType: ProjectType,
        public createdAt: Date,
        public updatedAt?: Date,
        public finisedAt?: Date,
    ) { }

    static fromJSON(json: any): Project {
        return new Project(
            json.uuid,
            json.name,
            json.description,
            json.projectType,
            new Date(json.createdAt),
            new Date(json.updatedAt) || null,
            new Date(json.finisedAt) || null,
        )
    }

    toJSON(): any {
        return {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            projectType: this.projectType,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            finisedAt: this.finisedAt?.toISOString(),
        }
    }
}