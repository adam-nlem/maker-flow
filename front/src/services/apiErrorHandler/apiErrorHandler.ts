import * as Sentry from "@sentry/react";
import {
  BadRequestException,
  ConflictException,
  CustomHttpException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  PaymentRequiredException,
  TimeoutException,
  UnauthorizedException,
} from '~/services/httpClient/customHttpExceptions'
import { ToastType } from '~/models/enums/ToastType'
import { useToastStore } from '~/stores/toast/toastStore'
import { loginPath } from '~/routes/routePaths'
import { clearSessionData } from '~/services/session/clearSessionData'

function extractBackendMessage(data: unknown): string | null {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.message === 'string') return d.message
    if (typeof d.Message === 'string') return d.Message
  }
  return null
}

export function handleMutationError(error: CustomHttpException): void {
  if (error instanceof UnauthorizedException) {
    clearSessionData()
    if (window.location.pathname !== loginPath) {
      window.location.href = loginPath
    }
    return
  }

  let message: string

  switch (error.constructor) {
    case BadRequestException:
      message = extractBackendMessage((error as CustomHttpException).data) ?? 'La requête est invalide'
      break
    case ForbiddenException:
      message = "Vous n'avez pas les droits pour effectuer cette action"
      break
    case PaymentRequiredException:
      message = "Votre abonnement ne vous permet pas d'effectuer cette action"
      break
    case NotFoundException:
      message = 'Ressource introuvable'
      break
    case TimeoutException:
      message = 'Le serveur a mis trop longtemps à répondre'
      break
    case ConflictException:
      message = extractBackendMessage((error as CustomHttpException).data) ?? 'Un conflit est survenu'
      break
    case InternalServerException:
      Sentry.captureException(error);
      message = 'Une erreur interne est survenue'
      break
    default:
      message = 'Une erreur est survenue'
  }

  useToastStore.getState().addToast(ToastType.Error, message)
}
