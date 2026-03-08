import { Script, type ScriptJSON } from "~/models/Script";
import type { ScriptStatus } from "~/models/enums/ScriptStatus";

export interface ScriptsGroupedByStatusDTOJSON {
    status: string;
    scripts: ScriptJSON[];
}

export class ScriptsGroupedByStatusDTO {
    constructor(
        public readonly status: ScriptStatus,
        public readonly scripts: Script[],
    ) {}

    static fromJSON(json: ScriptsGroupedByStatusDTOJSON): ScriptsGroupedByStatusDTO {
        return new ScriptsGroupedByStatusDTO(
            json.status as ScriptStatus,
            json.scripts.map((s) => Script.fromJSON(s)),
        );
    }
}
