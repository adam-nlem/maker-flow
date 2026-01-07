import { useNavigate } from "react-router";
import { useShowModuleIcon } from "~/hooks/modules/useShowModuleIcon";
import type { Module } from "~/models/Module";
import type { UserModule } from "~/models/UserModule";
import { Button } from "../ui/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useCreateUserModule } from "~/hooks/userModules/useCreateUserModule";
import type { Project } from "~/models/Project";

interface ModuleCardProps {
  project: Project,
  module: Module,
  userModule?: UserModule,
  onUserModuleCreated: (userModule: UserModule) => void,
}
export default function ModuleCard({ module, userModule, project, onUserModuleCreated }: ModuleCardProps) {
  const { createUserModule, errorMessage, isSubmitting } = useCreateUserModule({ moduleUuid: module.uuid, projectUuid: project.uuid });
  const { iconUrl } = useShowModuleIcon(module.moduleIdentifier);

  return <div className="border border-light-gray rounded-md p-3 basis-1/5 min-h-[220px] cursor-pointer">
    <div className="flex flex-row justify-between">
      <div className="w-8 h-8 rounded-sm shrink-0 mb-3">
        {iconUrl && <img className="" src={iconUrl} alt={`${module.title} Icon`} />}
      </div>
      <Button
        disabled={!!userModule}
        onClick={async () => {
          if (!userModule) {
            const newUserModule = await createUserModule()
            if (newUserModule && errorMessage === null) {
              onUserModuleCreated(newUserModule)
            }
          }
        }
        }
      >
        <div className="flex flex-row justify-center items-center gap-1 shrink-0 ">
          <p className="text-sm ">Activer</p>
          <PlusIcon className="size-4 text-clear" strokeWidth={2} />
        </div>
      </Button>
    </div>
    <h1 className="text-heading-sm">{module.title}</h1>
    {module.description && <p className="text-body-sm">{module.description}</p>}
  </div>
}
