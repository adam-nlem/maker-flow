<?php

namespace App\Entity\Enum;

enum StripeEventType: string
{
    case InvoicePaid = 'invoice.paid';
    case InvoicePaymentFailed = 'invoice.payment_failed';
    case CustomerSubscriptionCreated = 'customer.subscription.created';
    case CustomerSubscriptionUpdated = 'customer.subscription.updated';
    case CustomerSubscriptionDeleted = 'customer.subscription.deleted';
    case CheckoutSessionCompleted = 'checkout.session.completed';
}
