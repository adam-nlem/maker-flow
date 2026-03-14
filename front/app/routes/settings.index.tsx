import { Navigate } from "react-router";
import { settingsGeneralPath } from "~/routes/routePaths";

export default function SettingsIndex() {
    return <Navigate to={settingsGeneralPath} replace />;
}
