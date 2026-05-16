import { useListScriptPartSuggestions } from "~/hooks/api/scriptPartSuggestions/useListScriptPartSuggestions";
import { ScriptPartSuggestionStatus } from "~/models/enums/ScriptPartSuggestionStatus";
import ScriptPartDiffBlock from "~/components/agency/scripts/parts/ScriptPartDiffBlock";

interface ChatSuggestionsCardProps {
  suggestionUuids: string[];
  scriptUuid: string;
  chatUuid: string;
}

export default function ChatSuggestionsCard({ suggestionUuids, scriptUuid, chatUuid }: ChatSuggestionsCardProps) {
  const { suggestions } = useListScriptPartSuggestions({
    scriptUuid,
    status: ScriptPartSuggestionStatus.Pending,
  });

  const messageSuggestions = suggestions.filter((s) => suggestionUuids.includes(s.uuid));
  if (messageSuggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {messageSuggestions.map((suggestion) => (
        <ScriptPartDiffBlock
          key={suggestion.uuid}
          suggestion={suggestion}
          scriptUuid={scriptUuid}
          chatUuid={chatUuid}
        />
      ))}
    </div>
  );
}
