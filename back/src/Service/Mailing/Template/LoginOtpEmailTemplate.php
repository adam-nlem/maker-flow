<?php

namespace App\Service\Mailing\Template;

class LoginOtpEmailTemplate extends AbstractEmailTemplate
{
    public function __construct(
        string $recipientEmail,
        string $recipientName,
        private readonly string $code,
    ) {
        parent::__construct($recipientEmail, $recipientName);
    }

    protected function getSubject(): string
    {
        return 'Votre code de connexion MakerFlow';
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
            <h2 style="color: #141115; margin-bottom: 24px;">Connexion à MakerFlow</h2>
            <p>Bonjour {$this->to->getName()},</p>
            <p>Voici votre code de vérification pour vous connecter :</p>
            <div style="text-align: center; margin: 32px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background-color: #f5f5f5; padding: 16px 32px; border-radius: 8px; display: inline-block;">{$this->code}</span>
            </div>
            <p>Ce code expire dans <strong>10 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé ce code, nous vous conseillions de modifier votre mot de passe</p>
        </body>
        </html>
        HTML;
    }
}
