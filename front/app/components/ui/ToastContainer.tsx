import { useEffect } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useToastStore, type Toast } from '~/stores/toast/toastStore'

const AUTO_DISMISS_MS = 5000

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast.id, removeToast])

  const isError = toast.type === 'error'

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-xl bg-clear shadow-lg ring-1 ring-dark/5 animate-toast-in">
      <div className="p-4">
        <div className="flex items-start">
          <div className="shrink-0">
            {isError
              ? <ExclamationCircleIcon aria-hidden="true" className="size-6 text-danger" />
              : <CheckCircleIcon aria-hidden="true" className="size-6 text-green-500" />
            }
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-heading-sm text-dark">{toast.message}</p>
          </div>
          <div className="ml-4 flex shrink-0">
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="inline-flex cursor-pointer rounded-md bg-clear text-gray hover:text-dark"
            >
              <span className="sr-only">Fermer</span>
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-sm flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
