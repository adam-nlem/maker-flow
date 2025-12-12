import type { ModuleIdentifier } from "./enums/ModuleIdentifier";

export interface ModuleJSON {
  uuid: string;
  title: string;
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  moduleIdentifier: ModuleIdentifier;
}

export class Module {
  constructor(
    public readonly uuid: string,
    public title: string,
    public isActive: boolean,
    public isPremium: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public moduleIdentifier: ModuleIdentifier,
    public description?: string,
  ) { }

  static fromJSON(json: ModuleJSON): Module {
    return new Module(
      json.uuid,
      json.title,
      json.isActive,
      json.isPremium,
      new Date(json.createdAt),
      new Date(json.updatedAt),
      json.moduleIdentifier,
      json.description,
    )
  }

  toJSON(): ModuleJSON {
    return {
      uuid: this.uuid,
      title: this.title,
      isActive: this.isActive,
      isPremium: this.isPremium,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      moduleIdentifier: this.moduleIdentifier,
      description: this.description,
    }
  }
}
