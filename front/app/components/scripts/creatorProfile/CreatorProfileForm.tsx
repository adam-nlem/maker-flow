import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";
import { Platform, platformOptions, platformToFrenchTranslation } from "~/models/enums/Platform";
import { useShowPlatformIcon } from "~/hooks/api/integrations/useShowPlatformIcon";
import { ContentType, contentTypeOptions, contentTypeToFrenchTranslation } from "~/models/enums/ContentType";
import { Tone, toneOptions, toneToFrenchTranslation } from "~/models/enums/Tone";
import { useCreateOrUpdateCreatorProfile } from "~/hooks/api/creatorProfiles/useCreateOrUpdateCreatorProfile";
import type { CreatorProfile } from "~/models/CreatorProfile";
import Pill from "~/components/ui/Pill";

function PlatformPill({ platform, isSelected, onToggle }: { platform: Platform; isSelected: boolean; onToggle: () => void }) {
    const { iconUrl } = useShowPlatformIcon(platform);
    if (!iconUrl) return null;
    return (
        <Pill
            imageUrl={iconUrl}
            label={platformToFrenchTranslation[platform]}
            isSelected={isSelected}
            onClick={onToggle}
            borderColorClassName="border-light-gray"
        />
    );
}

interface CreatorProfileFormProps {
    projectUuid: string;
    creatorProfile: CreatorProfile | null;
    onSuccess: () => void;
}

