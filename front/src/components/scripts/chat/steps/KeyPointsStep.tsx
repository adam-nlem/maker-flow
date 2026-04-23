import { useState } from "react";
import { Button } from "~/components/ui/Button";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { TextArea } from "~/components/ui/TextArea";

interface KeyPointsStepProps {
    onSubmit: (keyPoints: string | null) => void;
}

export default function KeyPointsStep({ onSubmit }: KeyPointsStepProps) {
    const [text, setText] = useState("");

    return (
        <div className="flex flex-col gap-3">
            <p className="text-body-sm text-gray">Y a-t-il des points clés à aborder ? (optionnel)</p>

            <TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: Commencer par une statistique choc, mentionner le produit X..."
                textStyle="text-body-xs"
            />

            <div className="flex flex-row items-center gap-3">
                <Button onClick={() => onSubmit(text.trim() || null)} width="w-fit">
                    Valider
                </Button>
                <SimpleTextButton onClick={() => onSubmit(null)} color="text-primary" hoverColor="hover:text-primary">
                    Passer
                </SimpleTextButton>
            </div>
        </div>
    );
}
