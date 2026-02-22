export enum OAuthErrorCode {
    InvalidState = 'invalid_state',
    MissingCode = 'missing_code',
    UserNotFound = 'user_not_found',
    TokenExchangeFailed = 'token_exchange_failed',
    PlatformError = 'platform_error',
    PopupBlocked = 'popup_blocked',
    Unknown = 'unknown',
}

export const oAuthErrorCodeToFrenchTranslation: Record<OAuthErrorCode, string> = {
    [OAuthErrorCode.InvalidState]: "Session expirée, veuillez réessayer",
    [OAuthErrorCode.MissingCode]: "Code d'autorisation manquant",
    [OAuthErrorCode.UserNotFound]: "Utilisateur introuvable",
    [OAuthErrorCode.TokenExchangeFailed]: "Échec de la connexion, veuillez réessayer",
    [OAuthErrorCode.PlatformError]: "Erreur de la plateforme d'authentification",
    [OAuthErrorCode.PopupBlocked]: "La fenêtre popup a été bloquée par votre navigateur",
    [OAuthErrorCode.Unknown]: "Une erreur est survenue, veuillez réessayer",
};
