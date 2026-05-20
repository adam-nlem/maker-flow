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

        $process = new Process([
            $this->ffmpegBinary, '-y', '-i', $sourcePath,
            '-filter_complex', '[0:v]split=3[v0][v1][v2]; [v0]scale=-2:1080[v0out]; [v1]scale=-2:720[v1out]; [v2]scale=-2:480[v2out]',
            '-map', '[v0out]', '-c:v:0', 'libx264', '-b:v:0', '5000k', '-map', '0:a:0?', '-c:a:0', 'aac', '-b:a:0', '128k',
            '-map', '[v1out]', '-c:v:1', 'libx264', '-b:v:1', '2800k', '-map', '0:a:0?', '-c:a:1', 'aac', '-b:a:1', '128k',
            '-map', '[v2out]', '-c:v:2', 'libx264', '-b:v:2', '1400k', '-map', '0:a:0?', '-c:a:2', 'aac', '-b:a:2', '96k',
            '-f', 'hls',
            '-hls_time', '4',
            '-hls_playlist_type', 'vod',
            '-hls_segment_filename', "$streamDirectory/%v/segment_%03d.ts",
            '-master_pl_name', 'master.m3u8',
            '-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2',
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
}
