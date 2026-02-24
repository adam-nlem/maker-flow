import { Script, type ScriptJSON } from "../Script";

export interface ListScriptsGroupedByDayDTOJSON {
    date: string;
    scripts: ScriptJSON[];
}

export class ListScriptsGroupedByDayDTO {
    constructor(
        public readonly date: string,
        public readonly scripts: Script[],
    ) {}

    static fromJSON(json: ListScriptsGroupedByDayDTOJSON): ListScriptsGroupedByDayDTO {
        return new ListScriptsGroupedByDayDTO(
            json.date,
            json.scripts.map((s) => Script.fromJSON(s)),
        );
    }
}
