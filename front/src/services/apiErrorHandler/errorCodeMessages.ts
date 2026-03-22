import { HttpException } from '~/services/httpClient/HttpException'

export const errorCodeMessages: Record<number, string> = {
  // Integration (10xxx)
  10001: 'Votre connexion a expiré. Veuillez vous reconnecter.',
  10002: 'Intégration introuvable.',
  10003: 'Ce projet a déjà une intégration pour cette plateforme.',

  // Credit (12xxx)
  12001: "Vous n'avez pas assez de crédits.",

  // Stripe (13xxx)
  13001: 'Impossible de créer la session de paiement.',
  13002: 'Signature de webhook invalide.',
  13003: "Impossible de gérer l'abonnement.",
  13004: 'Aucun abonnement actif trouvé.',
  13005: 'Signature Stripe manquante.',

  // OTP (15xxx)
  15001: 'Code incorrect.',
  15002: 'Code expiré. Veuillez en demander un nouveau.',
  15003: 'Nombre maximum de tentatives atteint. Veuillez renvoyer un nouveau code.',
  15004: 'Session invalide ou expirée.',
  15005: 'Session invalide ou expirée.',

  // Prelaunch (16xxx)
  16001: 'Trop de tentatives. Veuillez réessayer plus tard.',
  16002: 'Abonné introuvable.',
  16003: 'Fonctionnalité indisponible.',

  // Project (17xxx)
  17001: 'Projet introuvable.',
  17002: 'Ce nom de projet est déjà utilisé.',
  17003: 'Vous avez atteint la limite de projets pour votre abonnement.',
  17004: 'Ce projet est déjà terminé.',
  17005: 'Ce projet est déjà ouvert.',

  // Script (18xxx)
  18001: 'Script introuvable.',
  18002: 'Vous avez atteint la limite de scripts pour votre abonnement.',
  18003: 'Génération introuvable.',
  18004: 'Plan introuvable.',
  18005: 'Tag introuvable.',
  18006: 'Ce titre de tag est déjà utilisé.',

  // TodoList (19xxx)
  19001: 'Liste introuvable.',
  19002: 'Tâche introuvable.',
  19003: 'Tag introuvable.',
  19004: 'Ce titre de tag est déjà utilisé.',

  // Validation (22xxx)
  22001: 'Cette valeur est déjà utilisée.',

  // Fallback
  99999: 'Une erreur est survenue',
}

export function resolveErrorMessage(error: unknown): string {
  if (error instanceof HttpException) {
    return errorCodeMessages[error.response.code] ?? errorCodeMessages[99999]
  }
  return errorCodeMessages[99999]
}
