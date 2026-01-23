import { useNavigate } from "react-router";
import { useShowModuleIcon } from "~/hooks/api/modules/useShowModuleIcon";
import type { UserModule } from "~/models/UserModule";

interface ModuleTileProps {
    isExpanded: boolean;
    userModule: UserModule;
}
export default function ModuleTile({ isExpanded, userModule }: ModuleTileProps) {
    const module = userModule.module;
    const navigate = useNavigate();
    const { iconUrl } = useShowModuleIcon(module.moduleIdentifier);

    return <div
        key={userModule.uuid}
        className={`flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-lg p-2 ${isExpanded ? '' : 'justify-center'}`}
        onClick={() => navigate(`/modules/${module.moduleIdentifier}`)}
    >
        <div className="w-6 h-6 rounded-md shrink-0">
            {iconUrl && <img src={iconUrl} alt={`${module.title} Icon`} />}
        </div>
        {isExpanded && <h1 className="text-heading-sm whitespace-nowrap">{module.title}</h1>}
    </div>
}