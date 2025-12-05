import type { ModuleSize } from "./enums/ModuleSize";
import { Module } from "./module";
import type { ModuleJSON } from "./module";

interface UserModuleJSON {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    xIndex: number;
    yIndex: number;
    size: ModuleSize;
    isActive: boolean;
    isHidden: boolean;
    module: ModuleJSON;
}

export class UserModule {
    constructor(
        public readonly uuid: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public xIndex: number,
        public yIndex: number,
        public size: ModuleSize,
        public isActive: boolean,
        public isHidden: boolean,
        public module: Module,
    ) { }

    static fromJSON(json: UserModuleJSON): UserModule {
        return new UserModule(
            json.uuid,
            new Date(json.createdAt),
            new Date(json.updatedAt),
            json.xIndex,
            json.yIndex,
            json.size,
            json.isActive,
            json.isHidden,
            Module.fromJSON(json.module),
        );
    }

    toJSON(): UserModuleJSON {
        return {
            uuid: this.uuid,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            xIndex: this.xIndex,
            yIndex: this.yIndex,
            size: this.size,
            isActive: this.isActive,
            isHidden: this.isHidden,
            module: this.module.toJSON(),
        };
    }
}
