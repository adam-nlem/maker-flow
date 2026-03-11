import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";
import { Platform, platformOptions } from "~/models/enums/Platform";
import { ContentType, contentTypeOptions, contentTypeToFrenchTranslation } from "~/models/enums/ContentType";
import { Tone, toneOptions, toneToFrenchTranslation } from "~/models/enums/Tone";
import { useCreateOrUpdateCreatorProfile } from "~/hooks/api/creatorProfiles/useCreateOrUpdateCreatorProfile";
import type { CreatorProfile } from "~/models/CreatorProfile";
import Pill from "~/components/ui/Pill";
import PlatformPill from "~/components/ui/PlatformPill";

interface CreatorProfileFormProps {
    projectUuid: string;
    creatorProfile: CreatorProfile | null;
    onSuccess: () => void;
    variant?: 'settings' | 'onboarding';
}

export default function CreatorProfileForm({ projectUuid, creatorProfile, onSuccess, variant = 'settings' }: CreatorProfileFormProps) {
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

    const isOnboarding = variant === 'onboarding';

    const hasChanges =
        JSON.stringify(platforms) !== JSON.stringify(creatorProfile?.platforms ?? []) ||
        contentType !== creatorProfile?.contentType ||
        niche !== (creatorProfile?.niche ?? "") ||
        targetAudience !== (creatorProfile?.targetAudience ?? "") ||
        JSON.stringify(tones) !== JSON.stringify(creatorProfile?.tones ?? []) ||
        JSON.stringify(signaturePhrases) !== JSON.stringify(creatorProfile?.signaturePhrases ?? []) ||
        JSON.stringify(neverList) !== JSON.stringify(creatorProfile?.neverList ?? []) ||
        styleSample !== (creatorProfile?.styleSample ?? "");

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
            signaturePhrases: isOnboarding ? [] : signaturePhrases,
            neverList: isOnboarding ? [] : neverList,
            styleSample: styleSample.trim() || undefined,
        });
        onSuccess();
    };

    const formContainerClassName = isOnboarding
        ? "flex flex-col gap-5"
        : "flex-1 flex flex-col min-h-0";

    const fieldsContainerClassName = isOnboarding
        ? ""
        : "flex-1 overflow-y-auto scrollbar-none px-6 py-5";

    return (
        <form className={formContainerClassName} onSubmit={handleSubmit}>
            <div className={fieldsContainerClassName}>
                <div className="flex flex-col gap-5">
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
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
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
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
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

            {!isOnboarding && (
            <div>
                <h3 className="text-heading-sm">Phrases signatures</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {signaturePhrases.map((phrase, index) => (
                        <Pill label={phrase} isSelected suffixIcon={XMarkIcon} onSuffixClick={() => handleRemovePhrase(index)} borderColorClassName="border border-primary/30" bgColorClassName="bg-primary/10" />
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
            )}

            {!isOnboarding && (
            <div>
                <h3 className="text-heading-sm">Ne jamais utiliser</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {neverList.map((phrase, index) => (
                        <Pill label={phrase} isSelected suffixIcon={XMarkIcon} onSuffixClick={() => handleRemoveNeverItem(index)} borderColorClassName="border border-red/30" bgColorClassName="bg-red/10" />
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
            )}

            <TextArea
                label="Échantillon de style"
                placeholder="Collez un extrait de votre contenu existant pour que l'IA s'inspire de votre style..."
                value={styleSample}
                onChange={(e) => setStyleSample(e.target.value)}
                fullWidth
            />
                </div>
            </div>

            {isOnboarding ? (
                <Button
                    type="submit"
                    style="primary"
                    isLoading={isPending}
                    disabled={isPending}
                >
                    Continuer
                </Button>
            ) : (
                hasChanges && (
                    <div className="px-6 py-4 border-t border-light-gray">
                        <Button
                            type="submit"
                            style="primary"
                            isLoading={isPending}
                            disabled={isPending}
                        >
                            <p className="text-sm">{creatorProfile ? "Mettre à jour le profil" : "Créer le profil"}</p>
                        </Button>
                    </div>
                )
            )}
        </form>
    );
}
