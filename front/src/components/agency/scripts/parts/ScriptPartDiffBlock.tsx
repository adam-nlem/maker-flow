import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { ScriptPartSuggestion } from "~/models/ScriptPartSuggestion";
import {
  ScriptPartSuggestionAction,
  scriptPartSuggestionActionTranslationKeys,
  scriptPartSuggestionActionToIcon,
} from "~/models/enums/ScriptPartSuggestionAction";
import { useAcceptScriptPartSuggestion } from "~/hooks/api/scriptPartSuggestions/useAcceptScriptPartSuggestion";
import { useRejectScriptPartSuggestion } from "~/hooks/api/scriptPartSuggestions/useRejectScriptPartSuggestion";
import Pill from "~/components/ui/Pill";

interface ScriptPartDiffBlockProps {
  suggestion: ScriptPartSuggestion;
  scriptUuid: string;
  chatUuid?: string;
}

export default function ScriptPartDiffBlock({ suggestion, scriptUuid, chatUuid }: ScriptPartDiffBlockProps) {
  const { t } = useTranslation();
  const { acceptScriptPartSuggestion } = useAcceptScriptPartSuggestion();
  const { rejectScriptPartSuggestion } = useRejectScriptPartSuggestion();

  const Icon = scriptPartSuggestionActionToIcon[suggestion.action];
  const label = t(scriptPartSuggestionActionTranslationKeys[suggestion.action]);

  const handleAccept = () => {
    acceptScriptPartSuggestion({ suggestionUuid: suggestion.uuid, scriptUuid, chatUuid });
  };

  const handleReject = () => {
    rejectScriptPartSuggestion({ suggestionUuid: suggestion.uuid, scriptUuid, chatUuid });
  };

  return (
    <div className="border border-primary/40 rounded-xl overflow-hidden bg-primary/5">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/30 bg-primary/10">
        <Icon className="size-4 text-primary" strokeWidth={2} />
        <span className="text-body-xs text-primary font-medium">{label}</span>
        <div className="flex-1" />
        <Pill icon={XMarkIcon} label={t("scripts:parts.diff.reject")} isSelected onClick={handleReject} textColorClassName="text-red" bgColorClassName="bg-red/10" borderColorClassName="border border-red/30" />
        <Pill icon={CheckIcon} label={t("scripts:parts.diff.accept")} isSelected onClick={handleAccept} textColorClassName="text-primary" bgColorClassName="bg-primary/10" borderColorClassName="border border-primary/30" />
      </div>
      <div className="p-3 text-body-sm whitespace-pre-wrap">
        {renderBody(suggestion, t)}
      </div>
    </div>
  );
}

function renderBody(suggestion: ScriptPartSuggestion, t: (key: string, options?: Record<string, unknown>) => string) {
  switch (suggestion.action) {
    case ScriptPartSuggestionAction.Rewrite:
      return (
        <>
          {suggestion.originalContent !== null && (
            <div className="bg-danger/10 text-danger line-through px-2 py-1 rounded mb-2">
              {suggestion.originalContent}
            </div>
          )}
          {suggestion.proposedContent !== null && (
            <div className="bg-primary/10 text-primary px-2 py-1 rounded">
              {suggestion.proposedContent}
            </div>
          )}
        </>
      );
    case ScriptPartSuggestionAction.Delete:
      return (
        <div className="bg-danger/10 text-danger line-through px-2 py-1 rounded">
          {suggestion.originalContent}
        </div>
      );
    case ScriptPartSuggestionAction.Reorder:
      return (
        <div className="text-muted-2 text-body-xs">
          {t("scripts:parts.diff.reorderDescription", { position: suggestion.proposedPosition })}
        </div>
      );
    case ScriptPartSuggestionAction.Insert:
      return (
        <div className="bg-primary/10 text-primary px-2 py-1 rounded">
          {suggestion.proposedContent}
        </div>
      );
  }
}
