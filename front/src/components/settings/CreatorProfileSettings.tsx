import { useShowCreatorProfile } from "~/hooks/api/creatorProfiles/useShowCreatorProfile";
import CreatorProfileForm from "~/components/scripts/creatorProfile/CreatorProfileForm";
import Shimmer from "~/components/ui/Shimmer";
import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";

interface CreatorProfileSettingsProps {
    projectUuid: string;
}

export default function CreatorProfileSettings({ projectUuid }: CreatorProfileSettingsProps) {
    const { creatorProfile, isLoading } = useShowCreatorProfile({ projectUuid });

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-light-gray flex flex-col gap-1">
                <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.CreatorProfile]}</h2>
                <p className="text-body-sm text-gray">
                    Configurez votre profil pour que l'IA génère du contenu adapté à votre style et votre audience.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-5 px-4 md:px-6 py-4 md:py-5">
                    <Shimmer height="h-10" />
                    <Shimmer height="h-10" />
                    <div>
                        <Shimmer width="w-16" height="h-4" />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Shimmer key={i} width="w-24" height="h-8" radius="rounded-full" />
                            ))}
                        </div>
                    </div>
                    <Shimmer height="h-10" />
                    <Shimmer height="h-10" />
                    <Shimmer height="h-24" />
                    <Shimmer width="w-48" height="h-10" radius="rounded-xl" />
                </div>
            ) : (
                <CreatorProfileForm
                    projectUuid={projectUuid}
                    creatorProfile={creatorProfile}
                    onSuccess={() => { }}
                />
            )}
        </div>
    );
}
