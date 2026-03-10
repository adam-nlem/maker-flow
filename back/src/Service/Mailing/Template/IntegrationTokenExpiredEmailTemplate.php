<?php

namespace App\Service\Mailing\Template;

class IntegrationTokenExpiredEmailTemplate extends AbstractEmailTemplate
{
    public function __construct(
        string $recipientEmail,
        string $recipientName,
        private readonly string $platformName,
        private readonly string $accountName,
        private readonly string $reconnectUrl,
    ) {
        parent::__construct($recipientEmail, $recipientName);
    }

    protected function getSubject(): string
    {
        return sprintf('MakerFlow — Reconnexion requise pour votre compte %s', $this->platformName);
    }

    protected function getHtmlBody(): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #141115;">
            <h2 style="color: #141115; margin-bottom: 24px;">Reconnexion requise</h2>
            <p>Bonjour {$this->to->getName()},</p>
            <p>La connexion à votre compte <strong>{$this->platformName}</strong> (<strong>{$this->accountName}</strong>) a expiré ou a été révoquée.</p>
            <p>Vos données analytiques ne peuvent plus être collectées tant que vous ne vous êtes pas reconnecté(e).</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{$this->reconnectUrl}" style="display: inline-block; background-color: #141115; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Se reconnecter</a>
            </div>
            <p style="color: #666; font-size: 14px;">Vos données existantes sont conservées. Seule la collecte de nouvelles données est interrompue.</p>
        </body>
        </html>
        HTML;
    }
}
