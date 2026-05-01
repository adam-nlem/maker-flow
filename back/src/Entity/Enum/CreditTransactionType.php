<?php

namespace App\Entity\Enum;

enum CreditTransactionType: string
{
    case SubscriptionRenewal = 'subscription_renewal';
    case RefillPurchase = 'refill_purchase';
    case ScriptGeneration = 'script_generation';
    case ScriptGenerationRefund = 'script_generation_refund';
    case Refund = 'refund';
    case ManualAdjustment = 'manual_adjustment';
    case WelcomeBonus = 'welcome_bonus';
    case ChatGeneration = 'chat_generation';
    case ChatGenerationRefund = 'chat_generation_refund';
}
