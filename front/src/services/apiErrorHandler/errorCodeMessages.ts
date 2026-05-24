import i18n from '~/services/i18n/i18n'
import { HttpException } from '~/services/httpClient/HttpException'
import { FileInvalidReason, fileInvalidReasonTranslationKeys } from '~/models/enums/FileInvalidReason'

const FALLBACK_KEY = 'errors:fallback'

type ErrorMessageResolver = (meta: Record<string, unknown>) => string

function resolveFileInvalidReason(meta: Record<string, unknown>, fallbackKey: string): string {
  const reason = typeof meta.reason === 'string' ? meta.reason : null
  const enumValue = (Object.values(FileInvalidReason) as string[]).includes(reason ?? '')
    ? (reason as FileInvalidReason)
    : null
  return enumValue ? fileInvalidReasonTranslationKeys[enumValue] : fallbackKey
}

export const errorCodeKeys: Record<number, string | ErrorMessageResolver> = {
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
  27002: 'errors:agency.alreadyExists',
  27003: 'errors:agency.subscriptionInactive',
  27004: (meta) => resolveFileInvalidReason(meta, 'errors:agency.logoInvalid'),

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

  // ProjectClient (30xxx)
  30001: 'errors:projectClient.notFound',

  // AgencyCollaborator (31xxx)
  31001: 'errors:agencyCollaborator.notFound',

  // Onboarding (32xxx)
  32001: 'errors:onboarding.invalidStep',

  // Review (33xxx)
  33001: (meta) => resolveFileInvalidReason(meta, 'errors:review.fileInvalid'),
  33002: 'errors:review.notFound',
  33003: 'errors:review.scriptAlreadyHasReview',
  33004: 'errors:review.locked',
  33005: 'errors:review.unresolvableAgency',
  33008: 'errors:review.notPending',
  33010: 'errors:review.notLatestVersion',
  33011: 'errors:review.commentEmpty',
  33014: 'errors:review.commentParentNotFound',
  33015: 'errors:review.commentReplyCannotHaveTimecode',
  33016: 'errors:review.commentNotFound',
  33017: 'errors:review.commentStatusInvalid',
  33018: 'errors:review.commentStatusOnReplyForbidden',
  33019: 'errors:review.commentEditForbidden',
  33020: 'errors:review.commentTimecodeOnReplyForbidden',
  33021: 'errors:review.coverSourceNotFound',
  33022: 'errors:review.coverGenerationFailed',
}

export function resolveErrorMessage(error: unknown): string {
  if (error instanceof HttpException) {
    const entry = errorCodeKeys[error.response.code]
    const key = typeof entry === 'function' ? entry(error.response.meta) : entry ?? FALLBACK_KEY
    return i18n.t(key)
  }
  return i18n.t(FALLBACK_KEY)
}
