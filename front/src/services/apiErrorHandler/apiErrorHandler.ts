import * as Sentry from "@sentry/react"
import { HttpException } from '~/services/httpClient/HttpException'
import { ToastType } from '~/models/enums/ToastType'
import { useToastStore } from '~/stores/toast/toastStore'
import { loginPath } from '~/routes/routePaths'
import { clearSessionData } from '~/services/session/clearSessionData'
import { resolveErrorMessage } from './errorCodeMessages'

export function handleMutationError(error: unknown): void {
  if (!(error instanceof HttpException)) {
    Sentry.captureException(error)
    return
  }

  if (error.response.httpStatus === 401) {
    clearSessionData()
    if (window.location.pathname !== loginPath) {
      window.location.href = loginPath
    }
    return
  }

  if (error.response.httpStatus >= 500) {
    Sentry.captureException(error)
  }

  useToastStore.getState().addToast(ToastType.Error, resolveErrorMessage(error))
}
