import { ScriptChapter, type ScriptChapterJSON } from "./ScriptChapter";
import { ScriptVoiceOver, type ScriptVoiceOverJSON } from "./ScriptVoiceOver";
import { ScriptDialogue, type ScriptDialogueJSON } from "./ScriptDialogue";
import { ScriptShot, type ScriptShotJSON } from "./ScriptShot";
import { ScriptText, type ScriptTextJSON } from "./ScriptText";

export type ScriptPart = ScriptChapter | ScriptVoiceOver | ScriptDialogue | ScriptShot | ScriptText;

export type ScriptPartJSON =
    | ScriptChapterJSON
    | ScriptVoiceOverJSON
    | ScriptDialogueJSON
    | ScriptShotJSON
    | ScriptTextJSON;

export function scriptPartFromJSON(json: ScriptPartJSON): ScriptPart {
    switch (json.type) {
        case 'chapter':
            return ScriptChapter.fromJSON(json);
        case 'voice_over':
            return ScriptVoiceOver.fromJSON(json);
        case 'dialogue':
            return ScriptDialogue.fromJSON(json);
        case 'shot':
            return ScriptShot.fromJSON(json);
        case 'text':
            return ScriptText.fromJSON(json);
    }
}
