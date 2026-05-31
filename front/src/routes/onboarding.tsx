import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { homePath } from "~/routes/routePaths"

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { isAuthLoading, isAuthenticated, currentStepConfig } = useOnboardingFlow()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(homePath, { replace: true })
    }
  }, [isAuthLoading, isAuthenticated, navigate])

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="bg-clear bg-dot-pattern h-screen flex flex-row gap-3 items-center overflow-y-auto">
      {currentStepConfig?.stepComponent ?? null}
      {currentStepConfig?.previewComponent ?? null}
    </div>
  )
}
