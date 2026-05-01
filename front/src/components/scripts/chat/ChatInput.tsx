import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { AiModel, aiModelOptions, aiModelToBgClass, aiModelToBorderClass, aiModelTranslationKeys, aiModelToIcon, aiModelToTextClass } from "~/models/enums/AiModel";
import SelectDropdown from "~/components/ui/SelectDropdown";
import Pill from "~/components/ui/Pill";

interface ChatInputProps {
  onSend: (content: string, aiModel: AiModel) => void;
  isPending: boolean;
  lockedAiModel?: AiModel;
  placeholder?: string;
}

export default function ChatInput({ onSend, isPending, lockedAiModel, placeholder }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [selectedAiModel, setSelectedAiModel] = useState<AiModel>(AiModel.Claude);

  const aiModel = lockedAiModel ?? selectedAiModel;
  const canSend = text.trim().length > 0 && !isPending;
  const resolvedPlaceholder = placeholder ?? t("scripts:chat.input.placeholder");

  const handleSubmit = () => {
    if (!canSend) return;
    onSend(text.trim(), aiModel);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 border border-light-gray rounded-lg p-3 bg-clear">
      <TextArea
        simple
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={resolvedPlaceholder}
        textStyle="text-sm"
      />
      <div className="flex flex-row w-full justify-between">
        <div className="flex flex-col gap-1">
          <SimpleTextButton hoverColor="text-primary">
            <PaperClipIcon className="size-3" />
            <p>{t("scripts:chat.input.attachScript")}</p>
          </SimpleTextButton>
          {lockedAiModel ? (
            <Pill
              isSelected
              imageUrl={aiModelToIcon[aiModel]}
              label={t(aiModelTranslationKeys[aiModel])}
              bgColorClassName={aiModelToBgClass[aiModel]}
              borderColorClassName={aiModelToBorderClass[aiModel]}
              textColorClassName={aiModelToTextClass[aiModel]}
            />
          ) : (
            <SelectDropdown
              items={aiModelOptions}
              selectedItemId={aiModel}
              getItemId={(s) => s}
              onSelect={(item) => setSelectedAiModel(item)}
              renderTrigger={({ onClick }) => (
                <Pill
                  onClick={onClick}
                  isSelected
                  imageUrl={aiModelToIcon[aiModel]}
                  label={t(aiModelTranslationKeys[aiModel])}
                  bgColorClassName={aiModelToBgClass[aiModel]}
                  borderColorClassName={aiModelToBorderClass[aiModel]}
                  textColorClassName={aiModelToTextClass[aiModel]} />)
              }
              renderItem={({ item, isSelected, onSelect }) => {
                return !isSelected ? <Pill
                  imageUrl={aiModelToIcon[item]}
                  label={t(aiModelTranslationKeys[item])}
                  bgColorClassName={aiModelToBgClass[item]}
                  borderColorClassName={aiModelToBorderClass[item]}
                  textColorClassName={aiModelToTextClass[item]}
                  isSelected
                  onClick={onSelect}
                /> : null
              }}
            />
          )}
        </div>
        <Button width="w-min" style={canSend ? "primary" : "secondary"} onClick={handleSubmit} className="flex flex-row gap-3">
          <p>{t("scripts:chat.input.send")}</p>
          <PaperAirplaneIcon className={`size-4`} />
        </Button>
      </div>
    </div>
  );
}
