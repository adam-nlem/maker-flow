<?php

namespace App\Helper;

class CaptionHelper
{
    /**
     * Normalize a caption by stripping platform-specific formatting.
     * Removes hashtags, mentions, collapses whitespace, trims, and lowercases.
     */
    public static function normalize(string $caption): string
    {
        $normalized = preg_replace('/#\w+/u', '', $caption);
        $normalized = preg_replace('/@\w+/u', '', $normalized);
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return mb_strtolower(trim($normalized));
    }

    /**
     * Compute similarity between two captions.
     * Uses a two-pronged approach:
     * - Containment check: if the shorter caption is contained in the longer one (handles YT title inside IG caption)
     * - similar_text: standard string similarity percentage
     *
     * @return float|null 0.0-1.0 similarity score, or null if either caption is empty
     */
    public static function computeSimilarity(?string $captionA, ?string $captionB): ?float
    {
        if ($captionA === null || $captionB === null) {
            return null;
        }

        $normalizedA = self::normalize($captionA);
        $normalizedB = self::normalize($captionB);

        if ($normalizedA === '' || $normalizedB === '') {
            return null;
        }

        $shorter = mb_strlen($normalizedA) <= mb_strlen($normalizedB) ? $normalizedA : $normalizedB;
        $longer = $shorter === $normalizedA ? $normalizedB : $normalizedA;

        $containmentScore = 0.0;
        if (mb_strlen($shorter) >= 3 && str_contains($longer, $shorter)) {
            $containmentScore = 0.85;
        }

        $percent = 0.0;
        similar_text($normalizedA, $normalizedB, $percent);
        $similarTextScore = $percent / 100.0;

        return max($containmentScore, $similarTextScore);
    }
}
