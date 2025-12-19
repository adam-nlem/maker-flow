import { useState } from "react";
import { UserModule } from "~/models/UserModule";
import { ConflictException, NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";

export function useCreateUserModule({ moduleUuid, projectUuid }: { moduleUuid: string, projectUuid: string }) {

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function createUserModule(): Promise<UserModule | undefined> {
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const res = await httpClient.post('/user-modules', {
        "moduleUuid": moduleUuid,
        "projectUuid": projectUuid
      })

      setErrorMessage(null)
      setIsSubmitting(false)

      return UserModule.fromJSON(res.data)
    } catch (err) {
      let message
      if (err instanceof ConflictException) {

        message = "Vous avez déjà activé ce Module pour ce Projet"
      } else if (err instanceof NotFoundException) {
        message = "Ce Module ou Projet n'existe pas"
      }
      else {
        message = "Une erreur est survenue lors de la création du Projet"
      }
      setErrorMessage(err instanceof Error ? err.message : message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    createUserModule,
    errorMessage,
    isSubmitting,
  }
}
