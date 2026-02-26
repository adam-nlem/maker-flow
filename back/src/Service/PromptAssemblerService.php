<?php

namespace App\Service;

use App\Entity\CreatorProfile;
use App\Entity\Enum\SkillModule;
use App\Entity\Enum\Tone;
use App\Entity\ScriptGeneration;

class PromptAssemblerService
{
    public function assemble(?CreatorProfile $profile, ScriptGeneration $generation): string
    {
        $blocks = [];

        if ($profile !== null) {
            $blocks[] = $this->buildCreatorProfileBlock($profile);

            if ($profile->getStyleSample() !== null && $profile->getStyleSample() !== '') {
                $blocks[] = $this->buildStyleSampleBlock($profile);
            }
        }

        $blocks[] = $this->buildScriptBriefBlock($generation);
        $blocks[] = $this->buildSkillModulesBlock($generation);
        $blocks[] = $this->buildFormattingInstructions();
        $blocks[] = "Écris maintenant le script en français. N'ajoute pas de titre ni de préambule — commence directement par la première ligne du script.";

        return implode("\n\n", array_filter($blocks));
    }

    private function buildCreatorProfileBlock(CreatorProfile $profile): string
    {
        $lines = [];

        if ($profile->getPlatforms() !== null && count($profile->getPlatforms()) > 0) {
            $platformsList = implode(', ', $profile->getPlatforms());
            $lines[] = "Le créateur publie sur {$platformsList}.";
        }

        if ($profile->getContentType() !== null) {
            $lines[] = "Type de contenu : {$profile->getContentType()->value}.";
        }

        if ($profile->getNiche() !== null && $profile->getNiche() !== '') {
            $lines[] = "Sa niche est {$profile->getNiche()}.";
        }

        if ($profile->getTargetAudience() !== null && $profile->getTargetAudience() !== '') {
            $lines[] = "Son audience cible est : {$profile->getTargetAudience()}.";
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

    private function buildStyleSampleBlock(CreatorProfile $profile): string
    {
        return "Référence de style (reproduis la structure, l'énergie et le vocabulaire — ne copie pas) :\n{$profile->getStyleSample()}";
    }

    private function buildScriptBriefBlock(ScriptGeneration $generation): string
    {
        $lines = [];
        $lines[] = "Sujet du script : {$generation->getTopic()}";
        $lines[] = "Objectif : {$generation->getGoal()->value}";

        if ($generation->getKeyPoints() !== null && $generation->getKeyPoints() !== '') {
            $lines[] = "Points clés à couvrir :\n{$generation->getKeyPoints()}";
        }

        $lines[] = "Style d'ouverture préféré : {$generation->getOpeningStyle()->value}";

        if ($generation->getCallToAction() !== null && $generation->getCallToAction() !== '') {
            $lines[] = "Appel à l'action : {$generation->getCallToAction()}";
        }

        if ($generation->getExtraContext() !== null && $generation->getExtraContext() !== '') {
            $lines[] = "Contexte supplémentaire : {$generation->getExtraContext()}";
        }

        return implode("\n", $lines);
    }

    private function buildSkillModulesBlock(ScriptGeneration $generation): string
    {
        $activeSkills = $generation->getActiveSkills();
        $skillInputs = $generation->getSkillInputs();
        $blocks = [];

        foreach ($activeSkills as $skill) {
            match ($skill) {
                SkillModule::StrongHook->value => $blocks[] = "Commence par une accroche exceptionnellement forte. Les 3 premières secondes doivent créer de la curiosité, de la tension ou une affirmation audacieuse qui rend l'arrêt coûteux.",
                SkillModule::RetentionBoosters->value => $blocks[] = "Toutes les 60 à 90 secondes, place un moment de ré-engagement : une rupture de pattern, un teaser ou une question. Marque-les [RETENTION CUE] dans le script.",
                SkillModule::StorytellingMode->value => $blocks[] = isset($skillInputs['story'])
                    ? "Ancre le script dans cette histoire : {$skillInputs['story']}. Tisse le contenu éducatif à travers elle plutôt que de le présenter sous forme de liste."
                    : null,
                SkillModule::SeoOptimization->value => $blocks[] = isset($skillInputs['keyword'])
                    ? "Mentionne naturellement \"{$skillInputs['keyword']}\" dans les 30 premières secondes et 2 à 3 fois de plus. Intègre-le de manière conversationnelle, sans bourrage de mots-clés."
                    : null,
                SkillModule::ScriptFormat->value => $blocks[] = isset($skillInputs['format'])
                    ? "Livre le script sous forme de {$skillInputs['format']}. Plan = points de discussion par section. Script complet = chaque mot tel qu'il serait prononcé. Hybride = titres de sections avec points de discussion détaillés."
                    : null,
                SkillModule::BRollCues->value => $blocks[] = "Ajoute des indications [B-ROLL: description] tout au long du script là où des images pertinentes renforceraient le propos.",
                default => null,
            };
        }

        return implode("\n\n", array_filter($blocks));
    }

    private function buildFormattingInstructions(): string
    {
        return <<<EOT
Formate ta sortie en utilisant ces marqueurs :
- Entoure chaque section principale avec [CHAPTER]Titre[/CHAPTER] suivi du contenu de la section
- Entoure le contenu parlé/narré avec [VOICE_OVER]...[/VOICE_OVER]
- Marque les suggestions de B-roll avec [B-ROLL: description]
- Tout autre contenu sera traité comme des blocs de texte brut
EOT;
    }
}
