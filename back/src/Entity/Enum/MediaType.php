<?php

namespace App\Entity\Enum;

enum MediaType: string
{
    case Video = 'video';
    case Image = 'image';
    case Carousel = 'carousel';
}