export default function CreatorProfileForm({ projectUuid, creatorProfile, onSuccess }: CreatorProfileFormProps) {
    const [platforms, setPlatforms] = useState<Platform[]>(creatorProfile?.platforms ?? []);
    const [contentType, setContentType] = useState<ContentType | undefined>(creatorProfile?.contentType);
    const [niche, setNiche] = useState(creatorProfile?.niche ?? "");
    const [targetAudience, setTargetAudience] = useState(creatorProfile?.targetAudience ?? "");
    const [tones, setTones] = useState<Tone[]>(creatorProfile?.tones ?? []);
    const [signaturePhrases, setSignaturePhrases] = useState<string[]>(creatorProfile?.signaturePhrases ?? []);
    const [neverList, setNeverList] = useState<string[]>(creatorProfile?.neverList ?? []);
    const [styleSample, setStyleSample] = useState(creatorProfile?.styleSample ?? "");

    const [newPhrase, setNewPhrase] = useState("");
    const [newNeverItem, setNewNeverItem] = useState("");

    const { createOrUpdateCreatorProfile, isPending } = useCreateOrUpdateCreatorProfile();

    const handleAddPhrase = () => {
        if (newPhrase.trim()) {
            setSignaturePhrases([...signaturePhrases, newPhrase.trim()]);
            setNewPhrase("");
        }
    };

    const handleRemovePhrase = (index: number) => {
        setSignaturePhrases(signaturePhrases.filter((_, i) => i !== index));
    };

    const handleAddNeverItem = () => {
        if (newNeverItem.trim()) {
            setNeverList([...neverList, newNeverItem.trim()]);
            setNewNeverItem("");
        }
    };

    const handleRemoveNeverItem = (index: number) => {
        setNeverList(neverList.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createOrUpdateCreatorProfile({
            projectUuid,
            platforms,
            contentType,
            niche: niche.trim() || undefined,
            targetAudience: targetAudience.trim() || undefined,
            tones,
            signaturePhrases,
            neverList,
            styleSample: styleSample.trim() || undefined,
        });
        onSuccess();
    };

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
                <h3 className="text-heading-sm">Plateformes</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {platformOptions.map((p) => (
                        <PlatformPill
                            key={p}
                            platform={p}
                            isSelected={platforms.includes(p)}
                            onToggle={() =>
                                setPlatforms((prev) =>
                                    prev.includes(p)
                                        ? prev.filter((platform) => platform !== p)
                                        : [...prev, p]
                                )
                            }
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-heading-sm">Type de contenu</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {contentTypeOptions.map((ct) => (
                        <Pill
                            key={ct}
                            label={contentTypeToFrenchTranslation[ct]}
                            isSelected={contentType === ct}
                            bgColorClassName="bg-primary/30"
                            borderColorClassName="border border-light-gray"
                            onClick={() => setContentType(contentType === ct ? undefined : ct)}
                        />
                    ))}
                </div>
            </div>

            <Input
                label="Niche"
                placeholder="Ex: Fitness, Cuisine, Tech..."
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                fullWidth
            />

            <Input
                label="Audience cible"
                placeholder="Ex: Hommes 25-35 intéressés par la musculation"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                fullWidth
            />

            <div>
                <h3 className="text-heading-sm">Tons</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {toneOptions.map((t) => (
                        <Pill
                            key={t}
                            label={toneToFrenchTranslation[t]}
                            isSelected={tones.includes(t)}
                            bgColorClassName="bg-primary/30"
                            borderColorClassName="border border-light-gray"
                            onClick={() =>
                                setTones((prev) =>
                                    prev.includes(t)
                                        ? prev.filter((tone) => tone !== t)
                                        : [...prev, t]
                                )
                            }
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-heading-sm">Phrases signatures</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {signaturePhrases.map((phrase, index) => (
                        <span
                            key={index}
                            className="flex flex-row items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-heading-xs"
                        >
                            {phrase}
                            <XMarkIcon
                                className="size-3 cursor-pointer hover:text-danger transition-colors"
                                strokeWidth={2}
                                onClick={() => handleRemovePhrase(index)}
                            />
                        </span>
                    ))}
                </div>
                <div className="flex flex-row gap-2 mt-2">
                    <Input
                        placeholder="Ajouter une phrase signature..."
                        value={newPhrase}
                        onChange={(e) => setNewPhrase(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddPhrase();
                            }
                        }}
                        fullWidth
                    />
                    <button
                        type="button"
                        onClick={handleAddPhrase}
                        className="shrink-0 size-9 flex items-center justify-center rounded-xl border border-light-gray hover:bg-light-gray/30 transition-colors cursor-pointer"
                    >
                        <PlusIcon className="size-4 text-gray" strokeWidth={2} />
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-heading-sm">Ne jamais utiliser</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {neverList.map((item, index) => (
                        <span
                            key={index}
                            className="flex flex-row items-center gap-1 px-3 py-1 rounded-full bg-danger/10 text-heading-xs"
                        >
                            {item}
                            <XMarkIcon
                                className="size-3 cursor-pointer hover:text-danger transition-colors"
                                strokeWidth={2}
                                onClick={() => handleRemoveNeverItem(index)}
                            />
                        </span>
                    ))}
                </div>
                <div className="flex flex-row gap-2 mt-2">
                    <Input
                        placeholder="Ajouter un mot ou expression à éviter..."
                        value={newNeverItem}
                        onChange={(e) => setNewNeverItem(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNeverItem();
                            }
                        }}
                        fullWidth
                    />
                    <button
                        type="button"
                        onClick={handleAddNeverItem}
                        className="shrink-0 size-9 flex items-center justify-center rounded-xl border border-light-gray hover:bg-light-gray/30 transition-colors cursor-pointer"
                    >
                        <PlusIcon className="size-4 text-gray" strokeWidth={2} />
                    </button>
                </div>
            </div>

            <TextArea
                label="Échantillon de style"
                placeholder="Collez un extrait de votre contenu existant pour que l'IA s'inspire de votre style..."
                value={styleSample}
                onChange={(e) => setStyleSample(e.target.value)}
                fullWidth
            />

            <Button
                type="submit"
                style="primary"
                isLoading={isPending}
                disabled={isPending}
                className="mt-2"
            >
                <p className="text-sm">{creatorProfile ? "Mettre à jour le profil" : "Créer le profil"}</p>
            </Button>
        </form>
    );
}
