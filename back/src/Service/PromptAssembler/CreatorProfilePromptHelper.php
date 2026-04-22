<?php

namespace App\Service\PromptAssembler;

use App\Entity\CreatorProfile;
use App\Entity\Enum\Tone;

class CreatorProfilePromptHelper
{
    public static function buildBlock(CreatorProfile $profile): string
    {
        $lines = [];

        if ($profile->getNiche() !== null && $profile->getNiche() !== '') {
            $lines[] = "Sa niche est {$profile->getNiche()}.";
        }

        if ($profile->getTones() !== null && count($profile->getTones()) > 0) {
            $toneLabels = array_map(fn(string $tone) => match ($tone) {
                Tone::Calm->value => 'calme',
                Tone::Dynamic->value => 'dynamique',
                Tone::Dramatic->value => 'dramatique',
                Tone::Neutral->value => 'neutre',
                Tone::CasualFriendly->value => 'décontracté et amical',
                Tone::EducationalAuthoritative->value => 'éducatif et autoritaire',
                Tone::HypeEnergetic->value => 'hype et énergique',
                Tone::FunnySarcastic->value => 'drôle et sarcastique',
                Tone::StorytellingEmotional->value => 'narratif et émotionnel',
                default => $tone,
            }, $profile->getTones());
            $toneList = implode(', ', $toneLabels);
            $lines[] = "Ton du script : {$toneList}. Adopte ce ton tout au long du script dans le choix des mots, le rythme et l'énergie.";
        }

        if ($profile->getSignaturePhrases() !== null && count($profile->getSignaturePhrases()) > 0) {
            $phrases = implode(', ', $profile->getSignaturePhrases());
            $lines[] = "Il utilise fréquemment des expressions comme : {$phrases} — intègre-les naturellement.";
        }

        if ($profile->getNeverList() !== null && count($profile->getNeverList()) > 0) {
            $neverItems = implode(', ', $profile->getNeverList());
            $lines[] = "Il n'utilise jamais les éléments suivants : {$neverItems} — évite-les complètement.";
        }

        return implode("\n", $lines);
    }
}
