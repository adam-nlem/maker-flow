import { useState } from "react";
import { UsersIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useListTargetAudiences } from "~/hooks/api/targetAudiences/useListTargetAudiences";
import { useCreateTargetAudience } from "~/hooks/api/targetAudiences/useCreateTargetAudience";
import type { TargetAudience } from "~/models/TargetAudience";

interface TargetAudienceStepProps {
    projectUuid: string;
    onSelect: (audienceUuid: string, audienceName: string) => void;
}

export default function TargetAudienceStep({ projectUuid, onSelect }: TargetAudienceStepProps) {
    const { targetAudiences } = useListTargetAudiences({ projectUuid });
    const { createTargetAudience, isPending: isCreating } = useCreateTargetAudience();
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newName, setNewName] = useState("");

    const handleCreate = async () => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        const audience = await createTargetAudience({ projectUuid, name: trimmed });
        setNewName("");
        setIsAddingNew(false);
        onSelect(audience.uuid, audience.name);
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-body-sm text-gray">Quelle est votre audience cible ?</p>

            <SelectDropdown<TargetAudience>
                items={targetAudiences}
                getItemId={(a) => a.uuid}
                onSelect={(audience) => onSelect(audience.uuid, audience.name)}
                onClickCreateButton={() => setIsAddingNew(true)}
                createButtonLabel="Ajouter une audience"
                renderTrigger={({ onClick }) => (
                    <Pill
                        icon={UsersIcon}
                        label="Choisir une audience"
                        onClick={onClick}
                    />
                )}
                renderItem={({ item, onSelect: handleSelect }) => (
                    <Pill label={item.name} onClick={handleSelect} />
                )}
            />

            {isAddingNew && (
                <div className="flex flex-row items-end gap-2">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nom de l'audience..."
                        textStyle="text-body-xs"
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
                    />
                    <Button
                        onClick={handleCreate}
                        isLoading={isCreating}
                        disabled={!newName.trim() || isCreating}
                        width="w-fit"
                        style="primary"
                    >
                        Ajouter
                    </Button>
                </div>
            )}
        </div>
    );
}
