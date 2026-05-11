import i18n from '~/services/i18n/i18n'
import { HttpException } from '~/services/httpClient/HttpException'

const FALLBACK_KEY = 'errors:fallback'

export const errorCodeKeys: Record<number, string> = {
  // Integration (10xxx)
  10001: 'errors:integration.expired',
  10002: 'errors:integration.notFound',
  10003: 'errors:integration.alreadyConnected',

  // AiClient (11xxx)
  11001: 'errors:aiClient.retryable',
  11002: 'errors:aiClient.permanent',

  // Credit (12xxx)
  12001: 'errors:credit.insufficient',

  // Stripe (13xxx)
  13001: 'errors:stripe.checkoutFailed',
  13002: 'errors:stripe.invalidWebhookSignature',
  13003: 'errors:stripe.subscriptionFailed',
  13004: 'errors:stripe.noActiveSubscription',
  13005: 'errors:stripe.missingSignature',
  13006: 'errors:stripe.subscriptionRequired',

  // Mailing (14xxx)
  14001: 'errors:mailing.retryable',

  // OTP (15xxx)
  15001: 'errors:otp.incorrect',
  15002: 'errors:otp.expired',
  15003: 'errors:otp.tooManyAttempts',
  15004: 'errors:otp.invalidSession',
  15005: 'errors:otp.expiredSession',

  // Prelaunch (16xxx)
  16001: 'errors:prelaunch.tooManyAttempts',
  16002: 'errors:prelaunch.subscriberNotFound',
  16003: 'errors:prelaunch.featureUnavailable',

  // Project (17xxx)
  17001: 'errors:project.notFound',
  17002: 'errors:project.nameTaken',
  17003: 'errors:project.limitReached',
  17004: 'errors:project.alreadyClosed',
  17005: 'errors:project.alreadyOpened',

  // Script (18xxx)
  18001: 'errors:script.notFound',
  18002: 'errors:script.limitReached',
  18005: 'errors:script.tagNotFound',
  18006: 'errors:script.tagTitleTaken',

  // TodoList (19xxx)
  19001: 'errors:todoList.listNotFound',
  19002: 'errors:todoList.taskNotFound',
  19003: 'errors:todoList.tagNotFound',
  19004: 'errors:todoList.tagTitleTaken',

  // Post (20xxx)
  20001: 'errors:post.notFound',
  20002: 'errors:post.thumbnailNotFound',
  20003: 'errors:post.groupNotFound',

  // User (21xxx)
  21001: 'errors:user.invalidPassword',
  21002: 'errors:user.incorrectCurrentPassword',
  21003: 'errors:user.passwordMismatch',
  21004: 'errors:user.missingPasswordFields',

  // Validation (22xxx)
  22001: 'errors:validation.duplicateValue',

  // Auth (23xxx)
  23001: 'errors:auth.missingCredentials',
  23002: 'errors:auth.invalidCredentials',
  23003: 'errors:auth.sessionExpired',
  23004: 'errors:auth.tokenExpired',
  23005: 'errors:auth.invalidSession',
  23006: 'errors:auth.emailNotVerified',

  // Chat (24xxx)
  24001: 'errors:chat.notFound',

  // ScriptPart (25xxx)
  25001: 'errors:scriptPart.notFound',

  // ScriptPartSuggestion (26xxx)
  26001: 'errors:scriptPartSuggestion.notFound',
  26002: 'errors:scriptPartSuggestion.notPending',

  // Agency (27xxx)
  27001: 'errors:agency.missing',
  27003: 'errors:agency.subscriptionInactive',

  // HookTemplate (28xxx)
  28001: 'errors:hookTemplate.notFound',
  28002: 'errors:hookTemplate.modificationForbidden',

  // Invitation (29xxx)
  29001: 'errors:invitation.notFound',
  29002: 'errors:invitation.expired',
  29003: 'errors:invitation.alreadyUsed',
  29004: 'errors:invitation.emailAlreadyUsed',
  29005: 'errors:invitation.invalidRole',
  29006: 'errors:invitation.invalidType',
  29007: 'errors:invitation.invalidProject',
}

export function resolveErrorMessage(error: unknown): string {
  if (error instanceof HttpException) {
    return i18n.t(errorCodeKeys[error.response.code] ?? FALLBACK_KEY)
  }
  return i18n.t(FALLBACK_KEY)
}
