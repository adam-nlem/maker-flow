<?php

namespace App\Helper;

use Jenssegers\ImageHash\ImageHash;
use Jenssegers\ImageHash\Implementations\DifferenceHash;

class ThumbnailHashHelper
{
    private const MAX_HASH_BITS = 64;

    /**
     * Compute visual similarity between two image files using perceptual hashing (dHash).
     * Uses the Difference Hash algorithm which compares adjacent pixel brightness gradients,
     * making it resilient to scaling, compression, and minor color changes.
     *
     * @return float|null 0.0-1.0 similarity score, or null if either image cannot be loaded
     */
    public static function computeSimilarity(string $filePathA, string $filePathB): ?float
    {
        if (!file_exists($filePathA) || !file_exists($filePathB)) {
            return null;
        }

        try {
            $hasher = new ImageHash(new DifferenceHash());
            $hashA = $hasher->hash($filePathA);
            $hashB = $hasher->hash($filePathB);

            $distance = $hashA->distance($hashB);

            return 1.0 - ($distance / self::MAX_HASH_BITS);
        } catch (\Throwable) {
            return null;
        }
    }
}
