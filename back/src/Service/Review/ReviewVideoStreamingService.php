<?php

namespace App\Service\Review;

use App\Entity\ReviewVersion;
use App\Exception\Review\VideoProcessingFailedException;
use App\Exception\Review\VideoSourceNotFoundException;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class ReviewVideoStreamingService
{
    public function __construct(
        private readonly ReviewFileService $reviewFileService,
        private readonly Filesystem $filesystem,
        private readonly string $ffmpegBinary = 'ffmpeg',
        private readonly string $ffprobeBinary = 'ffprobe',
    ) {}

    public function generateHls(ReviewVersion $reviewVersion): void
    {
        $sourceFile = $this->reviewFileService->getFileByIndex($reviewVersion, 1);

        if ($sourceFile === null) {
            throw new VideoSourceNotFoundException($reviewVersion->getUuid());
        }

        $sourcePath = $sourceFile->getPathname();
        $streamDirectory = sprintf('%s/stream', $this->reviewFileService->getReviewVersionDirectory($reviewVersion));

        if ($this->filesystem->exists($streamDirectory)) {
            $this->filesystem->remove($streamDirectory);
        }

        $this->filesystem->mkdir([
            "$streamDirectory/1080p",
            "$streamDirectory/720p",
            "$streamDirectory/480p",
        ]);

        $hasAudio = $this->hasAudioStream($sourcePath);

        $process = new Process([
            $this->ffmpegBinary, '-y', '-i', $sourcePath,
            '-filter_complex', '[0:v]split=3[v0][v1][v2]; [v0]scale=-2:1080[v0out]; [v1]scale=-2:720[v1out]; [v2]scale=-2:480[v2out]',
            ...$this->buildVariantArgs($hasAudio),
            '-f', 'hls',
            '-hls_time', '4',
            '-hls_playlist_type', 'vod',
            '-hls_segment_filename', "$streamDirectory/%v/segment_%03d.ts",
            '-master_pl_name', 'master.m3u8',
            '-var_stream_map', $this->buildVarStreamMap($hasAudio),
            "$streamDirectory/%v/index.m3u8",
        ]);
        $process->setTimeout(null);

        try {
            $process->mustRun();
        } catch (ProcessFailedException $exception) {
            throw new VideoProcessingFailedException(
                $reviewVersion->getUuid(),
                'ffmpeg exited with a non-zero status.',
                $exception,
            );
        }

        foreach ([
            "$streamDirectory/master.m3u8",
            "$streamDirectory/1080p/index.m3u8",
            "$streamDirectory/720p/index.m3u8",
            "$streamDirectory/480p/index.m3u8",
        ] as $artifact) {
            if (!is_file($artifact)) {
                throw new VideoProcessingFailedException(
                    $reviewVersion->getUuid(),
                    sprintf('Expected HLS artifact missing on disk: %s', $artifact),
                );
            }
        }

        $this->filesystem->remove($sourcePath);
    }

    private function hasAudioStream(string $sourcePath): bool
    {
        $process = new Process([
            $this->ffprobeBinary,
            '-v', 'error',
            '-select_streams', 'a',
            '-show_entries', 'stream=index',
            '-of', 'csv=p=0',
            $sourcePath,
        ]);

        try {
            $process->mustRun();
        } catch (ProcessFailedException) {
            return false;
        }

        return trim($process->getOutput()) !== '';
    }

    /**
     * @return list<string>
     */
    private function buildVariantArgs(bool $hasAudio): array
    {
        $variants = [
            ['label' => 'v0out', 'videoBitrate' => '5000k', 'audioBitrate' => '128k'],
            ['label' => 'v1out', 'videoBitrate' => '2800k', 'audioBitrate' => '128k'],
            ['label' => 'v2out', 'videoBitrate' => '1400k', 'audioBitrate' => '96k'],
        ];

        $args = [];
        foreach ($variants as $index => $variant) {
            $args = [
                ...$args,
                '-map', sprintf('[%s]', $variant['label']),
                sprintf('-c:v:%d', $index), 'libx264',
                sprintf('-b:v:%d', $index), $variant['videoBitrate'],
            ];

            if ($hasAudio) {
                $args = [
                    ...$args,
                    '-map', '0:a:0',
                    sprintf('-c:a:%d', $index), 'aac',
                    sprintf('-b:a:%d', $index), $variant['audioBitrate'],
                ];
            }
        }

        return $args;
    }

    private function buildVarStreamMap(bool $hasAudio): string
    {
        $names = ['1080p', '720p', '480p'];

        $entries = [];
        foreach ($names as $index => $name) {
            $entries[] = $hasAudio
                ? sprintf('v:%d,a:%d,name:%s', $index, $index, $name)
                : sprintf('v:%d,name:%s', $index, $name);
        }

        return implode(' ', $entries);
    }
}
