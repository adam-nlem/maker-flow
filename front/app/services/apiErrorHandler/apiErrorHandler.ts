import { CustomHttpException, UnauthorizedException } from '~/services/httpClient/customHttpExceptions'
import { useToastStore } from '~/stores/toast/toastStore'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'La requête est invalide',
  403: "Vous n'avez pas les droits pour effectuer cette action",
  404: 'Ressource introuvable',
  408: 'Le serveur a mis trop longtemps à répondre',
  409: 'Un conflit est survenu',
  500: 'Une erreur interne est survenue',
}

const DEFAULT_MESSAGE = 'Une erreur est survenue'

function extractBackendMessage(data: unknown): string | null {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.message === 'string') return d.message
    if (typeof d.Message === 'string') return d.Message
  }
  return null
}

export function handleMutationError(error: unknown): void {
  console.log(error);
  if (error instanceof UnauthorizedException) {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    return
  }

  let message = DEFAULT_MESSAGE

  if (error instanceof CustomHttpException) {
    const backendMessage = extractBackendMessage(error.data)
    const statusHasBackendMessage = [400, 409].includes(error.statusCode)

    message = (statusHasBackendMessage && backendMessage)
      ? backendMessage
      : (STATUS_MESSAGES[error.statusCode] ?? DEFAULT_MESSAGE)
  }

  useToastStore.getState().addToast('error', message)
}
