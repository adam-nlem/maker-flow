import { useLocation } from "react-router-dom";
import { agencySettingsPath } from "~/routes/routePaths";
import TopBarShell from "./TopBarShell";
import { agencyTopBarActions } from "./agencyTopBarActions";

export default function AgencyTopBar() {
    const location = useLocation();
    const ActionComponent = agencyTopBarActions[location.pathname];

    const brand = (
        <span className="text-heading-sm text-dark hidden sm:inline">MakerFlow</span>
    );

    return (
        <TopBarShell
            brand={brand}
            settingsPath={agencySettingsPath}
            actions={ActionComponent ? <ActionComponent /> : null}
        />
    );
}
