import { ScriptPartType } from "./enums/ScriptPartType";
import { ScriptChapter, type ScriptChapterJSON } from "./ScriptChapter";
import { ScriptVoiceOver, type ScriptVoiceOverJSON } from "./ScriptVoiceOver";
import { ScriptDialogue, type ScriptDialogueJSON } from "./ScriptDialogue";
import { ScriptShot, type ScriptShotJSON } from "./ScriptShot";
import { ScriptText, type ScriptTextJSON } from "./ScriptText";
import { ScriptCallToAction, type ScriptCallToActionJSON } from "./ScriptCallToAction";
import { ScriptRetentionCue, type ScriptRetentionCueJSON } from "./ScriptRetentionCue";

export type ScriptPart = ScriptChapter | ScriptVoiceOver | ScriptDialogue | ScriptShot | ScriptText | ScriptCallToAction | ScriptRetentionCue;

export type ScriptPartJSON =
    | ScriptChapterJSON
    | ScriptVoiceOverJSON
    | ScriptDialogueJSON
    | ScriptShotJSON
    | ScriptTextJSON
    | ScriptCallToActionJSON
    | ScriptRetentionCueJSON;

export function scriptPartFromJSON(json: ScriptPartJSON): ScriptPart {
    switch (json.type) {
        case ScriptPartType.Chapter:
            return ScriptChapter.fromJSON(json);
        case ScriptPartType.VoiceOver:
            return ScriptVoiceOver.fromJSON(json);
        case ScriptPartType.Dialogue:
            return ScriptDialogue.fromJSON(json);
        case ScriptPartType.Shot:
            return ScriptShot.fromJSON(json);
        case ScriptPartType.Text:
            return ScriptText.fromJSON(json);
        case ScriptPartType.CallToAction:
            return ScriptCallToAction.fromJSON(json);
        case ScriptPartType.RetentionCue:
            return ScriptRetentionCue.fromJSON(json);
    }
}
