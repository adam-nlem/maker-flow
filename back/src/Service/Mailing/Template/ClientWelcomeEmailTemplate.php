<?php

namespace App\Service\Mailing\Template;

class ClientWelcomeEmailTemplate extends AbstractEmailTemplate
{
    public function __construct(
        string $recipientEmail,
        string $recipientName,
        private readonly string $agencyName,
        private readonly ?string $brandColor,
        private readonly ?string $contactEmail,
        private readonly string $setupUrl,
    ) {
        parent::__construct($recipientEmail, $recipientName);
    }

    protected function getSubject(): string
    {
        return sprintf('Bienvenue sur votre portail %s', $this->agencyName);
    }

    protected function getHtmlBody(): string
    {
        $accentColor = $this->brandColor ?? '#141115';
        $contactLine = $this->contactEmail !== null
            ? sprintf('<p style="color: #666; font-size: 14px;">Pour toute question, vous pouvez contacter votre agence à <a href="mailto:%1$s" style="color: %2$s;">%1$s</a>.</p>', htmlspecialchars($this->contactEmail), $accentColor)
            : '';

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #141115;">
            <h2 style="color: {$accentColor}; margin-bottom: 24px;">Bienvenue sur votre portail {$this->agencyName}</h2>
            <p>Bonjour {$this->to->getName()},</p>
            <p>Votre agence <strong>{$this->agencyName}</strong> a créé un espace dédié dans lequel vous pourrez suivre les performances de votre marque et vos contenus.</p>
            <p>Pour accéder à votre portail, définissez votre mot de passe en cliquant sur le bouton ci-dessous.</p>
            <p style="background-color: #FFF7E6; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 16px 0; color: #141115;">
                <strong>Important :</strong> vous devez utiliser ce lien pour accéder à votre portail <strong>{$this->agencyName}</strong>.
                Une inscription via le formulaire public créerait un compte séparé sans accès aux contenus de votre marque.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{$this->setupUrl}" style="display: inline-block; background-color: {$accentColor}; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Définir mon mot de passe</a>
            </div>
            {$contactLine}
            <p style="color: #666; font-size: 14px;">Ce lien d'invitation expire dans 7 jours.</p>
        </body>
        </html>
        HTML;
    }
}
