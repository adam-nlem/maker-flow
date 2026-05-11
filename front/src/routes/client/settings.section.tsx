import { Navigate, useParams } from "react-router-dom";
import { clientSettingsGeneralPath } from "~/routes/routePaths";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { getSettingsSectionsForRoles, settingsSectionToPath } from "~/models/enums/SettingsSection";
import GeneralSettings from "~/components/settings/GeneralSettings";

export default function ClientSettingsSectionRoute() {
    const { section } = useParams();
    const { user } = useCurrentUser();

    if (!section) return <Navigate to={clientSettingsGeneralPath} replace />;

    const visibleSections = getSettingsSectionsForRoles(user?.roles ?? []);
    const matchedSection = visibleSections.find((s) => settingsSectionToPath[s] === section);

    if (!matchedSection) return <Navigate to={clientSettingsGeneralPath} replace />;

    return <GeneralSettings />;
}
