export enum OAuthErrorCode {
    InvalidState = 'invalid_state',
    MissingCode = 'missing_code',
    UserNotFound = 'user_not_found',
    TokenExchangeFailed = 'token_exchange_failed',
    PlatformError = 'platform_error',
    PopupBlocked = 'popup_blocked',
    Unknown = 'unknown',
}

export const oAuthErrorCodeTranslationKeys: Record<OAuthErrorCode, string> = {
    [OAuthErrorCode.InvalidState]: "enums:oAuthErrorCode.invalidState",
    [OAuthErrorCode.MissingCode]: "enums:oAuthErrorCode.missingCode",
    [OAuthErrorCode.UserNotFound]: "enums:oAuthErrorCode.userNotFound",
    [OAuthErrorCode.TokenExchangeFailed]: "enums:oAuthErrorCode.tokenExchangeFailed",
    [OAuthErrorCode.PlatformError]: "enums:oAuthErrorCode.platformError",
    [OAuthErrorCode.PopupBlocked]: "enums:oAuthErrorCode.popupBlocked",
    [OAuthErrorCode.Unknown]: "enums:oAuthErrorCode.unknown",
};
