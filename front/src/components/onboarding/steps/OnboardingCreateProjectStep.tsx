import { useEffect, useState } from "react"
import { ArrowRightIcon, FolderIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import Pill from "~/components/ui/Pill"
import FileUpload from "~/components/ui/FileUpload"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import { ProjectType, projectTypeOptions, projectTypeTranslationKeys } from "~/models/enums/ProjectType"
import { useCreateProject } from "~/hooks/api/projects/useCreateProject"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { HttpException } from "~/services/httpClient/HttpException"

export default function OnboardingCreateProjectStep() {
  const { t } = useTranslation()
  const { createProject, isPending, validationErrorKey } = useCreateProject()
  const { advanceStep } = useAdvanceOnboardingStep()
  const setFocusedProjectUuid = useFocusProjectStore((s) => s.setFocusedProjectUuid)

  const projectName = useOnboardingStore((state) => state.projectName)
  const setProjectName = useOnboardingStore((state) => state.setProjectName)
  const projectLogoPreviewUrl = useOnboardingStore((state) => state.projectLogoPreviewUrl)
  const setProjectLogoPreviewUrl = useOnboardingStore((state) => state.setProjectLogoPreviewUrl)
  const projectTypes = useOnboardingStore((state) => state.projectTypes)
  const setProjectTypes = useOnboardingStore((state) => state.setProjectTypes)

  const [logo, setLogo] = useState<File | null>(null)
  const [limitError, setLimitError] = useState(false)

  useEffect(() => {
    return () => {
      if (projectLogoPreviewUrl) URL.revokeObjectURL(projectLogoPreviewUrl)
    }
  }, [projectLogoPreviewUrl])

  const handleLogoSelected = (file: File, previewUrl: string | null) => {
    setLogo(file)
    setProjectLogoPreviewUrl(previewUrl)
  }

  const toggleType = (type: ProjectType) => {
    setProjectTypes(
      projectTypes.includes(type)
        ? projectTypes.filter((t) => t !== type)
        : [...projectTypes, type]
    )
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const project = await createProject({ name: projectName, types: projectTypes, logo })
      if (!project) return
      setLimitError(false)
      setFocusedProjectUuid(project.uuid)
      await advanceStep()
    } catch (error) {
      if (error instanceof HttpException && error.response.httpStatus === 402) {
        setLimitError(true)
      }
    }
  }

  return (
    <OnboardingStepLayout>
      <form className="space-y-3 w-full" onSubmit={handleSubmit}>
        <Input
          label={t("projects:create.fields.name")}
          placeholder={t("projects:create.fields.namePlaceholder")}
          id="project-name"
          name="name"
          type="text"
          required
          value={projectName}
          className="size-12"
          icon={<FolderIcon className="size-4 text-muted-2" />}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <div>
          <h3 className="text-heading-sm">{t("projects:create.fields.types")}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {projectTypeOptions.map((type) => (
              <Pill
                key={type}
                label={t(projectTypeTranslationKeys[type])}
                isSelected={projectTypes.includes(type)}
                bgColorClassName="bg-primary/10"
                borderColorClassName="border border-primary/30"
                onClick={() => toggleType(type)}
              />
            ))}
          </div>
        </div>

        <p className="text-heading-sm text-dark">{t("projects:create.fields.logo")}</p>
        <FileUpload
          accept="image/png"
          icon={PhotoIcon}
          hint={t("projects:create.fields.logoHint")}
          errorMessage={validationErrorKey ? t(validationErrorKey) : null}
          isPending={isPending}
          onFileSelected={handleLogoSelected}
          className="h-50"
        />

        <Button
          type="submit"
          style="primary"
          className="mt-5"
          width="w-fit"
          height="h-11"
          isLoading={isPending}
          disabled={isPending}
        >
          <p className="text-sm">{t("projects:create.submit")}</p>
          <ArrowRightIcon className="size-4" />
        </Button>

        {limitError && (
          <p className="text-body-xs text-danger text-center">
            {t("projects:create.limitReached")}
          </p>
        )}
      </form>
    </OnboardingStepLayout>
  )
}
