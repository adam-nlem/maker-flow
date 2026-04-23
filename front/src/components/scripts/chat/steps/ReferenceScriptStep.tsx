import { Button } from "~/components/ui/Button";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";
import { formatToFrenchRelative } from "~/utils/dateFormatters";

interface ReferenceScriptStepProps {
    projectUuid: string;
    onSelect: (scriptUuid: string | null) => void;
}

export default function ReferenceScriptStep({ projectUuid, onSelect }: ReferenceScriptStepProps) {
    const { scripts, isLoading } = useListPaginatedScripts({ projectUuid });

    return (
        <div className="flex flex-col gap-3">
            <p className="text-body-sm text-gray">Souhaitez-vous utiliser un script existant comme référence ? (optionnel)</p>

            {isLoading ? (
                <p className="text-body-xs text-gray">Chargement...</p>
            ) : scripts.length === 0 ? (
                <p className="text-body-xs text-gray">Aucun script disponible.</p>
            ) : (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto scrollbar-none">
                    {scripts.map((script) => (
                        <Button
                            key={script.uuid}
                            style="outline"
                            width="w-full"
                            height="h-auto"
                            className="justify-start text-left"
                            onClick={() => onSelect(script.uuid)}
                        >
                            <div>
                                <p className="text-body-sm">{script.title || "Sans titre"}</p>
                                <p className="text-body-xs text-gray">{formatToFrenchRelative(script.createdAt)}</p>
                            </div>
                        </Button>
                    ))}
                </div>
            )}

            <SimpleTextButton onClick={() => onSelect(null)} color="text-primary" hoverColor="hover:text-primary">
                Passer
            </SimpleTextButton>
        </div>
    );
}
