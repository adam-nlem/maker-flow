<?php

namespace App\Serializer;

use App\Helper\DateHelper;
use App\Helper\HeaderHelper;
use Symfony\Component\Serializer\Normalizer\DateTimeNormalizer;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class UserTimezoneDateTimeNormalizer implements NormalizerInterface
{
    private DateTimeNormalizer $dateTimeNormalizer;
    private RequestStack $requestStack;

    public function __construct(DateTimeNormalizer $dateTimeNormalizer, RequestStack $requestStack)
    {
        $this->dateTimeNormalizer = $dateTimeNormalizer;
        $this->requestStack = $requestStack;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            \DateTimeImmutable::class => true,
        ];
    }

    public function normalize($object, $format = null, array $context = []): string|array|int|float|bool|\ArrayObject|null
    {
        if ($object instanceof \DateTimeInterface) {
            $request = $this->requestStack->getCurrentRequest();

            // Only convert timezone if the request has the timezone header
            if ($request && HeaderHelper::hasTimezone($request)) {
                $userTZ = HeaderHelper::getTimezone($request);

                $object = new \DateTimeImmutable(DateHelper::convertToTZFromUTC($object, $userTZ));
            }
        }

        return $this->dateTimeNormalizer->normalize($object, $format, $context);
    }

    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return $data instanceof \DateTimeInterface;
    }
}
