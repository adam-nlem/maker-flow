import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { CircularButton } from "~/components/ui/CircularButton";
import { TextArea } from "~/components/ui/TextArea";

interface ChatInputProps {
    onSend: (content: string) => void;
    isPending: boolean;
    placeholder?: string;
}

export default function ChatInput({ onSend, isPending, placeholder = "Envoyer un message..." }: ChatInputProps) {
    const [text, setText] = useState("");

    const canSend = text.trim().length > 0 && !isPending;

    const handleSubmit = () => {
        if (!canSend) return;
        onSend(text.trim());
        setText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-row items-end gap-2">
            <TextArea
                simple
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                textStyle="text-sm"
            />
            <CircularButton onClick={handleSubmit}>
                <PaperAirplaneIcon className={`size-4 ${canSend ? "text-clear" : "text-clear/50"}`} />
            </CircularButton>
        </div>
    );
}
