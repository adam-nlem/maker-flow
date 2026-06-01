import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"

export default function OnboardingProgressBar() {
  const { currentStepIndex: currentStep, totalSteps } = useOnboardingFlow()

  const pastStepNumbers = Array.from({ length: currentStep }, (_, i) => i + 1)
  const futureStepNumbers = Array.from(
    { length: totalSteps - currentStep - 1 },
    (_, i) => currentStep + 2 + i,
  )

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-2 shrink-0">
        {pastStepNumbers.map((number) => (
          stepNumber(number, "bg-pale-gray-2", "text-clear")
        ))}
        {stepNumber(currentStep + 1, "bg-primary", "text-clear")}
      </div>
      <div className="h-px flex-1 bg-pale-gray-2" />
      {futureStepNumbers.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {futureStepNumbers.map((number) => (
            stepNumber(number, "bg-dark", "text-clear")))}
        </div>
      )}
    </div>
  )

  function stepNumber(number: number, bgClassName: string, textClassName: string) {
    return <div key={number} className={`${bgClassName} ${textClassName} flex items-center justify-center size-7 rounded-md text-sm shrink-0`} >
      {number}
    </div >

  }
}
