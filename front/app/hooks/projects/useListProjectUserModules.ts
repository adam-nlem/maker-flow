import { useState, useEffect } from "react";
import { UserModule, type UserModuleJSON } from "~/models/UserModule";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";

export function useListProjectUserModules(projectUuid?: string) {
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!projectUuid) {
      setUserModules([])
      setIsLoading(false)
      return;
    }

    const listUserModules = async () => {
      setIsLoading(true)
      try {
        console.log("fecthing usermodules")
        const res = await httpClient.get(`/projects/${projectUuid}/user-modules`)
        const modulesData = res.data.map((json: UserModuleJSON) => UserModule.fromJSON(json))
        setUserModules(modulesData)
        setErrorMessage(null)
      } catch (err) {
        setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue")
      } finally {
        setIsLoading(false)
      }
    };

    listUserModules()
  }, [projectUuid])

  function syncUserModuleInList(newUserModule: UserModule) {
    setUserModules(prev => {
      let replaced = false;

      const updated = prev.map(userModule => {
        if (userModule.uuid === newUserModule.uuid) {
          replaced = true;
          return newUserModule;
        }
        return userModule;
      });

      return replaced ? updated : [...updated, newUserModule];
    });
  }



  return {
    userModules,
    syncUserModuleInList, isLoading,
    errorMessage
  }
}
