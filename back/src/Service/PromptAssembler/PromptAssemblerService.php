<?php

namespace App\Service\PromptAssembler;

use App\Entity\CreatorProfile;
use App\Entity\Enum\CallToActionType;
use App\Entity\Enum\RetentionCueType;
use App\Entity\Enum\SkillModule;
use App\Entity\Enum\Tone;
use App\Entity\Enum\VideoDuration;
use App\Entity\ScriptGeneration;

class PromptAssemblerService
{
    public function assemble(?CreatorProfile $profile, ScriptGeneration $generation): string
    {
        $blocks = [];

        if ($profile !== null) {
            $blocks[] = $this->buildCreatorProfileBlock($profile);
        }

        $blocks[] = $this->buildScriptBriefBlock($generation);
        $blocks[] = $this->buildSkillModulesBlock($generation);
        $blocks[] = $this->buildFormattingInstructions($generation);
        $blocks[] = "Écris maintenant le script en français. N'ajoute pas de préambule — commence directement par le JSON.";

        return implode("\n\n", array_filter($blocks));
    }

    private function buildCreatorProfileBlock(CreatorProfile $profile): string
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

    private function buildScriptBriefBlock(ScriptGeneration $generation): string
    {
        $lines = [];
        $lines[] = "Sujet du script : {$generation->getTopic()}";
        $lines[] = "Objectif : {$generation->getGoal()->value}";

        if ($generation->getKeyPoints() !== null && $generation->getKeyPoints() !== '') {
            $lines[] = "Points clés à couvrir :\n{$generation->getKeyPoints()}";
        }

        $lines[] = "Style d'ouverture préféré : {$generation->getOpeningStyle()->value}";

        $durationLabel = match ($generation->getDuration()) {
            VideoDuration::ThirtySeconds => '30 secondes',
            VideoDuration::OneMinute => '1 minute',
            VideoDuration::OneMinuteThirty => '1 minute 30',
            VideoDuration::TwoMinutes => '2 minutes',
            VideoDuration::FiveToTenMinutes => '5 à 10 minutes',
            VideoDuration::TenToTwentyMinutes => '10 à 20 minutes',
            VideoDuration::TwentyPlusMinutes => 'plus de 20 minutes',
        };
        $lines[] = "Durée cible de la vidéo : {$durationLabel}. Adapte la longueur et le niveau de détail du script en conséquence.";

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
                SkillModule::StrongHook->value => $blocks[] = "Commence par une accroche exceptionnellement forte. Les 3 premières secondes doivent créer de la curiosité, de la tension ou une affirmation audacieuse qui rend l'arrêt coûteux. Utilise le type \"hook\" comme premier élément du tableau \"parts\".",
                SkillModule::RetentionBoosters->value => $blocks[] = $this->buildRetentionBoostersInstruction($skillInputs),
                SkillModule::StorytellingMode->value => $blocks[] = isset($skillInputs['story'])
                    ? "Ancre le script dans cette histoire : {$skillInputs['story']}. Tisse le contenu éducatif à travers elle plutôt que de le présenter sous forme de liste."
                    : null,
                SkillModule::SeoOptimization->value => $blocks[] = isset($skillInputs['keyword'])
                    ? "Mentionne naturellement \"{$skillInputs['keyword']}\" dans les 30 premières secondes et 2 à 3 fois de plus. Intègre-le de manière conversationnelle, sans bourrage de mots-clés."
                    : null,
                SkillModule::ScriptFormat->value => $blocks[] = isset($skillInputs['format'])
                    ? "Livre le script sous forme de {$skillInputs['format']}. Plan = points de discussion par section. Script complet = chaque mot tel qu'il serait prononcé. Hybride = titres de sections avec points de discussion détaillés."
                    : null,
                SkillModule::BRollCues->value => $blocks[] = "Ajoute des éléments de type \"shot\" dans le JSON tout au long du script là où des images pertinentes (B-roll) renforceraient le propos.",
                SkillModule::CallToAction->value => $blocks[] = $this->buildCallToActionInstruction($skillInputs, $generation->getCallToAction()),
                default => null,
            };
        }

        // Negative instructions for disabled skills
        $negativeInstructions = [];

        if (!in_array(SkillModule::StrongHook->value, $activeSkills, true)) {
            $negativeInstructions[] = "des éléments de type \"hook\"";
        }
        if (!in_array(SkillModule::RetentionBoosters->value, $activeSkills, true)) {
            $negativeInstructions[] = "des éléments de type \"retention_cue\"";
        }
        if (!in_array(SkillModule::BRollCues->value, $activeSkills, true)) {
            $negativeInstructions[] = "des éléments de type \"shot\"";
        }
        if (!in_array(SkillModule::CallToAction->value, $activeSkills, true)) {
            $negativeInstructions[] = "des éléments de type \"call_to_action\"";
        }

        if (count($negativeInstructions) > 0) {
            $list = implode(', ', $negativeInstructions);
            $blocks[] = "IMPORTANT : N'ajoute PAS les éléments suivants car ces modules sont désactivés : {$list}.";
        }

        return implode("\n\n", array_filter($blocks));
    }

    private function buildCallToActionInstruction(array $skillInputs, ?string $callToAction): string
    {
        $selectedType = CallToActionType::tryFrom($skillInputs[SkillModule::CallToAction->value] ?? '');

        if ($selectedType !== null) {
            if ($selectedType === CallToActionType::Custom && $callToAction !== null && $callToAction !== '') {
                return "Intègre un appel à l'action personnalisé dans le script : \"{$callToAction}\". Utilise le type \"call_to_action\" dans le JSON avec callToActionType \"custom\".";
            }

            $label = match ($selectedType) {
                CallToActionType::Subscribe => 's\'abonner',
                CallToActionType::Like => 'liker',
                CallToActionType::Comment => 'commenter',
                CallToActionType::Share => 'partager',
                CallToActionType::Link => 'cliquer sur un lien',
                CallToActionType::Custom => 'personnalisé',
            };

            return "Intègre un appel à l'action de type \"{$label}\" dans le script. Utilise le type \"call_to_action\" dans le JSON avec callToActionType \"{$selectedType->value}\".";
        }

        return "Intègre un ou plusieurs appels à l'action dans le script. Utilise le type \"call_to_action\" dans le JSON avec le callToActionType approprié (subscribe, like, comment, share, link, custom).";
    }

    private function buildRetentionBoostersInstruction(array $skillInputs): string
    {
        $selectedType = RetentionCueType::tryFrom($skillInputs[SkillModule::RetentionBoosters->value] ?? '');

        if ($selectedType !== null) {
            $label = match ($selectedType) {
                RetentionCueType::Question => 'question',
                RetentionCueType::Teaser => 'teaser',
                RetentionCueType::PatternBreak => 'rupture de pattern',
                RetentionCueType::Cliffhanger => 'cliffhanger',
            };

            return "Toutes les 60 à 90 secondes, place un moment de ré-engagement de type \"{$label}\". Utilise le type \"retention_cue\" dans le JSON avec retentionCueType \"{$selectedType->value}\".";
        }

        return "Toutes les 60 à 90 secondes, place un moment de ré-engagement : une rupture de pattern, un teaser, une question ou un cliffhanger. Utilise le type \"retention_cue\" dans le JSON avec le retentionCueType approprié (question, teaser, pattern_break, cliffhanger).";
    }

    private function buildFormattingInstructions(ScriptGeneration $generation): string
    {
        $activeSkills = $generation->getActiveSkills();
        $lines = [];
        $lines[] = 'Formate ta sortie UNIQUEMENT en JSON valide, sans blocs de code markdown ni texte autour. Utilise cette structure exacte :';
        $lines[] = '{';
        $lines[] = '  "parts": [';

        if (in_array(SkillModule::StrongHook->value, $activeSkills, true)) {
            $lines[] = '    { "type": "hook", "content": "Accroche du script" },';
        }

        $lines[] = '    { "type": "chapter", "title": "Titre du chapitre", "description": "Description optionnelle ou null" },';
        $lines[] = '    { "type": "voice_over", "content": "Contenu narré/parlé", "tone": "calm|dynamic|dramatic|neutral|casual_friendly|educational_authoritative|hype_energetic|funny_sarcastic|storytelling_emotional" },';

        if (in_array(SkillModule::BRollCues->value, $activeSkills, true)) {
            $lines[] = '    { "type": "shot", "content": "Description du plan B-roll" },';
        }

        if (in_array(SkillModule::CallToAction->value, $activeSkills, true)) {
            $lines[] = '    { "type": "call_to_action", "content": "Contenu du CTA", "callToActionType": "subscribe|like|comment|share|link|custom" },';
        }

        if (in_array(SkillModule::RetentionBoosters->value, $activeSkills, true)) {
            $lines[] = '    { "type": "retention_cue", "content": "Moment de ré-engagement", "retentionCueType": "question|teaser|pattern_break|cliffhanger" },';
        }

        $lines[] = '    { "type": "text", "content": "Tout autre contenu" }';
        $lines[] = '  ]';
        $lines[] = '}';
        $lines[] = 'L\'ordre des éléments dans le tableau "parts" définit l\'ordre du script. Chaque élément est indépendant, pas d\'imbrication.';

        return implode("\n", $lines);
    }
}
