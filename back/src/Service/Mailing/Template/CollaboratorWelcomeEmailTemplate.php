<?php

namespace App\Service\Mailing\Template;

class CollaboratorWelcomeEmailTemplate extends AbstractEmailTemplate
{
    public function __construct(
        string $recipientEmail,
        string $recipientName,
        private readonly string $agencyName,
        private readonly string $inviterName,
        private readonly string $roleLabel,
        private readonly string $setupUrl,
    ) {
        parent::__construct($recipientEmail, $recipientName);
    }

    protected function getSubject(): string
    {
        return sprintf("Rejoignez l'agence %s sur MakerFlow", $this->agencyName);
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
            <h2 style="color: #141115; margin-bottom: 24px;">Vous avez été invité(e) sur MakerFlow</h2>
            <p>Bonjour {$this->to->getName()},</p>
            <p><strong>{$this->inviterName}</strong> vous a invité(e) à rejoindre l'agence <strong>{$this->agencyName}</strong> en tant que <strong>{$this->roleLabel}</strong>.</p>
            <p>Pour activer votre compte, définissez votre mot de passe en cliquant sur le bouton ci-dessous.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{$this->setupUrl}" style="display: inline-block; background-color: #141115; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Définir mon mot de passe</a>
            </div>
            <p style="color: #666; font-size: 14px;">Ce lien d'invitation expire dans 7 jours.</p>
        </body>
        </html>
        HTML;
    }
}
