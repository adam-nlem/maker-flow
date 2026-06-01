import { useEffect, useState } from "react"
import { ChevronRightIcon, FolderIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { TextArea } from "~/components/ui/TextArea"
import Pill from "~/components/ui/Pill"
import { ProjectType, projectTypeOptions, projectTypeTranslationKeys } from "~/models/enums/ProjectType"
import { useCreateProject } from "~/hooks/api/projects/useCreateProject"
import { HttpException } from "~/services/httpClient/HttpException"
import FileUpload from "~/components/ui/FileUpload"

interface CreateProjectFormProps {
  onProjectCreated: (projectUuid: string) => void
  formSpacing?: string
  buttonStyle?: "primary" | "secondary"
}

export default function CreateProjectForm({ onProjectCreated, formSpacing = "space-y-4", buttonStyle }: CreateProjectFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [types, setTypes] = useState<ProjectType[]>([])
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)

  const [limitError, setLimitError] = useState(false)

  const { createProject, isPending } = useCreateProject()

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
    }
  }, [logoPreviewUrl])

  const handleLogoSelected = (file: File, previewUrl: string | null) => {
    setLogo(file)
    setLogoPreviewUrl(previewUrl)
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    try {
      const project = await createProject({ name, description, types, logo })

      if (!project) return;
      setName("")
      setDescription("")
      setTypes([])
      setLimitError(false)
      onProjectCreated(project.uuid)
    } catch (error) {
      if (error instanceof HttpException && error.response.httpStatus === 402) {
        setLimitError(true)
      }
    }
  }

  return (
    <form className={formSpacing} onSubmit={handleSubmit}>
      <Input
        label={t("projects:create.fields.name")}
        placeholder={t("projects:create.fields.namePlaceholder")}
        id="project-name"
        name="name"
        type="text"
        required
        value={name}
        className="size-12"
        icon={<FolderIcon className="size-4 text-muted-2" />}

        onChange={(e) => setName(e.target.value)}
      />

      <TextArea
        label={t("projects:create.fields.description")}
        placeholder={t("projects:create.fields.descriptionPlaceholder")}
        id="project-description"
        name="description"
        value={description}

        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        <h3 className="text-heading-sm">{t("projects:create.fields.types")}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {projectTypeOptions.map((type) => (
            <Pill
              key={type}
              label={t(projectTypeTranslationKeys[type])}
              isSelected={types.includes(type)}
              bgColorClassName="bg-primary/10"
              borderColorClassName="border border-primary/30"
              onClick={() => setTypes(prev =>
                prev.includes(type)
                  ? prev.filter(t => t !== type)
                  : [...prev, type]
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-heading-sm text-dark">{t("projects:create.fields.logo")}</p>
      <FileUpload
        accept="image/png"
        icon={PhotoIcon}
        hint={t("projects:create.fields.logoHint")}
        //errorMessage={validationErrorKey ? t(validationErrorKey) : null}
        isPending={isPending}
        onFileSelected={handleLogoSelected}
        className="h-50"
      />

      <Button
        type="submit"
        style={buttonStyle}
        className="mt-5"
        isLoading={isPending}
        disabled={isPending}
      >
        <div className="flex flex-row justify-center items-center gap-3">
          <p className="text-sm">{t("projects:create.submit")}</p>
          <ChevronRightIcon className="size-4" strokeWidth={2} />
        </div>
      </Button>

      {limitError && (
        <p className="text-body-xs text-danger text-center">
          {t("projects:create.limitReached")}
        </p>
      )}
    </form>
  )
}
