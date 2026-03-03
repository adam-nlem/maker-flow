<?php

namespace App\Entity\Enum;

enum CreditTransactionType: string
{
    case SubscriptionRenewal = 'subscription_renewal';
    case TopupPurchase = 'topup_purchase';
    case ScriptGeneration = 'script_generation';
    case ScriptGenerationRefund = 'script_generation_refund';
    case Refund = 'refund';
    case ManualAdjustment = 'manual_adjustment';
}
