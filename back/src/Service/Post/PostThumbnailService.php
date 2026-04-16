<?php

namespace App\Service\Post;

use App\Entity\Enum\Platform;
use App\Entity\Post;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PostThumbnailService
{
    private const BASE_PATH = '/private/uploads/social-analytics/%s/post/thumbnail';
    private const EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly Filesystem $filesystem,
        private readonly ParameterBagInterface $parameterBag,
    ) {}

    /**
     * Downloads a thumbnail from a URL and stores it on disk.
     */
    public function downloadAndStore(Post $post, string $thumbnailUrl): ?string
    {
        $directory = $this->getDirectory($post->getIntegration()->getPlatform());

        if (!$this->filesystem->exists($directory)) {
            $this->filesystem->mkdir($directory);
        }

        $extension = $this->getExtensionFromUrl($thumbnailUrl);
        $filename = sprintf('%s.%s', $post->getUuid(), $extension);
        $filePath = sprintf('%s/%s', $directory, $filename);

        $response = $this->httpClient->request('GET', $thumbnailUrl);

        if ($response->getStatusCode() !== 200) {
            return null;
        }

        $this->filesystem->dumpFile($filePath, $response->getContent());

        return $filePath;
    }

    /**
     * Resolves the file path of an existing thumbnail on disk.
     */
    public function getPath(Post $post): ?string
    {
        $directory = $this->getDirectory($post->getIntegration()->getPlatform());

        foreach (self::EXTENSIONS as $extension) {
            $filePath = sprintf('%s/%s.%s', $directory, $post->getUuid(), $extension);
            if (file_exists($filePath)) {
                return $filePath;
            }
        }

        return null;
    }

    /**
     * Returns the thumbnail as a File object, or null if not found.
     */
    public function getFile(Post $post): ?File
    {
        $path = $this->getPath($post);

        if ($path === null) {
            return null;
        }

        return new File($path, false);
    }

    private function getDirectory(Platform $platform): string
    {
        $projectDir = $this->parameterBag->get('kernel.project_dir');

        return sprintf('%s%s', $projectDir, sprintf(self::BASE_PATH, $platform->value));
    }

    private function getExtensionFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        $extension = pathinfo($path, PATHINFO_EXTENSION);

        return $extension ?: 'jpg';
    }
}
